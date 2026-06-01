package com.uniplan.dto.response;

import com.uniplan.entity.enums.OrganizerType;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class OrganizerResponseDTO {

    Long id;
    String username;
    String institutionalId;
    OrganizerType organizerType;
    boolean enabled;

    // FACULTY_MEMBER
    Integer facultyCode;
    String department;
    String specializationArea;

    // STUDENT_LEADER
    Integer academicProgramCode;
    String semester;
    String studentGroup;

    // WELLNESS_STAFF
    Integer administrativeAreaCode;
    String jobTitle;
}
