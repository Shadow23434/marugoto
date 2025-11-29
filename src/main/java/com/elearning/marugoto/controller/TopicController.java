package com.elearning.marugoto.controller;

import com.elearning.marugoto.model.dto.request.TopicRequest;
import com.elearning.marugoto.model.dto.response.TopicResponse;
import com.elearning.marugoto.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;

    // ==================== PUBLIC ENDPOINTS ====================

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

    // ==================== ADMIN ENDPOINTS ====================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TopicResponse> create(@RequestBody TopicRequest req) {
        TopicResponse created = topicService.create(req);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TopicResponse> update(@PathVariable Long id, @RequestBody TopicRequest req) {
        TopicResponse updated = topicService.update(id, req);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(updated.getId())
                .toUri();

        return ResponseEntity.created(location).body(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        topicService.delete(id);
        return ResponseEntity.noContent().build();
    }
}