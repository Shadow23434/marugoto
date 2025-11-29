package com.elearning.marugoto.model.dto.request;

import com.elearning.marugoto.model.json.CanDoStep;
import lombok.Data;
import java.util.List;

@Data
public class CanDoRequest {
    private Long lessonId;
    private String content;
    private String subtitle;
    private Integer orderGlobal;
    private List<CanDoStep> steps;
}