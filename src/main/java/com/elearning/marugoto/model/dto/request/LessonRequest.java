package com.elearning.marugoto.model.dto.request;

import lombok.Data;

@Data
public class LessonRequest {
    private Long topicId;
    private String lessonNumber;
    private String title;
}