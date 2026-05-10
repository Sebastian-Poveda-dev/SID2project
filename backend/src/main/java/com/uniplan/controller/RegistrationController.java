package com.uniplan.controller;

import com.uniplan.dto.request.RegistrationRequestDTO;
import com.uniplan.dto.response.RegistrationResponseDTO;
import com.uniplan.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    // studentId is a temporary param — will be extracted from SecurityContext once JWT is active
    @PostMapping
    public ResponseEntity<RegistrationResponseDTO> register(
            @Valid @RequestBody RegistrationRequestDTO request,
            @RequestParam Long studentId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(registrationService.register(request.getEventId(), studentId));
    }

    // studentId is a temporary param — will be extracted from SecurityContext once JWT is active
    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> cancel(
            @PathVariable Long eventId,
            @RequestParam Long studentId) {
        registrationService.cancel(eventId, studentId);
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
