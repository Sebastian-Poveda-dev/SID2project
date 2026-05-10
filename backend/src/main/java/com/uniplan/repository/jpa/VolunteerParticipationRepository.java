package com.uniplan.repository.jpa;

import com.uniplan.entity.VolunteerParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VolunteerParticipationRepository extends JpaRepository<VolunteerParticipation, Long> {

    // Navigation path: registration.id.eventId / registration.id.studentUserId
    List<VolunteerParticipation> findByRegistrationIdEventId(Long eventId);

    List<VolunteerParticipation> findByRegistrationIdStudentUserId(Long studentUserId);

    Optional<VolunteerParticipation> findByRegistrationIdEventIdAndRegistrationIdStudentUserId(
            Long eventId, Long studentUserId);

    boolean existsByRegistrationIdEventIdAndRegistrationIdStudentUserId(
            Long eventId, Long studentUserId);

    // Navigation path: validatedBy.id
    List<VolunteerParticipation> findByValidatedById(Long validatedByUserId);

    @Query("SELECT SUM(vp.validatedHours) FROM VolunteerParticipation vp WHERE vp.registration.id.studentUserId = :studentUserId")
    Optional<Double> sumValidatedHoursByStudentUserId(@Param("studentUserId") Long studentUserId);
}
