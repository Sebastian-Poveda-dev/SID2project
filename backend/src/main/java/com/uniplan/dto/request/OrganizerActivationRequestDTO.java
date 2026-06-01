package com.uniplan.dto.request;

import com.uniplan.entity.enums.OrganizerType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizerActivationRequestDTO {

    @NotNull(message = "El tipo de organizador es requerido")
    private OrganizerType organizerType;

    // ── STUDENT_LEADER: must reference an existing UniPlan user ──────────────
    private Long userId;

    // ── FACULTY_MEMBER / WELLNESS_STAFF: admin creates their account ─────────
    @Size(max = 15)
    private String institutionalEmployeeId;

    @Email
    @Size(max = 100)
    private String institutionalEmail;

    @Size(min = 3, max = 50)
    private String username;

    @Size(max = 60)
    private String firstName;

    @Size(max = 60)
    private String lastName;

    @Size(min = 8, max = 255)
    private String temporaryPassword;

    // ── FACULTY_MEMBER specific ───────────────────────────────────────────────
    private Integer facultyCode;

    @Size(max = 100)
    private String department;

    @Size(max = 100)
    private String specializationArea;

    // ── STUDENT_LEADER specific ───────────────────────────────────────────────
    private Integer academicProgramCode;

    @Size(max = 10)
    private String semester;

    @Size(max = 100)
    private String studentGroup;

    // ── WELLNESS_STAFF specific ───────────────────────────────────────────────
    private Integer administrativeAreaCode;

    @Size(max = 100)
    private String jobTitle;
}
