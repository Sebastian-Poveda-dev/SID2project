package com.uniplan.controller;

import com.uniplan.dto.response.EventStatisticsResponseDTO;
import com.uniplan.dto.response.EventSummaryResponseDTO;
import com.uniplan.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/events/{eventId}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<EventStatisticsResponseDTO> findByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(statisticsService.findByEvent(eventId));
    }

    @GetMapping("/popular-events")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<List<EventSummaryResponseDTO>> findPopularEvents() {
        return ResponseEntity.ok(statisticsService.findPopularEvents());
    }

    @GetMapping("/occupancy")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<List<EventStatisticsResponseDTO>> findOccupancyReport() {
        return ResponseEntity.ok(statisticsService.findOccupancyReport());
    }
}
