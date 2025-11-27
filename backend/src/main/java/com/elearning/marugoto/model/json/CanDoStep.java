package com.elearning.marugoto.model.json;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CanDoStep {
    private String id;
    private String title;
    private String subtitle;

    private List<MovieAsset> movies;
    private MovieAsset.VideoSource video;
    private String thumbnail;
    private String caption;
    private QuestionAsset question;
}