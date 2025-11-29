package com.elearning.marugoto.util;

import com.elearning.marugoto.model.dto.request.LessonRequest;
import com.elearning.marugoto.model.dto.response.LessonResponse;
import com.elearning.marugoto.model.entity.CanDo;
import com.elearning.marugoto.model.entity.Lesson;
import org.springframework.beans.BeanUtils;

import java.util.Collections;
import java.util.stream.Collectors;

public class LessonMapper {

    public static LessonResponse toResponse(Lesson entity) {
        if (entity == null) return null;
        LessonResponse dto = new LessonResponse();
        BeanUtils.copyProperties(entity, dto);

        // Map Topic Info
        if (entity.getTopic() != null) {
            dto.setTopicId(entity.getTopic().getId());
            dto.setTopicSlug(entity.getTopic().getSlug());
        }

        // Map CanDo IDs
        if (entity.getCandos() != null && !entity.getCandos().isEmpty()) {
            dto.setCanDoIds(entity.getCandos().stream()
                    .map(CanDo::getId)
                    .collect(Collectors.toList()));
        } else {
            dto.setCanDoIds(Collections.emptyList());
        }
        return dto;
    }

    public static Lesson toEntity(LessonRequest req) {
        Lesson entity = new Lesson();
        BeanUtils.copyProperties(req, entity);
        return entity;
    }
}