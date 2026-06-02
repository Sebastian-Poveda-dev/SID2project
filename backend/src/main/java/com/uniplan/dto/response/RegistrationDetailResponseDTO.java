package com.uniplan.dto.response;

import com.uniplan.entity.enums.RegistrationStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class RegistrationDetailResponseDTO {

    Long studentId;
    String fullName;
    String institutionalStudentId;
    String institutionalEmail;
    RegistrationStatus registrationStatus;
    LocalDateTime registrationDate;
}
