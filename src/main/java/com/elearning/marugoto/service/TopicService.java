package com.elearning.marugoto.service;

import com.elearning.marugoto.model.dto.response.TopicResponse;
import com.elearning.marugoto.model.dto.request.TopicRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TopicService {
    Page<TopicResponse> getAll(String language, Pageable pageable);
    TopicResponse getById(Long id);
    TopicResponse getBySlug(String slug, String language);
    TopicResponse create(TopicRequest req);
    TopicResponse update(Long id, TopicRequest req);
    void delete(Long id);
}

