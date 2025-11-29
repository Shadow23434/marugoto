package com.elearning.marugoto.service;

import com.elearning.marugoto.model.dto.request.CanDoRequest;
import com.elearning.marugoto.model.dto.response.CanDoResponse;
import java.util.List;

public interface CanDoService {
    CanDoResponse getById(Long id);
    List<CanDoResponse> getByLessonId(Long lessonId);
    CanDoResponse create(CanDoRequest req);
    CanDoResponse update(Long id, CanDoRequest req);
    void delete(Long id);
}