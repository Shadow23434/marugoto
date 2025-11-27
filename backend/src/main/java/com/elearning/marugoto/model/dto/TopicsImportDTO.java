package com.elearning.marugoto.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TopicsImportDTO {
    private List<TopicItem> topics;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TopicItem {
        private Heading heading; // chứa no, title...
        private String color;
        private String topicImageUrl;
        private List<LessonItem> lessons;

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Heading {
            private Integer no;
            private String title;
            private String romaji;
            private String meaning;
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LessonItem {
        private LessonHeading heading;
        private List<CanDoRef> candos; // Danh sách CanDo thuộc lesson này

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class LessonHeading {
            private String no; // "1", "2"...
            private String title;
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CanDoRef {
        private Integer no; // Số thứ tự CanDo (1, 2, 3...) dùng để map
        private String title;
    }
}