package com.elearning.marugoto.config;

import com.elearning.marugoto.model.dto.CanDoImportDTO;
import com.elearning.marugoto.model.dto.TopicsImportDTO;
import com.elearning.marugoto.model.entity.CanDo;
import com.elearning.marugoto.model.entity.Lesson;
import com.elearning.marugoto.model.entity.Topic;
import com.elearning.marugoto.repository.jpa.CanDoRepository;
import com.elearning.marugoto.repository.jpa.LessonRepository;
import com.elearning.marugoto.repository.jpa.TopicRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Configuration
public class DatabaseSeeder {

    @Bean
    @Transactional
    CommandLineRunner initData(
            CanDoRepository canDoRepository,
            LessonRepository lessonRepository,
            TopicRepository topicRepository
    ) {
        return args -> {
            System.out.println(">>> STARTING IMPORT PROCESS (Smart Mode)...");
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

            // ============================================================
            // PHASE 1: Import TOPICS & LESSONS (Có kiểm tra trùng lặp)
            // ============================================================
            InputStream topicsStream = new ClassPathResource("data/en/topics.json").getInputStream();
            TopicsImportDTO topicsData = mapper.readValue(topicsStream, TopicsImportDTO.class);

            Map<Integer, Lesson> canDoNumberToLessonMap = new HashMap<>();

            for (TopicsImportDTO.TopicItem topicItem : topicsData.getTopics()) {

                // 1. Xử lý Slug
                String rawRomaji = topicItem.getHeading().getRomaji();
                String slug = (rawRomaji != null)
                        ? rawRomaji.trim().toLowerCase().replace(" ", "-")
                        : "topic-" + topicItem.getHeading().getNo();

                // 2. Kiểm tra Topic đã tồn tại chưa? (Tránh lỗi Duplicate Key)
                Optional<Topic> existingTopic = topicRepository.findBySlugAndLanguage(slug, "en");
                Topic topic;

                if (existingTopic.isPresent()) {
                    topic = existingTopic.get(); // Dùng lại topic cũ
                } else {
                    topic = new Topic(); // Tạo mới
                    topic.setSlug(slug);
                    topic.setOrderIndex(topicItem.getHeading().getNo());
                    topic.setTitle(topicItem.getHeading().getTitle());
                    topic.setTitleRomaji(topicItem.getHeading().getRomaji());
                    topic.setTitleEn(topicItem.getHeading().getMeaning());
                    topic.setHexColor(topicItem.getColor());
                    topic.setThumbnail(topicItem.getTopicImageUrl());
                    topic.setLanguage("en");
                    topic.setType("Normal");
                    topic = topicRepository.save(topic);
                }

                // 3. Xử lý Lessons
                if (topicItem.getLessons() != null) {
                    // Lấy danh sách lesson hiện có của topic để check trùng
                    List<Lesson> existingLessons = lessonRepository.findByTopicId(topic.getId());

                    for (TopicsImportDTO.LessonItem lessonItem : topicItem.getLessons()) {
                        String lessonNo = lessonItem.getHeading().getNo();

                        // Tìm xem lesson này đã có trong DB chưa (check theo số hiệu)
                        Lesson lesson = existingLessons.stream()
                                .filter(l -> l.getLessonNumber().equals(lessonNo))
                                .findFirst()
                                .orElse(null);

                        if (lesson == null) {
                            lesson = new Lesson();
                            lesson.setLessonNumber(lessonNo);
                            lesson.setTitle(lessonItem.getHeading().getTitle());
                            lesson.setTopic(topic);
                            lesson = lessonRepository.save(lesson);
                            // Thêm vào list tạm để các vòng lặp sau check tiếp không cần query lại
                            existingLessons.add(lesson);
                        }

                        // Map CanDo No -> Lesson
                        if (lessonItem.getCandos() != null) {
                            for (TopicsImportDTO.CanDoRef candoRef : lessonItem.getCandos()) {
                                canDoNumberToLessonMap.put(candoRef.getNo(), lesson);
                            }
                        }
                    }
                }
            }

            // ============================================================
            // PHASE 2: Import CAN-DOS details
            // ============================================================
            // Kiểm tra sơ bộ, nếu bảng can_dos đã đầy đủ thì skip (tuỳ chọn)
            if (canDoRepository.count() >= 50) {
                System.out.println(">>> CanDos data looks sufficient. Skipping Phase 2.");
                return;
            }

            InputStream canDosStream = new ClassPathResource("data/en/candos.json").getInputStream();
            List<CanDoImportDTO> detailedCanDos = mapper.readValue(canDosStream, new TypeReference<List<CanDoImportDTO>>(){});
            List<CanDo> entitiesToSave = new ArrayList<>();

            for (CanDoImportDTO dto : detailedCanDos) {
                // Check xem CanDo này đã có chưa (để tránh duplicate nếu chạy lại)
                String title = dto.getHeading().getCandoTitle();
                Integer order = extractNumber(title);

                // Nếu bạn muốn update lại dữ liệu cũ thì bỏ qua đoạn check này
                // Nếu muốn skip cái đã có:
                // if (canDoRepository.existsByOrderGlobal(order)) continue;

                CanDo canDo = new CanDo();
                canDo.setContent(title);
                canDo.setSubtitle(dto.getHeading().getCandoSubtitle());
                canDo.setSteps(dto.getSteps());
                canDo.setOrderGlobal(order);

                // Gán Lesson từ Map
                if (order != null && canDoNumberToLessonMap.containsKey(order)) {
                    canDo.setLesson(canDoNumberToLessonMap.get(order));
                }

                entitiesToSave.add(canDo);
            }

            if (!entitiesToSave.isEmpty()) {
                // Dùng saveAll sẽ insert mới. Nếu muốn update, cần logic phức tạp hơn (fetch id rồi set).
                // Ở đây giả định ta đã truncate bảng CanDo hoặc chấp nhận insert thêm.
                // Để an toàn nhất: XÓA CŨ INSERT MỚI CHO BẢNG CANDO
                canDoRepository.deleteAll(); // Xóa sạch bảng CanDo cũ trước khi insert lô mới
                canDoRepository.saveAll(entitiesToSave);
                System.out.println(">>> Imported " + entitiesToSave.size() + " CanDos.");
            }
        };
    }

    private Integer extractNumber(String str) {
        if (str == null) return null;
        Pattern p = Pattern.compile("\\d+");
        Matcher m = p.matcher(str);
        return m.find() ? Integer.parseInt(m.group()) : null;
    }
}