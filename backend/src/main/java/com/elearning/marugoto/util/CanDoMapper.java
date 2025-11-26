package com.elearning.marugoto.util;

import com.elearning.marugoto.model.dto.request.CanDoRequest;
import com.elearning.marugoto.model.dto.response.CanDoResponse;
import com.elearning.marugoto.model.entity.CanDo;
import org.springframework.beans.BeanUtils;

public class CanDoMapper {

    public static CanDoResponse toResponse(CanDo entity) {
        if (entity == null) return null;
        CanDoResponse dto = new CanDoResponse();
        BeanUtils.copyProperties(entity, dto);

        // Map Lesson ID
        if (entity.getLesson() != null) {
            dto.setLessonId(entity.getLesson().getId());
        }
        return dto;
    }

    public static CanDo toEntity(CanDoRequest req) {
        CanDo entity = new CanDo();
        BeanUtils.copyProperties(req, entity);
        return entity;
    }
}