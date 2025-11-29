package com.elearning.marugoto.model.entity;

import com.elearning.marugoto.model.json.CanDoStep;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Table(name = "can_dos")
@Data
public class CanDo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_global")
    private Integer orderGlobal;

    @Column(nullable = false)
    private String content;

    private String subtitle;

    @Column(name = "structure_json", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<CanDoStep> steps;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    @JsonBackReference
    private Lesson lesson;
}