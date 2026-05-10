package com.uniplan.repository.jpa;

import com.uniplan.entity.EventAttendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventAttendanceRepository extends JpaRepository<EventAttendance, Long> {

    // Navigation path: registration.id.eventId / registration.id.studentUserId
    Optional<EventAttendance> findByRegistrationIdEventIdAndRegistrationIdStudentUserId(
            Long eventId, Long studentUserId);

    boolean existsByRegistrationIdEventIdAndRegistrationIdStudentUserId(
            Long eventId, Long studentUserId);

    List<EventAttendance> findByRegistrationIdEventId(Long eventId);

    List<EventAttendance> findByRegistrationIdEventIdAndAttended(Long eventId, boolean attended);

    long countByRegistrationIdEventIdAndAttendedTrue(Long eventId);
}
