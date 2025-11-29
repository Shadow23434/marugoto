package com.elearning.marugoto.repository.jpa;

import com.elearning.marugoto.model.entity.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    Optional<Topic> findBySlugAndLanguage(String slug, String language);
    Page<Topic> findByLanguage(String language, Pageable pageable);
    boolean existsBySlug(String slug);
}

