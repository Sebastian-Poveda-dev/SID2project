package com.uniplan.dto.response;

import com.uniplan.entity.enums.UserRole;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AuthResponseDTO {

    String token;
    String username;
    UserRole role;
}
