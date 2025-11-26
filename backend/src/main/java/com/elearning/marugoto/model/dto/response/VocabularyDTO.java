package com.elearning.marugoto.model.dto.response;
import lombok.Data;

@Data
public class VocabularyDTO {
    private String vocabWord;
    private String vocabRomaji;
    private String vocabMeaning;
    private String vocabImgUrl;
    private String vocabAudioUrl;
}