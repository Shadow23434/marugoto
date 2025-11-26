package com.elearning.marugoto.service.import_data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

public class JsonDataStructures {

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Root {
        private List<Group> groups;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Group {
        private String groupName;
        private List<Character> characters;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Character {
        private String rowName;
        private String characterName;
        private String romaji;
        private String audio;
        private String orderImgUrl;
        private List<Vocabulary> vocabularies;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Vocabulary {
        @JsonProperty("vocabWord")
        private String vocabWord;

        @JsonProperty("vocabRomaji")
        private String vocabRomaji;

        @JsonProperty("vocabMeaning")
        private String vocabMeaning;

        @JsonProperty("vocabImgUrl")
        private String vocabImgUrl;

        @JsonProperty("vocabAudioUrl")
        private String vocabAudioUrl;
    }
}