package com.uniplan.entity;

import com.uniplan.entity.enums.EventStatus;
import com.uniplan.entity.enums.EventType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Check;

import java.time.LocalDateTime;

/**
 * Stores the base transactional data for a university event.
 * Dynamic per-event-type details (speaker info, materials, rules, etc.)
 * are stored in MongoDB and linked via eventCode.
 */
@Entity
@Table(
        name = "events",
        uniqueConstraints = @UniqueConstraint(name = "uq_events_event_code", columnNames = "event_code"),
        indexes = {
                @Index(name = "idx_events_status",          columnList = "status"),
                @Index(name = "idx_events_event_type",      columnList = "event_type"),
                @Index(name = "idx_events_start_date_time", columnList = "start_date_time"),
                @Index(name = "idx_events_organizer_id",    columnList = "organizer_id")
        }
)
@Check(constraints = "max_capacity > 0 AND available_slots >= 0")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Unique code used to correlate with the MongoDB document for extended details.
    @Column(name = "event_code", nullable = false, unique = true, length = 20)
    private String eventCode;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 30)
    private EventType eventType;

    @Column(name = "start_date_time", nullable = false)
    private LocalDateTime startDateTime;

    @Column(name = "end_date_time", nullable = false)
    private LocalDateTime endDateTime;

    @Column(name = "location", nullable = false, length = 200)
    private String location;

    @Column(name = "max_capacity", nullable = false)
    private int maxCapacity;

    @Column(name = "available_slots", nullable = false)
    private int availableSlots;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private EventStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private OrganizerProfile organizer;

    @PrePersist
    private void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (status == null) status = EventStatus.DRAFT;
    }

    @PreUpdate
    private void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
