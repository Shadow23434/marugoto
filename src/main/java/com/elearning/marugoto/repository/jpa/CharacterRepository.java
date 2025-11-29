package com.elearning.marugoto.repository.jpa;

import com.elearning.marugoto.model.entity.JapaneseCharacter;
import com.elearning.marugoto.model.enums.KanaType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CharacterRepository extends JpaRepository<JapaneseCharacter, Long> {
    List<JapaneseCharacter> findByKanaType(KanaType kanaType);
}
