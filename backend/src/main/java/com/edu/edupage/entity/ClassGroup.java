package com.edu.edupage.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "class_groups")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., "10A", "11B"

    private Integer grade; // e.g., 10, 11

    @OneToMany(mappedBy = "classGroup", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Student> students = new ArrayList<>();
}
