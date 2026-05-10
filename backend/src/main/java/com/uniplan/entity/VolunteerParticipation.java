package com.uniplan.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Records validated volunteering hours for a student registration on a VOLUNTEER event.
 * Hours are validated by a staff member (UniplanUser with EMPLOYEE or ADMIN role).
 */
@Entity
@Table(
        name = "volunteer_participations",
        indexes = {
                @Index(name = "idx_volunteer_participations_event_student",
                       columnList = "event_id, student_user_id"),
                @Index(name = "idx_volunteer_participations_validated_by",
                       columnList = "validated_by_user_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VolunteerParticipation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "event_id",        referencedColumnName = "event_id",        nullable = false),
            @JoinColumn(name = "student_user_id", referencedColumnName = "student_user_id", nullable = false)
    })
    private EventRegistration registration;

    // The staff member who validated the hours.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validated_by_user_id", nullable = false)
    private UniplanUser validatedBy;

    @Column(name = "validated_hours", nullable = false)
    private double validatedHours;

    @Column(name = "validated_at", nullable = false, updatable = false)
    private LocalDateTime validatedAt;

    @PrePersist
    private void prePersist() {
        if (validatedAt == null) {
            validatedAt = LocalDateTime.now();
        }
    }
}
