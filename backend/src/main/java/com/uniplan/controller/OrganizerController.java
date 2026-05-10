package com.uniplan.controller;

import com.uniplan.dto.request.OrganizerActivationRequestDTO;
import com.uniplan.dto.response.OrganizerResponseDTO;
import com.uniplan.service.OrganizerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organizers")
@RequiredArgsConstructor
public class OrganizerController {

    private final OrganizerService organizerService;

    @PostMapping("/activate")
    public ResponseEntity<OrganizerResponseDTO> activate(
            @Valid @RequestBody OrganizerActivationRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(organizerService.activate(request));
    }

    @GetMapping
    public ResponseEntity<List<OrganizerResponseDTO>> findAll() {
        return ResponseEntity.ok(organizerService.findAll());
    }

    @GetMapping("/{organizerId}")
    public ResponseEntity<OrganizerResponseDTO> findById(@PathVariable Long organizerId) {
        return ResponseEntity.ok(organizerService.findById(organizerId));
    }
}
