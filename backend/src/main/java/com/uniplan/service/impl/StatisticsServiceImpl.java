package com.uniplan.service.impl;

import com.uniplan.dto.response.EventStatisticsResponseDTO;
import com.uniplan.dto.response.EventSummaryResponseDTO;
import com.uniplan.entity.Event;
import com.uniplan.entity.EventStatistics;
import com.uniplan.exception.ResourceNotFoundException;
import com.uniplan.exception.UnauthorizedOperationException;
import com.uniplan.repository.jpa.EventStatisticsRepository;
import com.uniplan.repository.jpa.OrganizerProfileRepository;
import com.uniplan.repository.jpa.UniplanUserRepository;
import com.uniplan.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsServiceImpl implements StatisticsService {

    private final EventStatisticsRepository statisticsRepository;
    private final OrganizerProfileRepository organizerProfileRepository;
    private final UniplanUserRepository userRepository;

    @Override
    public EventStatisticsResponseDTO findByEvent(Long eventId) {
        EventStatistics stats = statisticsRepository.findByEventId(eventId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Statistics not found for event: " + eventId));
        requireOwnershipOrAdmin(stats.getEvent());
        return toStatisticsDTO(stats);
    }

    /**
     * ADMIN can access any event's statistics.
     * EMPLOYEE can only access statistics for events they own.
     */
    private void requireOwnershipOrAdmin(Event event) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) return;

        String username = auth.getName();
        userRepository.findByUsername(username).ifPresent(user ->
            organizerProfileRepository.findByUserId(user.getId()).ifPresent(organizer -> {
                if (!event.getOrganizer().getId().equals(organizer.getId())) {
                    throw new UnauthorizedOperationException(
                            "Solo puedes consultar estadísticas de tus propios eventos.");
                }
            })
        );
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
                .description(event.getDescription())
                .eventType(event.getEventType())
                .startDateTime(event.getStartDateTime())
                .endDateTime(event.getEndDateTime())
                .location(event.getLocation())
                .availableSlots(event.getAvailableSlots())
                .status(event.getStatus())
                .build();
    }
}
