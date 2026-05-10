package com.uniplan.service;

import com.uniplan.dto.request.OrganizerActivationRequestDTO;
import com.uniplan.dto.response.OrganizerResponseDTO;

import java.util.List;

public interface OrganizerService {

    OrganizerResponseDTO activate(OrganizerActivationRequestDTO request);

    List<OrganizerResponseDTO> findAll();

    OrganizerResponseDTO findById(Long organizerId);
}
