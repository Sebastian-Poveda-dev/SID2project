package com.uniplan.service.impl;

import com.uniplan.dto.request.LoginRequestDTO;
import com.uniplan.dto.request.RegisterRequestDTO;
import com.uniplan.dto.response.AuthResponseDTO;
import com.uniplan.entity.UniplanUser;
import com.uniplan.entity.enums.UserRole;
import com.uniplan.exception.DuplicateRegistrationException;
import com.uniplan.exception.ResourceNotFoundException;
import com.uniplan.exception.UnauthorizedOperationException;
import com.uniplan.repository.jpa.UniplanUserRepository;
import com.uniplan.security.jwt.JwtService;
import com.uniplan.security.service.CustomUserDetails;
import com.uniplan.service.AuthService;
import com.uniplan.service.InstitutionalValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UniplanUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final InstitutionalValidationService institutionalValidationService;

    @Override
    public AuthResponseDTO register(RegisterRequestDTO request) {

        // ── 1. Duplicates in UniPlan ──────────────────────────────────────────
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateRegistrationException(
                    "El nombre de usuario '" + request.getUsername() + "' ya está en uso.");
        }
        if (userRepository.findByInstitutionalStudentId(request.getInstitutionalStudentId()).isPresent()) {
            throw new DuplicateRegistrationException(
                    "El código estudiantil '" + request.getInstitutionalStudentId() + "' ya tiene una cuenta registrada.");
        }
        if (userRepository.existsByInstitutionalEmail(request.getInstitutionalEmail())) {
            throw new DuplicateRegistrationException(
                    "El correo institucional '" + request.getInstitutionalEmail() + "' ya tiene una cuenta registrada.");
        }

        // ── 2. Validate against institutional database ────────────────────────
        institutionalValidationService.validateStudentExists(
                request.getInstitutionalStudentId(),
                request.getInstitutionalEmail()
        );

        // ── 3. Persist ────────────────────────────────────────────────────────
        UniplanUser user = UniplanUser.builder()
                .username(request.getUsername())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.STUDENT)
                .institutionalStudentId(request.getInstitutionalStudentId())
                .institutionalEmail(request.getInstitutionalEmail())
                .active(true)
                .build();

        user = userRepository.save(user);

        // ── 4. Return token so the client can auto-login ──────────────────────
        String token = jwtService.generateToken(new CustomUserDetails(user));

        return AuthResponseDTO.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO request) {
        UniplanUser user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Usuario no encontrado: " + request.getUsername()));

        if (!user.isActive()) {
            throw new UnauthorizedOperationException("La cuenta está desactivada.");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedOperationException("Credenciales incorrectas.");
        }

        String token = jwtService.generateToken(new CustomUserDetails(user));

        return AuthResponseDTO.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    @Override
    public void logout() {
        // Stateless JWT — invalidation requires a blocklist strategy (future work).
    }
}
