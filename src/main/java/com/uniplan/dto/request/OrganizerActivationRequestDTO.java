package com.uniplan.dto.request;

import com.uniplan.entity.enums.OrganizerType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizerActivationRequestDTO {

    @NotNull
    private Long userId;

    @NotNull
    private OrganizerType organizerType;
}
