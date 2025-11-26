package com.elearning.marugoto.service.impl;

import com.elearning.marugoto.exception.AppException;
import com.elearning.marugoto.model.dto.request.CanDoRequest;
import com.elearning.marugoto.model.dto.response.CanDoResponse;
import com.elearning.marugoto.model.entity.CanDo;
import com.elearning.marugoto.model.entity.Lesson;
import com.elearning.marugoto.repository.jpa.CanDoRepository;
import com.elearning.marugoto.repository.jpa.LessonRepository;
import com.elearning.marugoto.service.CanDoService;
import com.elearning.marugoto.util.CanDoMapper;
import com.elearning.marugoto.util.LessonMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CanDoServiceImpl implements CanDoService {

    private final CanDoRepository canDoRepository;
    private final LessonRepository lessonRepository;

    @Override
    public CanDoResponse getById(Long id) {
        CanDo cando = canDoRepository.findById(id)
                .orElseThrow(() -> new AppException("Can do not found", HttpStatus.NOT_FOUND));
        return CanDoMapper.toResponse(cando);
    }

    @Override
    public List<CanDoResponse> getByLessonId(Long lessonId) {
        return canDoRepository.findByLessonIdOrderByOrderGlobalAsc(lessonId).stream()
                .map(CanDoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CanDoResponse create(CanDoRequest req) {
        // 1. Tìm Lesson cha
        Lesson lesson = lessonRepository.findById(req.getLessonId())
                .orElseThrow(() -> new AppException("Lesson not found", HttpStatus.NOT_FOUND));

        // 2. Map & Save
        CanDo canDo = CanDoMapper.toEntity(req);
        canDo.setLesson(lesson);

        return CanDoMapper.toResponse(canDoRepository.save(canDo));
    }

    @Override
    public CanDoResponse update(Long id, CanDoRequest req) {
        CanDo existing = canDoRepository.findById(id)
                .orElseThrow(() -> new AppException("CanDo not found", HttpStatus.NOT_FOUND));

        existing.setContent(req.getContent());
        existing.setOrderGlobal(req.getOrderGlobal());

        // Nếu muốn chuyển CanDo sang bài học khác
        if (req.getLessonId() != null && !req.getLessonId().equals(existing.getLesson().getId())) {
            Lesson newLesson = lessonRepository.findById(req.getLessonId())
                    .orElseThrow(() -> new AppException("Lesson not found", HttpStatus.NOT_FOUND));
            existing.setLesson(newLesson);
        }

        return CanDoMapper.toResponse(canDoRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        if (!canDoRepository.existsById(id)) {
            throw new AppException("CanDo not found", HttpStatus.NOT_FOUND);
        }
        canDoRepository.deleteById(id);
    }
}
