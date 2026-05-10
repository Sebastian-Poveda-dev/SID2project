package com.uniplan.repository.jpa;

import com.uniplan.entity.EventRegistration;
import com.uniplan.entity.enums.RegistrationStatus;
import com.uniplan.entity.ids.EventRegistrationId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, EventRegistrationId> {

    // Composite key navigation: id.eventId / id.studentUserId
    boolean existsByIdEventIdAndIdStudentUserId(Long eventId, Long studentUserId);

    Optional<EventRegistration> findByIdEventIdAndIdStudentUserId(Long eventId, Long studentUserId);

    List<EventRegistration> findByIdEventId(Long eventId);

    List<EventRegistration> findByIdStudentUserId(Long studentUserId);

    List<EventRegistration> findByIdEventIdAndStatus(Long eventId, RegistrationStatus status);

    List<EventRegistration> findByIdStudentUserIdAndStatus(Long studentUserId, RegistrationStatus status);

    long countByIdEventId(Long eventId);

    long countByIdEventIdAndStatus(Long eventId, RegistrationStatus status);
}
