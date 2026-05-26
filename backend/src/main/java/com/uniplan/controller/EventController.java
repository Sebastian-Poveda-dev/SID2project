package com.uniplan.controller;

import com.uniplan.dto.request.CreateEventRequestDTO;
import com.uniplan.dto.request.UpdateEventRequestDTO;
import com.uniplan.dto.response.EventDetailResponseDTO;
import com.uniplan.dto.response.EventSummaryResponseDTO;
import com.uniplan.entity.enums.EventStatus;
import com.uniplan.entity.enums.EventType;
import com.uniplan.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventSummaryResponseDTO>> findAll(
            @RequestParam(required = false) EventType eventType,
            @RequestParam(required = false) EventStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(eventService.findAll(eventType, status, startDate, endDate));
    }

    // Declared before /{eventId} to prevent path collision
    @GetMapping("/upcoming")
    public ResponseEntity<List<EventSummaryResponseDTO>> findUpcoming() {
        return ResponseEntity.ok(eventService.findUpcoming());
    }

    @GetMapping("/search")
    public ResponseEntity<List<EventSummaryResponseDTO>> search(
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(eventService.search(keyword));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<EventDetailResponseDTO> findById(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.findById(eventId));
    }

    @PostMapping
    public ResponseEntity<EventDetailResponseDTO> create(
            @Valid @RequestBody CreateEventRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.create(request));
    }

    @PatchMapping("/{eventId}/publish")
    public ResponseEntity<EventDetailResponseDTO> publish(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.publish(eventId));
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<EventDetailResponseDTO> update(
            @PathVariable Long eventId,
            @Valid @RequestBody UpdateEventRequestDTO request) {
        return ResponseEntity.ok(eventService.update(eventId, request));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> cancel(@PathVariable Long eventId) {
        eventService.cancel(eventId);
        return ResponseEntity.noContent().build();
    }
}
