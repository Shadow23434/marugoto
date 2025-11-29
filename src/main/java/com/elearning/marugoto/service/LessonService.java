package com.elearning.marugoto.service;

import com.elearning.marugoto.model.dto.request.LessonRequest;
import com.elearning.marugoto.model.dto.response.LessonResponse;
import org.jspecify.annotations.Nullable;

import java.util.List;

public interface LessonService {
    @Nullable List<LessonResponse> getLessonsByTopicId(Long topicId);
    @Nullable LessonResponse getById(Long id);
    LessonResponse create(LessonRequest req);
    @Nullable LessonResponse update(Long id, LessonRequest req);
    void delete(Long id);
}
