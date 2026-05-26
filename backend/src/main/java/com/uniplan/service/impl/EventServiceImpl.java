package com.uniplan.service.impl;

import com.uniplan.document.EventDetailDocument;
import com.uniplan.document.enums.DocumentEventType;
import com.uniplan.dto.request.CreateEventRequestDTO;
import com.uniplan.dto.request.UpdateEventRequestDTO;
import com.uniplan.dto.response.EventDetailResponseDTO;
import com.uniplan.dto.response.EventSummaryResponseDTO;
import com.uniplan.entity.Event;
import com.uniplan.entity.OrganizerProfile;
import com.uniplan.entity.UniplanUser;
import com.uniplan.entity.enums.EventStatus;
import com.uniplan.entity.enums.EventType;
import com.uniplan.exception.BusinessValidationException;
import com.uniplan.exception.InvalidEventStateException;
import com.uniplan.exception.ResourceNotFoundException;
import com.uniplan.exception.UnauthorizedOperationException;
import com.uniplan.repository.jpa.EventRepository;
import com.uniplan.repository.jpa.OrganizerProfileRepository;
import com.uniplan.repository.jpa.UniplanUserRepository;
import com.uniplan.repository.mongo.EventDetailRepository;
import com.uniplan.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final OrganizerProfileRepository organizerProfileRepository;
    private final UniplanUserRepository userRepository;
    private final EventDetailRepository eventDetailRepository;

    // -------------------------------------------------------------------------
    // Queries
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<EventSummaryResponseDTO> findAll(EventType eventType, EventStatus status,
                                                  LocalDateTime startDate, LocalDateTime endDate) {
        return eventRepository.findAll().stream()
                .filter(e -> eventType == null || e.getEventType() == eventType)
                .filter(e -> status == null || e.getStatus() == status)
                .filter(e -> startDate == null || !e.getStartDateTime().isBefore(startDate))
                .filter(e -> endDate == null || !e.getStartDateTime().isAfter(endDate))
                .map(this::toSummaryDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EventDetailResponseDTO findById(Long eventId) {
        Event event = requireEvent(eventId);
        EventDetailDocument doc = eventDetailRepository.findByEventId(eventId).orElse(null);
        return mergeToDetailDTO(event, doc);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventSummaryResponseDTO> findUpcoming() {
        return eventRepository.findUpcomingPublished(LocalDateTime.now())
                .stream().map(this::toSummaryDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventSummaryResponseDTO> search(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return eventRepository.findAll().stream().map(this::toSummaryDTO).toList();
        }
        String lower = keyword.toLowerCase();
        return eventRepository.findAll().stream()
                .filter(e -> e.getTitle().toLowerCase().contains(lower)
                        || (e.getDescription() != null && e.getDescription().toLowerCase().contains(lower)))
                .map(this::toSummaryDTO)
                .toList();
    }

    // -------------------------------------------------------------------------
    // Commands
    // -------------------------------------------------------------------------

    @Override
    public EventDetailResponseDTO create(CreateEventRequestDTO request) {
        validateEventDates(request.getStartDateTime(), request.getEndDateTime());

        // Organizer identity comes from the security context.
        // Once JWT is active, SecurityContextHolder will hold the authenticated principal.
        OrganizerProfile organizer = resolveCurrentOrganizer();

        Event event = Event.builder()
                .eventCode(generateEventCode())
                .title(request.getTitle())
                .description(request.getDescription())
                .eventType(request.getEventType())
                .startDateTime(request.getStartDateTime())
                .endDateTime(request.getEndDateTime())
                .location(request.getLocation())
                .maxCapacity(request.getMaxCapacity())
                .availableSlots(request.getMaxCapacity())
                .status(EventStatus.DRAFT)
                .organizer(organizer)
                .build();

        event = eventRepository.save(event);

        // MongoDB document is always created so that dynamicData / tags can be added later.
        EventDetailDocument doc = EventDetailDocument.builder()
                .eventId(event.getId())
                .eventType(DocumentEventType.valueOf(event.getEventType().name()))
                .dynamicData(request.getDynamicData())
                .tags(request.getTags())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        doc = eventDetailRepository.save(doc);

        return mergeToDetailDTO(event, doc);
    }

    @Override
    public EventDetailResponseDTO update(Long eventId, UpdateEventRequestDTO request) {
        Event event = requireEvent(eventId);

        if (event.getStatus() == EventStatus.CANCELLED || event.getStatus() == EventStatus.COMPLETED) {
            throw new InvalidEventStateException(
                    "Cannot update an event with status: " + event.getStatus());
        }

        applyRelationalUpdates(event, request);
        event = eventRepository.save(event);

        // Capture type after save so it can be used inside the lambda below.
        DocumentEventType savedDocType = DocumentEventType.valueOf(event.getEventType().name());

        // Sync MongoDB only when flexible fields are present in the request.
        if (request.getDynamicData() != null || request.getTags() != null) {
            EventDetailDocument doc = eventDetailRepository.findByEventId(eventId)
                    .orElseGet(() -> EventDetailDocument.builder()
                            .eventId(eventId)
                            .eventType(savedDocType)
                            .createdAt(LocalDateTime.now())
                            .build());
            if (request.getDynamicData() != null) doc.setDynamicData(request.getDynamicData());
            if (request.getTags() != null)         doc.setTags(request.getTags());
            doc.setUpdatedAt(LocalDateTime.now());
            eventDetailRepository.save(doc);
        }

        EventDetailDocument doc = eventDetailRepository.findByEventId(eventId).orElse(null);
        return mergeToDetailDTO(event, doc);
    }

    @Override
    public EventDetailResponseDTO publish(Long eventId) {
        Event event = requireEvent(eventId);

        OrganizerProfile organizer = resolveCurrentOrganizer();
        if (!event.getOrganizer().getId().equals(organizer.getId())) {
            throw new UnauthorizedOperationException("Only the event's organizer can publish it");
        }

        if (event.getStatus() != EventStatus.DRAFT) {
            throw new InvalidEventStateException(
                    "Only DRAFT events can be published. Current status: " + event.getStatus());
        }

        event.setStatus(EventStatus.PUBLISHED);
        event = eventRepository.save(event);

        EventDetailDocument doc = eventDetailRepository.findByEventId(eventId).orElse(null);
        return mergeToDetailDTO(event, doc);
    }

    @Override
    public void cancel(Long eventId) {
        Event event = requireEvent(eventId);

        if (event.getStatus() == EventStatus.COMPLETED) {
            throw new InvalidEventStateException("Cannot cancel a completed event");
        }
        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new InvalidEventStateException("Event is already cancelled");
        }

        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private Event requireEvent(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));
    }

    /**
     * Resolves the organizer profile for the currently authenticated user.
     * Will work correctly once JWT populates the SecurityContext.
     */
    private OrganizerProfile resolveCurrentOrganizer() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UniplanUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedOperationException("Authentication required"));
        return organizerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new UnauthorizedOperationException(
                        "User '" + username + "' is not a registered organizer"));
    }

    private void validateEventDates(LocalDateTime start, LocalDateTime end) {
        if (!end.isAfter(start)) {
            throw new BusinessValidationException("End date/time must be after start date/time");
        }
    }

    private String generateEventCode() {
        String year = String.valueOf(LocalDateTime.now().getYear());
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "EVT-" + year + "-" + suffix;
    }

    private void applyRelationalUpdates(Event event, UpdateEventRequestDTO req) {
        if (req.getTitle() != null)       event.setTitle(req.getTitle());
        if (req.getDescription() != null) event.setDescription(req.getDescription());
        if (req.getEventType() != null)   event.setEventType(req.getEventType());
        if (req.getLocation() != null)    event.setLocation(req.getLocation());
        if (req.getStartDateTime() != null) event.setStartDateTime(req.getStartDateTime());
        if (req.getEndDateTime() != null)   event.setEndDateTime(req.getEndDateTime());

        if (req.getStartDateTime() != null || req.getEndDateTime() != null) {
            validateEventDates(event.getStartDateTime(), event.getEndDateTime());
        }

        if (req.getMaxCapacity() != null) {
            int delta = req.getMaxCapacity() - event.getMaxCapacity();
            event.setMaxCapacity(req.getMaxCapacity());
            // Adjust available slots proportionally; never go below zero.
            event.setAvailableSlots(Math.max(0, event.getAvailableSlots() + delta));
        }
    }

    // -------------------------------------------------------------------------
    // Mapping
    // -------------------------------------------------------------------------

    /**
     * Merges PostgreSQL event data with MongoDB dynamic data into a single response.
     * The dual-database origin is fully transparent to the API consumer.
     */
    private EventDetailResponseDTO mergeToDetailDTO(Event event, EventDetailDocument doc) {
        return EventDetailResponseDTO.builder()
                .id(event.getId())
                .eventCode(event.getEventCode())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventType(event.getEventType())
                .startDateTime(event.getStartDateTime())
                .endDateTime(event.getEndDateTime())
                .location(event.getLocation())
                .maxCapacity(event.getMaxCapacity())
                .availableSlots(event.getAvailableSlots())
                .status(event.getStatus())
                .organizerName(event.getOrganizer().getUser().getUsername())
                .createdAt(event.getCreatedAt())
                .dynamicData(doc != null ? doc.getDynamicData() : null)
                .tags(doc != null ? doc.getTags() : null)
                .build();
    }

    private EventSummaryResponseDTO toSummaryDTO(Event event) {
        return EventSummaryResponseDTO.builder()
                .id(event.getId())
                .eventCode(event.getEventCode())
                .title(event.getTitle())
                .eventType(event.getEventType())
                .startDateTime(event.getStartDateTime())
                .location(event.getLocation())
                .availableSlots(event.getAvailableSlots())
                .status(event.getStatus())
                .build();
    }
}
