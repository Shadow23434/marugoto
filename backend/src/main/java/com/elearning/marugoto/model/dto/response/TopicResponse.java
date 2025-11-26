package com.elearning.marugoto.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopicResponse {
    private Long id;
    private String slug;
    private String title;
    private String titleRomaji;
    private String titleEn;
    private String description;
    private String thumbnail;
    private String language;
    private String type;
    private Integer orderIndex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String hexColor;
    private List<Long> lessonIds;
}
