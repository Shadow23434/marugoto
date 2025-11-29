package com.elearning.marugoto.model.json;

import lombok.Data;

@Data
public class MovieAsset {
    private String thumbnail;
    private String caption;
    private VideoSource src;

    @Data
    public static class VideoSource {
        private String mp4;
        private String webm;
    }
}