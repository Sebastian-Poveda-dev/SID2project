package com.uniplan.service.impl;

import com.uniplan.dto.request.AttendanceUpdateRequestDTO;
import com.uniplan.dto.response.AttendanceResponseDTO;
import com.uniplan.entity.EventAttendance;
import com.uniplan.entity.EventRegistration;
import com.uniplan.entity.enums.RegistrationStatus;
import com.uniplan.exception.InvalidEventStateException;
import com.uniplan.exception.ResourceNotFoundException;
import com.uniplan.repository.jpa.EventAttendanceRepository;
import com.uniplan.repository.jpa.EventRegistrationRepository;
import com.uniplan.repository.jpa.EventStatisticsRepository;
import com.uniplan.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final EventAttendanceRepository attendanceRepository;
    private final EventRegistrationRepository registrationRepository;
    private final EventStatisticsRepository statisticsRepository;

    /**
     * Marks or unmarks attendance for a registered student.
     * Creates the attendance record on first call; updates on subsequent calls (upsert).
     * Immediately refreshes the totalAttended field in EventStatistics.
     */
    @Override
    public AttendanceResponseDTO update(Long eventId, Long studentId, AttendanceUpdateRequestDTO request) {
        EventRegistration registration = registrationRepository
                .findByIdEventIdAndIdStudentUserId(eventId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Registration not found for event " + eventId + " and student " + studentId));

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new InvalidEventStateException("Cannot mark attendance for a cancelled registration");
        }

        EventAttendance attendance = attendanceRepository
                .findByRegistrationIdEventIdAndRegistrationIdStudentUserId(eventId, studentId)
                .orElseGet(() -> EventAttendance.builder().registration(registration).build());

        attendance.setAttended(request.getAttended());
        attendance.setAttendanceTime(request.getAttended() ? LocalDateTime.now() : null);
        attendance = attendanceRepository.save(attendance);

        refreshAttendanceStatistics(eventId);

        return toDTO(eventId, studentId, attendance);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> findByEvent(Long eventId) {
        return attendanceRepository.findByRegistrationIdEventId(eventId).stream()
                .map(a -> toDTO(
                        a.getRegistration().getId().getEventId(),
                        a.getRegistration().getId().getStudentUserId(),
                        a))
                .toList();
    }

    // -------------------------------------------------------------------------
    // Statistics refresh
    // -------------------------------------------------------------------------

    /**
     * Recomputes totalAttended for the event after any attendance change.
     * The record is only updated if an EventStatistics entry already exists
     * (created by RegistrationService on first registration).
     */
    private void refreshAttendanceStatistics(Long eventId) {
        statisticsRepository.findByEventId(eventId).ifPresent(stats -> {
            long attended = attendanceRepository.countByRegistrationIdEventIdAndAttendedTrue(eventId);
            stats.setTotalAttended((int) attended);
            statisticsRepository.save(stats);
        });
    }

    // -------------------------------------------------------------------------
    // Mapping
    // -------------------------------------------------------------------------

    private AttendanceResponseDTO toDTO(Long eventId, Long studentId, EventAttendance attendance) {
        return AttendanceResponseDTO.builder()
                .eventId(eventId)
                .studentId(studentId)
                .attended(attendance.isAttended())
                .attendanceTime(attendance.getAttendanceTime())
                .build();
    }
}
