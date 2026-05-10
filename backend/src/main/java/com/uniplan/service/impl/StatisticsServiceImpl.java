package com.uniplan.service.impl;

import com.uniplan.dto.response.EventStatisticsResponseDTO;
import com.uniplan.dto.response.EventSummaryResponseDTO;
import com.uniplan.entity.Event;
import com.uniplan.entity.EventStatistics;
import com.uniplan.exception.ResourceNotFoundException;
import com.uniplan.repository.jpa.EventStatisticsRepository;
import com.uniplan.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsServiceImpl implements StatisticsService {

    private final EventStatisticsRepository statisticsRepository;

    @Override
    public EventStatisticsResponseDTO findByEvent(Long eventId) {
        EventStatistics stats = statisticsRepository.findByEventId(eventId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Statistics not found for event: " + eventId));
        return toStatisticsDTO(stats);
    }

    /**
     * Returns events sorted descending by total registered count.
     * Only events that have at least one registration are included.
     */
    @Override
    public List<EventSummaryResponseDTO> findPopularEvents() {
        return statisticsRepository.findByTotalRegisteredGreaterThan(0).stream()
                .sorted(Comparator.comparingInt(EventStatistics::getTotalRegistered).reversed())
                .map(stats -> toEventSummaryDTO(stats.getEvent()))
                .toList();
    }

    /**
     * Full occupancy report sorted descending by occupancy percentage.
     * Includes all events regardless of registration count.
     */
    @Override
    public List<EventStatisticsResponseDTO> findOccupancyReport() {
        return statisticsRepository.findAll().stream()
                .sorted(Comparator.comparingDouble(EventStatistics::getOccupancyPercentage).reversed())
                .map(this::toStatisticsDTO)
                .toList();
    }

    // -------------------------------------------------------------------------
    // Mapping
    // -------------------------------------------------------------------------

    private EventStatisticsResponseDTO toStatisticsDTO(EventStatistics stats) {
        return EventStatisticsResponseDTO.builder()
                .eventId(stats.getEvent().getId())
                .totalRegistered(stats.getTotalRegistered())
                .totalCancelled(stats.getTotalCancelled())
                .totalAttended(stats.getTotalAttended())
                .occupancyPercentage(stats.getOccupancyPercentage())
                .lastUpdated(stats.getLastUpdated())
                .build();
    }

    private EventSummaryResponseDTO toEventSummaryDTO(Event event) {
        return EventSummaryResponseDTO.builder()
                .id(event.getId())
                .eventCode(event.getEventCode())
                .title(event.getTitle())
                .eventType(event.getEventType())
                .startDateTime(event.getStartDateTime())
                .location(event.getLocation())
                .availableSlots(event.getAvailableSlots())
                .status(event.getStatus())
                .build();
    }
}
