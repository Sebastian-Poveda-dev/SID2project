package com.uniplan.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Stores aggregated statistics for an event, separate from the transactional model.
 * Updated by the service layer whenever registrations, cancellations, or attendance records change.
 */
@Entity
@Table(
        name = "event_statistics",
        uniqueConstraints = @UniqueConstraint(name = "uq_event_statistics_event_id", columnNames = "event_id")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventStatistics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false, unique = true)
    private Event event;

    @Column(name = "total_registered", nullable = false)
    @Builder.Default
    private int totalRegistered = 0;

    @Column(name = "total_cancelled", nullable = false)
    @Builder.Default
    private int totalCancelled = 0;

    @Column(name = "total_attended", nullable = false)
    @Builder.Default
    private int totalAttended = 0;

    // Stored as a value between 0.0 and 100.0.
    @Column(name = "occupancy_percentage", nullable = false)
    @Builder.Default
    private double occupancyPercentage = 0.0;

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    private void refreshTimestamp() {
        lastUpdated = LocalDateTime.now();
    }
}
