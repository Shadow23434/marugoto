package com.elearning.marugoto.model.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "topics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(name = "title_romaji", nullable = false)
    private String titleRomaji;

    @Column(name = "title_en", nullable = false)
    private String titleEn;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String thumbnail;

    @Column(nullable = false)
    private String language;

    @Column(nullable = false)
    private String type;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "hex_color", nullable = false)
    private String hexColor;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Lesson> lessons;
}