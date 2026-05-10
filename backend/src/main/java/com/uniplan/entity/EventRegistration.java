package com.uniplan.entity;

import com.uniplan.entity.enums.RegistrationStatus;
import com.uniplan.entity.ids.EventRegistrationId;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Records a student's registration to an event.
 * The composite primary key (event_id, student_user_id) prevents duplicate registrations
 * at the database level.
 */
@Entity
@Table(name = "event_registrations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRegistration {

    @EmbeddedId
    private EventRegistrationId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("eventId")
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studentUserId")
    @JoinColumn(name = "student_user_id", nullable = false)
    private UniplanUser student;

    @Column(name = "registration_date", nullable = false, updatable = false)
    private LocalDateTime registrationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RegistrationStatus status;

    @Column(name = "cancellation_date")
    private LocalDateTime cancellationDate;

    // EventAttendance owns the FK back to this registration.
    @OneToOne(mappedBy = "registration", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private EventAttendance attendance;

    @PrePersist
    private void prePersist() {
        if (registrationDate == null) {
            registrationDate = LocalDateTime.now();
        }
        if (status == null) {
            status = RegistrationStatus.REGISTERED;
        }
    }
}
