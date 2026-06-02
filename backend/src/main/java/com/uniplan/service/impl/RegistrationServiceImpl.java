package com.uniplan.service.impl;

import com.uniplan.document.EventDetailDocument;
import com.uniplan.dto.response.RegistrationDetailResponseDTO;
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
import com.uniplan.repository.jpa.OrganizerProfileRepository;
import com.uniplan.repository.jpa.UniplanUserRepository;
import com.uniplan.repository.jpa.VolunteerParticipationRepository;
import com.uniplan.repository.mongo.EventDetailRepository;
import com.uniplan.exception.UnauthorizedOperationException;
import com.uniplan.service.InstitutionalValidationService;
import com.uniplan.service.RegistrationService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
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
    private final OrganizerProfileRepository organizerProfileRepository;
    private final InstitutionalValidationService institutionalValidationService;

    // -------------------------------------------------------------------------
    // Commands
    // -------------------------------------------------------------------------

    @Override
    public RegistrationResponseDTO register(Long eventId, Long studentId) {
        Event event = requireEvent(eventId);
        UniplanUser student = requireStudent(studentId);

        validateEventIsOpen(event);
        validateSlotsAvailable(event);
        performTypeSpecificValidation(event, student);

        EventRegistration registration = registrationRepository
                .findByIdEventIdAndIdStudentUserId(eventId, studentId)
                .map(existing -> reactivate(existing, event))
                .orElseGet(() -> createNew(event, student));

        refreshStatistics(event);
        return toDTO(registration);
    }

    private EventRegistration reactivate(EventRegistration existing, Event event) {
        if (existing.getStatus() == RegistrationStatus.REGISTERED) {
            throw new DuplicateRegistrationException(
                    "El estudiante ya está inscrito en este evento.");
        }
        existing.setStatus(RegistrationStatus.REGISTERED);
        existing.setRegistrationDate(LocalDateTime.now());
        existing.setCancellationDate(null);
        event.setAvailableSlots(event.getAvailableSlots() - 1);
        eventRepository.save(event);
        return registrationRepository.save(existing);
    }

    private EventRegistration createNew(Event event, UniplanUser student) {
        event.setAvailableSlots(event.getAvailableSlots() - 1);
        eventRepository.save(event);
        return registrationRepository.save(EventRegistration.builder()
                .id(new EventRegistrationId(event.getId(), student.getId()))
                .event(event)
                .student(student)
                .status(RegistrationStatus.REGISTERED)
                .build());
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

    @Override
    @Transactional(readOnly = true)
    public List<RegistrationDetailResponseDTO> findDetailsByEvent(Long eventId) {
        requireEvent(eventId);
        requireEventOwnershipOrAdmin(eventId);
        return registrationRepository.findByIdEventIdAndStatus(eventId, RegistrationStatus.REGISTERED)
                .stream()
                .map(this::toDetailDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public String exportEventRegistrationsCsv(Long eventId) {
        requireEvent(eventId);
        requireEventOwnershipOrAdmin(eventId);
        List<RegistrationDetailResponseDTO> registrations = findDetailsByEvent(eventId);

        StringBuilder csv = new StringBuilder();
        csv.append("Nombre Completo,Código Estudiantil,Correo Institucional,Estado,Fecha Inscripción\n");

        for (RegistrationDetailResponseDTO r : registrations) {
            csv.append(escapeCsv(r.getFullName())).append(",")
               .append(escapeCsv(r.getInstitutionalStudentId())).append(",")
               .append(escapeCsv(r.getInstitutionalEmail())).append(",")
               .append(r.getRegistrationStatus()).append(",")
               .append(r.getRegistrationDate() != null ? r.getRegistrationDate().toString() : "")
               .append("\n");
        }
        return csv.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
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
            throw new CapacityExceededException("No hay cupos disponibles para este evento.");
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
     * Verifies workshop prerequisites against the institutional DB.
     * - requiredCourse: student must have status='Approved' for that subject
     * - minimumSemester: student must have completed that many distinct semesters
     * Delegates to InstitutionalValidationService (real or bypass depending on config).
     */
    private Optional<EventDetailDocument> safeGetDetail(Long eventId) {
        try {
            return eventDetailRepository.findByEventId(eventId);
        } catch (Exception e) {
            log.warn("[Registration] MongoDB unavailable, skipping dynamic-data validation for event {}: {}", eventId, e.getMessage());
            return Optional.empty();
        }
    }

    private void validateWorkshopPrerequisites(Event event, UniplanUser student) {
        String institutionalStudentId = student.getInstitutionalStudentId();
        if (institutionalStudentId == null) return;

        EventDetailDocument doc = safeGetDetail(event.getId()).orElse(null);
        if (doc == null || doc.getDynamicData() == null) return;

        Map<String, Object> data = doc.getDynamicData();
        String requiredCourse = data.get("requiredCourse") != null
                ? String.valueOf(data.get("requiredCourse")) : null;
        Integer minimumSemester = data.get("minimumSemester") != null
                ? ((Number) data.get("minimumSemester")).intValue() : null;

        if (requiredCourse == null && minimumSemester == null) return;

        institutionalValidationService.validateWorkshopPrerequisites(
                institutionalStudentId, requiredCourse, minimumSemester);
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
                        "Ya estás inscrito en un torneo deportivo que se superpone con el horario de este evento.");
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
        EventDetailDocument doc = safeGetDetail(event.getId()).orElse(null);
        if (doc == null || doc.getDynamicData() == null) return;

        Object requiredHoursObj = doc.getDynamicData().get("requiredHours");
        if (requiredHoursObj == null) return;

        double required  = ((Number) requiredHoursObj).doubleValue();
        double completed = volunteerRepository
                .sumValidatedHoursByStudentUserId(student.getId())
                .orElse(0.0);

        if (completed < required) {
            throw new BusinessValidationException(
                    "Este evento requiere " + required + " horas de voluntariado validadas. " +
                    "Tienes " + completed + " horas registradas.");
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
                .eventTitle(reg.getEvent().getTitle())
                .eventType(reg.getEvent().getEventType())
                .eventStartDateTime(reg.getEvent().getStartDateTime())
                .studentId(reg.getId().getStudentUserId())
                .registrationStatus(reg.getStatus())
                .registrationDate(reg.getRegistrationDate())
                .build();
    }

    private RegistrationDetailResponseDTO toDetailDTO(EventRegistration reg) {
        UniplanUser student = reg.getStudent();
        String fullName = student.getFirstName() + " " + student.getLastName();
        return RegistrationDetailResponseDTO.builder()
                .studentId(student.getId())
                .fullName(fullName.trim())
                .institutionalStudentId(student.getInstitutionalStudentId())
                .institutionalEmail(student.getInstitutionalEmail())
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

    /**
     * ADMIN can access any event's data.
     * EMPLOYEE can only access events they own as organizer.
     */
    private void requireEventOwnershipOrAdmin(Long eventId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        if (isAdmin) return;

        String username = auth.getName();
        UniplanUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedOperationException("Usuario no encontrado."));
        organizerProfileRepository.findByUserId(user.getId()).ifPresent(organizer -> {
            Event event = requireEvent(eventId);
            if (!event.getOrganizer().getId().equals(organizer.getId())) {
                throw new UnauthorizedOperationException(
                        "Solo puedes acceder a los inscritos de tus propios eventos.");
            }
        });
    }
}
