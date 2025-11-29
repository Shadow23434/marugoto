package com.elearning.marugoto.util;

import com.elearning.marugoto.model.dto.request.TopicRequest;
import com.elearning.marugoto.model.dto.response.TopicResponse;
import com.elearning.marugoto.model.entity.Lesson;
import com.elearning.marugoto.model.entity.Topic;
import org.springframework.beans.BeanUtils;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class TopicMapper {

    public static TopicResponse toResponse(Topic entity) {
        if (entity == null) return null;

        TopicResponse dto = new TopicResponse();
        BeanUtils.copyProperties(entity, dto);

//        if (entity.getLessons() != null && !entity.getLessons().isEmpty()) {
//            List<Long> lessonIds = entity.getLessons().stream()
//                    .map(Lesson::getId)
//                    .collect(Collectors.toList());
//            dto.setLessonIds(lessonIds);
//        } else {
//            dto.setLessonIds(Collections.emptyList());
//        }

        dto.setLessonIds(Collections.emptyList());
        return dto;
    }

    public static Topic toEntity(TopicRequest req) {
        Topic entity = new Topic();
        BeanUtils.copyProperties(req, entity);
        return entity;
    }
}