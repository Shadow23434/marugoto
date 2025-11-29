package com.elearning.marugoto.service.impl;

import com.elearning.marugoto.exception.AppException; // Dùng exception custom của bạn
import com.elearning.marugoto.model.dto.request.LessonRequest;
import com.elearning.marugoto.model.dto.response.LessonResponse;
import com.elearning.marugoto.model.entity.Lesson;
import com.elearning.marugoto.model.entity.Topic;
import com.elearning.marugoto.repository.jpa.LessonRepository;
import com.elearning.marugoto.repository.jpa.TopicRepository;
import com.elearning.marugoto.service.LessonService;
import com.elearning.marugoto.util.LessonMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final TopicRepository topicRepository;

    @Override
    public List<LessonResponse> getLessonsByTopicId(Long topicId) {
        return lessonRepository.findByTopicId(topicId).stream()
                .map(LessonMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LessonResponse getById(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new AppException("Lesson not found", HttpStatus.NOT_FOUND));
        return LessonMapper.toResponse(lesson);
    }

    @Override
    public LessonResponse create(LessonRequest req) {
        Topic topic = topicRepository.findById(req.getTopicId())
                .orElseThrow(() -> new AppException("Topic not found", HttpStatus.NOT_FOUND));

        // 2. Map & Set Topic
        Lesson lesson = LessonMapper.toEntity(req);
        lesson.setTopic(topic);

        // 3. Save
        return LessonMapper.toResponse(lessonRepository.save(lesson));
    }

    @Override
    public LessonResponse update(Long id, LessonRequest req) {
        Lesson existing = lessonRepository.findById(id)
                .orElseThrow(() -> new AppException("Lesson not found", HttpStatus.NOT_FOUND));

        if (req.getTopicId() != null && !req.getTopicId().equals(existing.getTopic().getId())) {
            Topic newTopic = topicRepository.findById(req.getTopicId())
                    .orElseThrow(() -> new AppException("Topic not found", HttpStatus.NOT_FOUND));
            existing.setTopic(newTopic);
        }

        existing.setLessonNumber(req.getLessonNumber());
        existing.setTitle(req.getTitle());

        return LessonMapper.toResponse(lessonRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        if (!lessonRepository.existsById(id)) {
            throw new AppException("Lesson not found", HttpStatus.NOT_FOUND);
        }
        lessonRepository.deleteById(id);
    }
}