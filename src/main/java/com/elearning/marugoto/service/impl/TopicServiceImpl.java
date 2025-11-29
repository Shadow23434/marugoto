package com.elearning.marugoto.service.impl;

import com.elearning.marugoto.model.dto.request.TopicRequest;
import com.elearning.marugoto.model.dto.response.TopicResponse;
import com.elearning.marugoto.model.entity.Topic;
import com.elearning.marugoto.repository.jpa.TopicRepository;
import com.elearning.marugoto.service.TopicService;
import com.elearning.marugoto.util.TopicMapper;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "topics", key = "#language + '-' + #pageable.pageNumber")
    public Page<TopicResponse> getAll(String language, Pageable pageable) {
        Page<Topic> page;
        if (language == null || language.isEmpty()) {
            page = topicRepository.findAll(pageable);
        } else {
            page = topicRepository.findByLanguage(language, pageable);
        }
        return page.map(TopicMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "topics", key = "#id")
    public TopicResponse getById(Long id) {
        Topic t = topicRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Topic not found"));
        return TopicMapper.toResponse(t);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "topics", key = "#slug + ':' + #language")
    public TopicResponse getBySlug(String slug, String language) {
        Topic t = topicRepository.findBySlugAndLanguage(slug, language)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found"));
        return TopicMapper.toResponse(t);
    }

    @Override
    @Transactional
    public TopicResponse create(TopicRequest req) {
        if (req.getSlug() != null && topicRepository.existsBySlug(req.getSlug())) {
            throw new IllegalArgumentException("Slug already exists");
        }
        Topic t = TopicMapper.toEntity(req);
        Topic saved = topicRepository.save(t);
        return TopicMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TopicResponse update(Long id, TopicRequest req) {
        Topic existing = topicRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Topic not found"));
        // update fields
        existing.setSlug(req.getSlug());
        existing.setTitle(req.getTitle());
        existing.setDescription(req.getDescription());
        existing.setThumbnail(req.getThumbnail());
        existing.setLanguage(req.getLanguage());
        existing.setType(req.getType());
        existing.setOrderIndex(req.getOrderIndex());
        Topic saved = topicRepository.save(existing);
        return TopicMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!topicRepository.existsById(id)) {
            throw new EntityNotFoundException("Topic not found");
        }
        topicRepository.deleteById(id);
    }
}
