package com.uniplan.service;

import com.uniplan.dto.response.RegistrationDetailResponseDTO;
import com.uniplan.dto.response.RegistrationResponseDTO;

import java.util.List;

public interface RegistrationService {

    RegistrationResponseDTO register(Long eventId, Long studentId);

    void cancel(Long eventId, Long studentId);

    List<RegistrationResponseDTO> findByStudent(Long studentId);

    List<RegistrationResponseDTO> findByEvent(Long eventId);

    List<RegistrationDetailResponseDTO> findDetailsByEvent(Long eventId);

    String exportEventRegistrationsCsv(Long eventId);
}
