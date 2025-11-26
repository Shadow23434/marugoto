package com.elearning.marugoto.controller;

import com.elearning.marugoto.model.dto.response.TopicResponse;
import com.elearning.marugoto.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class PublicTopicController {

    private final TopicService topicService;

    @GetMapping
    public ResponseEntity<Page<TopicResponse>> getAll(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "language", required = false) String language
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(topicService.getAll(language, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TopicResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(topicService.getById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<TopicResponse> getBySlug(@PathVariable String slug,
                                                    @RequestParam(value = "language", required = false) String language) {
        return ResponseEntity.ok(topicService.getBySlug(slug, language));
    }
}

