package com.elearning.marugoto.model.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class CharacterDTO {
    private String rowName;
    private String characterName;
    private String romaji;
    private String audio;
    private String orderImgUrl;
    private List<VocabularyDTO> vocabularies;
}