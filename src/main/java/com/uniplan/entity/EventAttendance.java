package com.uniplan.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Tracks whether a registered student actually attended an event.
 * Owns the foreign key to event_registrations via the composite PK columns.
 */
@Entity
@Table(name = "event_attendances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "event_id",        referencedColumnName = "event_id",        nullable = false),
            @JoinColumn(name = "student_user_id", referencedColumnName = "student_user_id", nullable = false)
    })
    private EventRegistration registration;

    @Column(name = "attended", nullable = false)
    @Builder.Default
    private boolean attended = false;

    // Populated when the organizer marks the student as present.
    @Column(name = "attendance_time")
    private LocalDateTime attendanceTime;
}
