package com.uniplan.dto.response;

import com.uniplan.entity.enums.UserRole;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class UserResponseDTO {

    Long id;
    String username;
    UserRole role;
    boolean active;
    LocalDateTime createdAt;
}
