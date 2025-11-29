package com.elearning.marugoto.model.dto.response;

import com.elearning.marugoto.model.json.CanDoStep;
import lombok.Data;
import java.util.List;

@Data
public class CanDoResponse {
    private Long id;
    private String content;
    private String subtitle;
    private Integer orderGlobal;
    private Long lessonId;
    private List<CanDoStep> steps;
}