package com.elearning.marugoto.service.import_data;

import com.elearning.marugoto.model.entity.JapaneseCharacter;
import com.elearning.marugoto.model.entity.Vocabulary;
import com.elearning.marugoto.model.enums.KanaType;
import com.elearning.marugoto.repository.jpa.CharacterRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CharacterRepository characterRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void run(String... args) throws Exception {
        if (characterRepository.count() > 0) {
            System.out.println("Database already has data. Skipping seed.");
            return;
        }

        System.out.println("Starting data seeding...");

        seedData("data/en/hiragana.json", KanaType.HIRAGANA);
        seedData("data/en/katakana.json", KanaType.KATAKANA);

        System.out.println("Data seeding completed!");
    }

    private void seedData(String filePath, KanaType type) {
        try {
            InputStream inputStream = new ClassPathResource(filePath).getInputStream();
            JsonDataStructures.Root root = objectMapper.readValue(inputStream, JsonDataStructures.Root.class);

            List<JapaneseCharacter> charactersToSave = new ArrayList<>();

            if (root.getGroups() != null) {
                for (JsonDataStructures.Group group : root.getGroups()) {
                    if (group.getCharacters() == null) continue;

                    for (JsonDataStructures.Character jsonChar : group.getCharacters()) {
                        if (jsonChar.getCharacterName() == null || jsonChar.getCharacterName().isEmpty()) {
                            continue;
                        }

                        JapaneseCharacter entity = new JapaneseCharacter();
                        entity.setCharacterName(jsonChar.getCharacterName());
                        entity.setRomaji(jsonChar.getRomaji());
                        entity.setRowName(jsonChar.getRowName());
                        entity.setGroupName(group.getGroupName());
                        entity.setKanaType(type);
                        entity.setAudioUrl(jsonChar.getAudio());
                        entity.setOrderImgUrl(jsonChar.getOrderImgUrl());

                        List<Vocabulary> vocabEntities = new ArrayList<>();
                        if (jsonChar.getVocabularies() != null) {
                            for (JsonDataStructures.Vocabulary jsonVocab : jsonChar.getVocabularies()) {
                                Vocabulary v = new Vocabulary();
                                v.setWord(jsonVocab.getVocabWord());
                                v.setRomaji(jsonVocab.getVocabRomaji());
                                v.setMeaning(jsonVocab.getVocabMeaning());
                                v.setImageUrl(jsonVocab.getVocabImgUrl());

                                // --- LOGIC TẠO AUDIO URL MỚI Ở ĐÂY ---
                                String generatedAudio = generateAudioUrl(jsonVocab.getVocabImgUrl(), type);
                                v.setAudioUrl(generatedAudio);
                                // -------------------------------------

                                v.setCharacter(entity);
                                vocabEntities.add(v);
                            }
                        }
                        entity.setVocabularies(vocabEntities);
                        charactersToSave.add(entity);
                    }
                }
            }

            characterRepository.saveAll(charactersToSave);
            System.out.println("Imported " + charactersToSave.size() + " characters for " + type);

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to import data from: " + filePath);
        }
    }

    /**
     * Hàm hỗ trợ tạo URL Audio từ URL Image
     * Input Img: .../vocabularies/i_1.jpg
     * Output Audio: https://a1.marugotoweb.jp/en/assets/sounds/{type}/i_1.mp3
     */
    private String generateAudioUrl(String imgUrl, KanaType type) {
        if (imgUrl == null || imgUrl.isEmpty()) {
            return null;
        }

        try {
            String filename = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
            String baseName = filename.contains(".") ? filename.substring(0, filename.lastIndexOf('.')) : filename;
            return String.format("https://a1.marugotoweb.jp/en/assets/sounds/%s/%s.mp3",
                    type.name().toLowerCase(),
                    baseName);

        } catch (Exception e) {
            System.err.println("Error generating audio url for: " + imgUrl);
            return null;
        }
    }
}