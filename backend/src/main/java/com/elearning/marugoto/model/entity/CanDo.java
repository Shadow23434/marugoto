package com.elearning.marugoto.model.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "can_dos")
@Data
public class CanDo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_global")
    private Integer orderGlobal; // no (1, 2, 3...)

    @Column(name = "content")
    private String content;      // title (Can-do content)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    @JsonBackReference
    private Lesson lesson;
}

