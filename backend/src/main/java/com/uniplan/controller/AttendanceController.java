package com.uniplan.controller;

import com.uniplan.dto.request.AttendanceUpdateRequestDTO;
import com.uniplan.dto.response.AttendanceResponseDTO;
import com.uniplan.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PutMapping("/{eventId}/{studentId}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<AttendanceResponseDTO> update(
            @PathVariable Long eventId,
            @PathVariable Long studentId,
            @Valid @RequestBody AttendanceUpdateRequestDTO request) {
        return ResponseEntity.ok(attendanceService.update(eventId, studentId, request));
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<List<AttendanceResponseDTO>> findByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(attendanceService.findByEvent(eventId));
    }
}
