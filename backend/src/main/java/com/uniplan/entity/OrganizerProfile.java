package com.uniplan.entity;

import com.uniplan.entity.enums.OrganizerType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "organizer_profiles",
        uniqueConstraints = @UniqueConstraint(name = "uq_organizer_profiles_user_id", columnNames = "user_id")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UniplanUser user;

    @Enumerated(EnumType.STRING)
    @Column(name = "organizer_type", nullable = false, length = 30)
    private OrganizerType organizerType;

    @Column(name = "enabled", nullable = false)
    @Builder.Default
    private boolean enabled = true;

    // ── FACULTY_MEMBER fields ─────────────────────────────────────────────────

    @Column(name = "faculty_code")
    private Integer facultyCode;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "specialization_area", length = 100)
    private String specializationArea;

    // ── STUDENT_LEADER fields ─────────────────────────────────────────────────

    @Column(name = "academic_program_code")
    private Integer academicProgramCode;

    @Column(name = "semester", length = 10)
    private String semester;

    @Column(name = "student_group", length = 100)
    private String studentGroup;

    // ── WELLNESS_STAFF fields ─────────────────────────────────────────────────

    @Column(name = "administrative_area_code")
    private Integer administrativeAreaCode;

    @Column(name = "job_title", length = 100)
    private String jobTitle;

    // ─────────────────────────────────────────────────────────────────────────

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    private void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
