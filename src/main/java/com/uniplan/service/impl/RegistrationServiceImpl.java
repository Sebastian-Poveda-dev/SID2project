package com.uniplan.service.impl;

import com.uniplan.document.EventDetailDocument;
import com.uniplan.dto.response.RegistrationResponseDTO;
import com.uniplan.entity.Event;
import com.uniplan.entity.EventRegistration;
import com.uniplan.entity.EventStatistics;
import com.uniplan.entity.UniplanUser;
import com.uniplan.entity.enums.EventStatus;
import com.uniplan.entity.enums.EventType;
import com.uniplan.entity.enums.RegistrationStatus;
import com.uniplan.entity.ids.EventRegistrationId;
import com.uniplan.exception.BusinessValidationException;
import com.uniplan.exception.CapacityExceededException;
import com.uniplan.exception.DuplicateRegistrationException;
import com.uniplan.exception.InvalidEventStateException;
import com.uniplan.exception.ResourceNotFoundException;
import com.uniplan.repository.jpa.EventRepository;
import com.uniplan.repository.jpa.EventRegistrationRepository;
import com.uniplan.repository.jpa.EventStatisticsRepository;
import com.uniplan.repository.jpa.UniplanUserRepository;
import com.uniplan.repository.jpa.VolunteerParticipationRepository;
import com.uniplan.repository.mongo.EventDetailRepository;
import com.uniplan.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class RegistrationServiceImpl implements RegistrationService {

    private final EventRepository eventRepository;
    private final UniplanUserRepository userRepository;
    private final EventRegistrationRepository registrationRepository;
    private final EventDetailRepository eventDetailRepository;
    private final VolunteerParticipationRepository volunteerRepository;
    private final EventStatisticsRepository statisticsRepository;

    // -------------------------------------------------------------------------
    // Commands
    // -------------------------------------------------------------------------

    @Override
    public RegistrationResponseDTO register(Long eventId, Long studentId) {
        Event event = requireEvent(eventId);
        UniplanUser student = requireStudent(studentId);

        validateEventIsOpen(event);
        validateSlotsAvailable(event);
        validateNoDuplicate(eventId, studentId);
        performTypeSpecificValidation(event, student);

        event.setAvailableSlots(event.getAvailableSlots() - 1);
        eventRepository.save(event);

        EventRegistration registration = EventRegistration.builder()
                .id(new EventRegistrationId(eventId, studentId))
                .event(event)
                .student(student)
                .status(RegistrationStatus.REGISTERED)
                .build();

        registration = registrationRepository.save(registration);
        refreshStatistics(event);

        return toDTO(registration);
    }

    @Override
    public void cancel(Long eventId, Long studentId) {
        EventRegistration registration = registrationRepository
                .findByIdEventIdAndIdStudentUserId(eventId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Registration not found for event " + eventId + " and student " + studentId));

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new InvalidEventStateException("Registration is already cancelled");
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        registration.setCancellationDate(LocalDateTime.now());
        registrationRepository.save(registration);

        Event event = registration.getEvent();
        event.setAvailableSlots(event.getAvailableSlots() + 1);
        eventRepository.save(event);

        refreshStatistics(event);
    }

    // -------------------------------------------------------------------------
    // Queries
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<RegistrationResponseDTO> findByStudent(Long studentId) {
        return registrationRepository.findByIdStudentUserId(studentId).stream()
                .map(this::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistrationResponseDTO> findByEvent(Long eventId) {
        return registrationRepository.findByIdEventId(eventId).stream()
                .map(this::toDTO).toList();
    }

    // -------------------------------------------------------------------------
    // General validators
    // -------------------------------------------------------------------------

    private void validateEventIsOpen(Event event) {
        if (event.getStatus() != EventStatus.PUBLISHED && event.getStatus() != EventStatus.ONGOING) {
            throw new InvalidEventStateException(
                    "Event is not open for registration. Current status: " + event.getStatus());
        }
    }

    private void validateSlotsAvailable(Event event) {
        if (event.getAvailableSlots() <= 0) {
            throw new CapacityExceededException("No available slots for event: " + event.getId());
        }
    }

    private void validateNoDuplicate(Long eventId, Long studentId) {
        if (registrationRepository.existsByIdEventIdAndIdStudentUserId(eventId, studentId)) {
            throw new DuplicateRegistrationException(
                    "Student " + studentId + " is already registered for event " + eventId);
        }
    }

    // -------------------------------------------------------------------------
    // Type-specific validators
    // -------------------------------------------------------------------------

    private void performTypeSpecificValidation(Event event, UniplanUser student) {
        switch (event.getEventType()) {
            case WORKSHOP        -> validateWorkshopPrerequisites(event, student);
            case SPORTS_TOURNAMENT -> validateNoTournamentOverlap(student.getId(), event);
            case VOLUNTEER       -> validateVolunteerHours(event, student);
            case TALK, OTHER     -> { /* Only general capacity check required */ }
        }
    }

    /**
     * Workshop prerequisite validation.
     *
     * The dynamicData (MongoDB) may contain:
     *   - "requiredCourse"    (String)  — subject code the student must have passed
     *   - "minimumSemester"  (Integer) — minimum semester the student must be in
     *
     * TODO: Wire a read-only JdbcTemplate / InstitutionalDataService to query the
     * institutional ENROLLMENTS table:
     *   SELECT COUNT(*) FROM ENROLLMENTS e
     *   WHERE e.student_id = ? AND e.NRC IN (
     *     SELECT NRC FROM GROUPS WHERE subject_code = ?
     *   ) AND e.status = 'Passed'
     *
     * Until the institutional data source is configured, prerequisite checks are
     * logged but do not block registration.
     */
    private void validateWorkshopPrerequisites(Event event, UniplanUser student) {
        EventDetailDocument doc = eventDetailRepository.findByEventId(event.getId()).orElse(null);
        if (doc == null || doc.getDynamicData() == null) return;

        Map<String, Object> data = doc.getDynamicData();
        Object requiredCourse   = data.get("requiredCourse");
        Object minimumSemester  = data.get("minimumSemester");

        if (requiredCourse != null || minimumSemester != null) {
            // Institutional DB not yet wired — prerequisite check is a no-op.
            // Replace with real InstitutionalDataService calls once available.
        }
    }

    /**
     * Prevents a student from registering for two SPORTS_TOURNAMENT events
     * with overlapping time ranges.
     */
    private void validateNoTournamentOverlap(Long studentId, Event requested) {
        List<EventRegistration> active = registrationRepository
                .findByIdStudentUserIdAndStatus(studentId, RegistrationStatus.REGISTERED);

        for (EventRegistration reg : active) {
            Event existing = reg.getEvent();
            if (existing.getEventType() == EventType.SPORTS_TOURNAMENT
                    && !existing.getId().equals(requested.getId())
                    && overlaps(existing, requested)) {
                throw new BusinessValidationException(
                        "Student is already registered for a sports tournament that overlaps with this event");
            }
        }
    }

    private boolean overlaps(Event a, Event b) {
        return a.getStartDateTime().isBefore(b.getEndDateTime())
                && b.getStartDateTime().isBefore(a.getEndDateTime());
    }

    /**
     * Validates that the student has accumulated the required volunteer hours
     * declared in the event's MongoDB dynamicData ("requiredHours" key).
     */
    private void validateVolunteerHours(Event event, UniplanUser student) {
        EventDetailDocument doc = eventDetailRepository.findByEventId(event.getId()).orElse(null);
        if (doc == null || doc.getDynamicData() == null) return;

        Object requiredHoursObj = doc.getDynamicData().get("requiredHours");
        if (requiredHoursObj == null) return;

        double required  = ((Number) requiredHoursObj).doubleValue();
        double completed = volunteerRepository
                .sumValidatedHoursByStudentUserId(student.getId())
                .orElse(0.0);

        if (completed < required) {
            throw new BusinessValidationException(
                    "Student has " + completed + " validated volunteer hours but "
                    + required + " are required to register for this event");
        }
    }

    // -------------------------------------------------------------------------
    // Statistics refresh
    // -------------------------------------------------------------------------

    /**
     * Recomputes and persists registration-related statistics immediately after
     * any registration or cancellation. totalAttended is owned by AttendanceService
     * and is intentionally not touched here.
     */
    private void refreshStatistics(Event event) {
        Long eventId = event.getId();

        EventStatistics stats = statisticsRepository.findByEventId(eventId)
                .orElseGet(() -> EventStatistics.builder().event(event).build());

        long registered = registrationRepository.countByIdEventIdAndStatus(eventId, RegistrationStatus.REGISTERED);
        long cancelled  = registrationRepository.countByIdEventIdAndStatus(eventId, RegistrationStatus.CANCELLED);
        double occupancy = event.getMaxCapacity() > 0
                ? (registered / (double) event.getMaxCapacity()) * 100.0
                : 0.0;

        stats.setTotalRegistered((int) registered);
        stats.setTotalCancelled((int) cancelled);
        stats.setOccupancyPercentage(occupancy);
        statisticsRepository.save(stats);
    }

    // -------------------------------------------------------------------------
    // Mapping
    // -------------------------------------------------------------------------

    private RegistrationResponseDTO toDTO(EventRegistration reg) {
        return RegistrationResponseDTO.builder()
                .eventId(reg.getId().getEventId())
                .studentId(reg.getId().getStudentUserId())
                .registrationStatus(reg.getStatus())
                .registrationDate(reg.getRegistrationDate())
                .build();
    }

    // -------------------------------------------------------------------------
    // Lookups
    // -------------------------------------------------------------------------

    private Event requireEvent(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));
    }

    private UniplanUser requireStudent(Long studentId) {
        return userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
    }
}
