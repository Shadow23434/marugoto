package com.elearning.marugoto.model.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "vocabularies")
@Data
public class Vocabulary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String word;
    private String romaji;
    private String meaning;
    private String imageUrl;
    private String audioUrl;

    @ManyToOne
    @JoinColumn(name = "character_id")
    private JapaneseCharacter character;
}