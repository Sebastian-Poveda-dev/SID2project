package com.uniplan.repository.jpa;

import com.uniplan.entity.Event;
import com.uniplan.entity.enums.EventStatus;
import com.uniplan.entity.enums.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    Optional<Event> findByEventCode(String eventCode);

    boolean existsByEventCode(String eventCode);

    List<Event> findByEventType(EventType eventType);

    List<Event> findByStatus(EventStatus status);

    List<Event> findByEventTypeAndStatus(EventType eventType, EventStatus status);

    List<Event> findByStartDateTimeBetween(LocalDateTime start, LocalDateTime end);

    List<Event> findByOrganizerId(Long organizerId);

    List<Event> findByOrganizerIdAndStatus(Long organizerId, EventStatus status);

    List<Event> findByAvailableSlotsGreaterThan(int minSlots);

    @Query("SELECT e FROM Event e WHERE e.startDateTime > :now AND e.status = 'PUBLISHED' ORDER BY e.startDateTime ASC")
    List<Event> findUpcomingPublished(@Param("now") LocalDateTime now);

    @Query("SELECT e FROM Event e WHERE e.startDateTime BETWEEN :start AND :end AND e.status = :status ORDER BY e.startDateTime ASC")
    List<Event> findByDateRangeAndStatus(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("status") EventStatus status);
}
