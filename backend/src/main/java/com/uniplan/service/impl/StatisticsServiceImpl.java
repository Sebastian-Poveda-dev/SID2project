package com.uniplan.service.impl;

import com.uniplan.dto.response.EventStatisticsResponseDTO;
import com.uniplan.dto.response.EventSummaryResponseDTO;
import com.uniplan.dto.response.EventTypeStatisticsResponseDTO;
import com.uniplan.dto.response.OrganizerPerformanceResponseDTO;
import com.uniplan.dto.response.StatisticsSummaryResponseDTO;
import com.uniplan.entity.Event;
import com.uniplan.entity.EventStatistics;
import com.uniplan.entity.OrganizerProfile;
import com.uniplan.entity.UniplanUser;
import com.uniplan.entity.enums.EventType;
import com.uniplan.exception.ResourceNotFoundException;
import com.uniplan.exception.UnauthorizedOperationException;
import com.uniplan.repository.jpa.EventRepository;
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
import java.util.Map;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.summingInt;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsServiceImpl implements StatisticsService {

    private final EventStatisticsRepository statisticsRepository;
    private final EventRepository eventRepository;
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

    @Override
    public StatisticsSummaryResponseDTO getSummary() {
        List<EventStatistics> all = statisticsRepository.findAllWithEventAndOrganizer();
        List<Event> allEvents = eventRepository.findAll();

        Map<String, Integer> byStatus = allEvents.stream()
                .collect(groupingBy(e -> e.getStatus().name(), summingInt(e -> 1)));

        int totalRegistered  = all.stream().mapToInt(EventStatistics::getTotalRegistered).sum();
        int totalCancelled   = all.stream().mapToInt(EventStatistics::getTotalCancelled).sum();
        int totalAttended    = all.stream().mapToInt(EventStatistics::getTotalAttended).sum();
        double attendanceRate    = totalRegistered > 0 ? totalAttended  / (double) totalRegistered * 100 : 0.0;
        double cancellationRate  = (totalRegistered + totalCancelled) > 0
                ? totalCancelled / (double) (totalRegistered + totalCancelled) * 100 : 0.0;
        double avgOccupancy = all.stream().mapToDouble(EventStatistics::getOccupancyPercentage).average().orElse(0.0);

        String topEventType = all.stream()
                .collect(groupingBy(s -> s.getEvent().getEventType(), summingInt(EventStatistics::getTotalRegistered)))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> e.getKey().name())
                .orElse("N/A");

        return StatisticsSummaryResponseDTO.builder()
                .totalEvents(allEvents.size())
                .eventsByStatus(byStatus)
                .totalRegistrations(totalRegistered)
                .totalCancellations(totalCancelled)
                .totalAttendances(totalAttended)
                .globalAttendanceRate(attendanceRate)
                .globalCancellationRate(cancellationRate)
                .avgOccupancyPercentage(avgOccupancy)
                .topEventType(topEventType)
                .build();
    }

    @Override
    public List<EventTypeStatisticsResponseDTO> findByEventType() {
        List<EventStatistics> all = statisticsRepository.findAllWithEventAndOrganizer();

        return all.stream()
                .collect(groupingBy(s -> s.getEvent().getEventType()))
                .entrySet().stream()
                .map(entry -> {
                    EventType type = entry.getKey();
                    List<EventStatistics> stats = entry.getValue();
                    int registered = stats.stream().mapToInt(EventStatistics::getTotalRegistered).sum();
                    int cancelled  = stats.stream().mapToInt(EventStatistics::getTotalCancelled).sum();
                    int attended   = stats.stream().mapToInt(EventStatistics::getTotalAttended).sum();
                    double attendanceRate   = registered > 0 ? attended  / (double) registered * 100 : 0.0;
                    double cancellationRate = (registered + cancelled) > 0
                            ? cancelled / (double) (registered + cancelled) * 100 : 0.0;
                    return EventTypeStatisticsResponseDTO.builder()
                            .eventType(type)
                            .totalEvents(stats.size())
                            .totalRegistered(registered)
                            .totalCancelled(cancelled)
                            .totalAttended(attended)
                            .attendanceRate(attendanceRate)
                            .cancellationRate(cancellationRate)
                            .build();
                })
                .sorted(Comparator.comparingInt(EventTypeStatisticsResponseDTO::getTotalRegistered).reversed())
                .toList();
    }

    @Override
    public List<OrganizerPerformanceResponseDTO> findOrganizerPerformance() {
        List<EventStatistics> all = statisticsRepository.findAllWithEventAndOrganizer();

        return all.stream()
                .collect(groupingBy(s -> s.getEvent().getOrganizer()))
                .entrySet().stream()
                .map(entry -> {
                    OrganizerProfile org = entry.getKey();
                    List<EventStatistics> stats = entry.getValue();
                    int totalRegistered = stats.stream().mapToInt(EventStatistics::getTotalRegistered).sum();
                    int totalAttended   = stats.stream().mapToInt(EventStatistics::getTotalAttended).sum();
                    double avgOccupancy      = stats.stream().mapToDouble(EventStatistics::getOccupancyPercentage).average().orElse(0.0);
                    double avgAttendanceRate = totalRegistered > 0
                            ? totalAttended / (double) totalRegistered * 100 : 0.0;
                    UniplanUser user = org.getUser();
                    String displayName = (user.getFirstName() + " " + user.getLastName()).trim();
                    return OrganizerPerformanceResponseDTO.builder()
                            .organizerId(org.getId())
                            .displayName(displayName)
                            .organizerType(org.getOrganizerType())
                            .totalEvents(stats.size())
                            .totalRegistered(totalRegistered)
                            .avgOccupancyPercentage(avgOccupancy)
                            .avgAttendanceRate(avgAttendanceRate)
                            .build();
                })
                .sorted(Comparator.comparingDouble(OrganizerPerformanceResponseDTO::getAvgOccupancyPercentage).reversed())
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
