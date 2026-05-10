package com.uniplan.dto.response;

import com.uniplan.entity.enums.OrganizerType;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class OrganizerResponseDTO {

    Long id;
    String username;
    OrganizerType organizerType;
    boolean enabled;
}
