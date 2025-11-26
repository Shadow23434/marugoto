package com.elearning.marugoto.model.dto.request;

import lombok.Data;

@Data
public class CanDoRequest {
    private Long lessonId;
    private String content;
    private Integer orderGlobal; 
}