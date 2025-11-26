package com.elearning.marugoto.model.dto.response;

import lombok.Data;

@Data
public class CanDoResponse {
    private Long id;
    private String content;
    private Integer orderGlobal;
    private Long lessonId;
}