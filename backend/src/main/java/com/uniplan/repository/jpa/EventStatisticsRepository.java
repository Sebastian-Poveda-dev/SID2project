package com.uniplan.repository.jpa;

import com.uniplan.entity.EventStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EventStatisticsRepository extends JpaRepository<EventStatistics, Long> {

    Optional<EventStatistics> findByEventId(Long eventId);

    boolean existsByEventId(Long eventId);

    List<EventStatistics> findByOccupancyPercentageGreaterThanEqual(double minOccupancy);

    List<EventStatistics> findByTotalRegisteredGreaterThan(int minRegistered);

    @Query("SELECT s FROM EventStatistics s JOIN FETCH s.event e JOIN FETCH e.organizer o JOIN FETCH o.user u")
    List<EventStatistics> findAllWithEventAndOrganizer();
}
