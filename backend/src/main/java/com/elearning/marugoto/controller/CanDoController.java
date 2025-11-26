package com.elearning.marugoto.controller;

import com.elearning.marugoto.model.dto.request.CanDoRequest;
import com.elearning.marugoto.model.dto.response.CanDoResponse;
import com.elearning.marugoto.model.dto.response.LessonResponse;
import com.elearning.marugoto.service.CanDoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/can-do")
@RequiredArgsConstructor
public class CanDoController {

    private final CanDoService canDoService;

    // --- PUBLIC ---
    @GetMapping("/{id}")
    public ResponseEntity<CanDoResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(canDoService.getById(id));
    }

    @GetMapping("/by-lesson/{lessonId}")
    public ResponseEntity<List<CanDoResponse>> getByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(canDoService.getByLessonId(lessonId));
    }

    // --- ADMIN ---
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CanDoResponse> create(@RequestBody CanDoRequest req) {
        CanDoResponse created = canDoService.create(req);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CanDoResponse> update(@PathVariable Long id, @RequestBody CanDoRequest req) {
        return ResponseEntity.ok(canDoService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        canDoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}