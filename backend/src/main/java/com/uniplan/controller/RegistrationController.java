package com.uniplan.controller;

import com.uniplan.dto.request.RegistrationRequestDTO;
import com.uniplan.dto.response.RegistrationResponseDTO;
import com.uniplan.security.service.CustomUserDetails;
import com.uniplan.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<RegistrationResponseDTO> register(
            @Valid @RequestBody RegistrationRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(registrationService.register(request.getEventId(), userDetails.getUserId()));
    }

    @DeleteMapping("/{eventId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> cancel(
            @PathVariable Long eventId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        registrationService.cancel(eventId, userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<RegistrationResponseDTO>> findByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(registrationService.findByStudent(studentId));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<RegistrationResponseDTO>> findByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(registrationService.findByEvent(eventId));
    }
}
