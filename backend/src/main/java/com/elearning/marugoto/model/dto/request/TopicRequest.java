package com.elearning.marugoto.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopicRequest {
    private String slug;
    private String title;
    private String description;
    private String thumbnail;
    private String language;
    private String type;
    private Integer orderIndex;
}

