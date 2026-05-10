package com.uniplan.service;

import com.uniplan.dto.request.AttendanceUpdateRequestDTO;
import com.uniplan.dto.response.AttendanceResponseDTO;

import java.util.List;

public interface AttendanceService {

    AttendanceResponseDTO update(Long eventId, Long studentId, AttendanceUpdateRequestDTO request);

    List<AttendanceResponseDTO> findByEvent(Long eventId);
}
