package com.uniplan.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequestDTO {

    @NotBlank
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank
    @Size(max = 15)
    private String institutionalStudentId;

    @NotBlank
    @Email
    @Size(max = 100)
    private String institutionalEmail;

    @NotBlank
    @Size(min = 8, max = 255)
    private String password;
}
