package com.elearning.marugoto.model.json;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class QuestionAsset {
    private List<String> images;
    private String alt;
    private String downloadLink;
}