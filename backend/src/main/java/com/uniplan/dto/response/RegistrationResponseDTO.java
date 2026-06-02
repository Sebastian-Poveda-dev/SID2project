package com.uniplan.dto.response;

import com.uniplan.entity.enums.EventType;
import com.uniplan.entity.enums.RegistrationStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class RegistrationResponseDTO {

    Long eventId;
    String eventTitle;
    EventType eventType;
    LocalDateTime eventStartDateTime;
    Long studentId;
    RegistrationStatus registrationStatus;
    LocalDateTime registrationDate;
}
