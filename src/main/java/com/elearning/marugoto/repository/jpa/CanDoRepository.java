package com.elearning.marugoto.repository.jpa;

import com.elearning.marugoto.model.entity.CanDo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CanDoRepository extends JpaRepository<CanDo, Long> {
    List<CanDo> findByLessonIdOrderByOrderGlobalAsc(Long lessonId);
}