package com.uniplan.dto.response;

import com.uniplan.entity.enums.EventStatus;
import com.uniplan.entity.enums.EventType;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class EventSummaryResponseDTO {

    Long id;
    String eventCode;
    String title;
    EventType eventType;
    LocalDateTime startDateTime;
    String location;
    int availableSlots;
    EventStatus status;
}
