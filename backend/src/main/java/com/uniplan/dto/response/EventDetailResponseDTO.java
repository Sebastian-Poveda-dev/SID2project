package com.uniplan.dto.response;

import com.uniplan.entity.enums.EventStatus;
import com.uniplan.entity.enums.EventType;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Full event detail that merges PostgreSQL base fields with MongoDB dynamic fields.
 * The API consumer sees a single unified response; the dual-database origin is transparent.
 */
@Value
@Builder
public class EventDetailResponseDTO {

    // --- From PostgreSQL (Event entity) ---

    Long id;
    String eventCode;
    String title;
    String description;
    EventType eventType;
    LocalDateTime startDateTime;
    LocalDateTime endDateTime;
    String location;
    int maxCapacity;
    int availableSlots;
    EventStatus status;
    String organizerName;
    LocalDateTime createdAt;

    // --- From MongoDB (EventDetailDocument) ---

    Map<String, Object> dynamicData;
    List<String> tags;
}
