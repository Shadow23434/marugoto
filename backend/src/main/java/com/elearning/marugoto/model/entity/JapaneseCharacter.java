package com.elearning.marugoto.model.entity;

import com.elearning.marugoto.model.enums.KanaType;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "characters")
@Data
public class JapaneseCharacter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String characterName; // あ
    private String romaji;        // a
    private String rowName;       // a, ka, sa
    private String groupName;     // seidakuon, youon

    @Enumerated(EnumType.STRING)
    @Column(name = "kana_type")
    private KanaType kanaType;  // HIRAGANA or KATAKANA

    private String audioUrl;
    private String orderImgUrl;

    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Vocabulary> vocabularies;
}