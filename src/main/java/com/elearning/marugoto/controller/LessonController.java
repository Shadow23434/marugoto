package com.elearning.marugoto.controller;

import com.elearning.marugoto.model.dto.request.LessonRequest;
import com.elearning.marugoto.model.dto.response.LessonResponse;
import com.elearning.marugoto.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    // --- PUBLIC ---
    @GetMapping("/{id}")
    public ResponseEntity<LessonResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(lessonService.getById(id));
    }

    @GetMapping("/by-topic/{topicId}")
    public ResponseEntity<List<LessonResponse>> getByTopic(@PathVariable Long topicId) {
        return ResponseEntity.ok(lessonService.getLessonsByTopicId(topicId));
    }

    // --- ADMIN ---
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LessonResponse> create(@RequestBody LessonRequest req) {
        LessonResponse created = lessonService.create(req);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LessonResponse> update(@PathVariable Long id, @RequestBody LessonRequest req) {
        return ResponseEntity.ok(lessonService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        lessonService.delete(id);
        return ResponseEntity.noContent().build();
    }
}