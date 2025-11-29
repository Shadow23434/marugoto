package com.elearning.marugoto.model.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class LessonResponse {
    private Long id;
    private String lessonNumber;
    private String title;
    private Long topicId;
    private String topicSlug;
    private List<Long> canDoIds;
}