package com.elearning.marugoto.model.dto; // Hoặc package dto của bạn

import com.elearning.marugoto.model.json.CanDoStep; // Class này bạn đã có trong entity
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CanDoImportDTO {

    private Heading heading;
    private List<CanDoStep> steps;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Heading {
        private String topicNo;
        private String topicTitle;
        private String candoTitle;     // Map vào content của Entity
        private String candoSubtitle;  // Map vào subtitle của Entity
    }
}