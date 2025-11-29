package com.elearning.marugoto.service.impl;

import com.elearning.marugoto.model.dto.response.*;
import com.elearning.marugoto.model.entity.JapaneseCharacter;
import com.elearning.marugoto.model.enums.KanaType;
import com.elearning.marugoto.repository.jpa.CharacterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class KanaServiceImpl {

    @Autowired
    private CharacterRepository characterRepository;

    public KanaResponse getKanaData(KanaType type) {
        List<JapaneseCharacter> entities = characterRepository.findByKanaType(type);

        Map<String, List<JapaneseCharacter>> groupedEntities = entities.stream()
                .collect(Collectors.groupingBy(JapaneseCharacter::getGroupName));

        List<GroupDTO> groupDTOs = new ArrayList<>();

        // 3. Convert Entity sang DTO
        groupedEntities.forEach((groupName, charList) -> {
            GroupDTO groupDTO = new GroupDTO();
            groupDTO.setGroupName(groupName);

            List<CharacterDTO> charDTOs = charList.stream()
                    .map(this::convertToCharDTO)
                    .collect(Collectors.toList());

            groupDTO.setCharacters(charDTOs);
            groupDTOs.add(groupDTO);
        });

        // 4. Đóng gói vào KanaResponse
        KanaResponse response = new KanaResponse();
        response.setGroups(groupDTOs);
        return response;
    }

    private CharacterDTO convertToCharDTO(JapaneseCharacter entity) {
        CharacterDTO dto = new CharacterDTO();
        dto.setCharacterName(entity.getCharacterName());
        dto.setRomaji(entity.getRomaji());
        dto.setRowName(entity.getRowName());
        dto.setAudio(entity.getAudioUrl());
        dto.setOrderImgUrl(entity.getOrderImgUrl());

        if (entity.getVocabularies() != null) {
            List<VocabularyDTO> vocabDTOs = entity.getVocabularies().stream()
                    .map(this::convertToVocabDTO)
                    .collect(Collectors.toList());
            dto.setVocabularies(vocabDTOs);
        }
        return dto;
    }

    private VocabularyDTO convertToVocabDTO(com.elearning.marugoto.model.entity.Vocabulary v) {
        VocabularyDTO vDto = new VocabularyDTO();
        vDto.setVocabWord(v.getWord());
        vDto.setVocabRomaji(v.getRomaji());
        vDto.setVocabMeaning(v.getMeaning());
        vDto.setVocabImgUrl(v.getImageUrl());
        vDto.setVocabAudioUrl(v.getAudioUrl());
        return vDto;
    }
}