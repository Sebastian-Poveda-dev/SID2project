package com.uniplan.service.impl;

import com.uniplan.dto.request.LoginRequestDTO;
import com.uniplan.dto.request.RegisterRequestDTO;
import com.uniplan.dto.response.AuthResponseDTO;
import com.uniplan.dto.response.UserResponseDTO;
import com.uniplan.entity.UniplanUser;
import com.uniplan.entity.enums.UserRole;
import com.uniplan.exception.DuplicateRegistrationException;
import com.uniplan.exception.ResourceNotFoundException;
import com.uniplan.exception.UnauthorizedOperationException;
import com.uniplan.repository.jpa.UniplanUserRepository;
import com.uniplan.security.jwt.JwtService;
import com.uniplan.security.service.CustomUserDetails;
import com.uniplan.service.AuthService;
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

    @Override
    public UserResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateRegistrationException("Username already taken: " + request.getUsername());
        }
        if (userRepository.findByInstitutionalStudentId(request.getInstitutionalStudentId()).isPresent()) {
            throw new DuplicateRegistrationException(
                    "Student already registered: " + request.getInstitutionalStudentId());
        }

        // TODO: Validate student exists in institutional STUDENTS table.
        // Requires a read-only JdbcTemplate bound to the institutional schema.
        // Query: SELECT COUNT(*) FROM STUDENTS WHERE id = ? AND email = ?

        UniplanUser user = UniplanUser.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.STUDENT)
                .institutionalStudentId(request.getInstitutionalStudentId())
                .active(true)
                .build();

        user = userRepository.save(user);
        return toUserResponseDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO request) {
        UniplanUser user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUsername()));

        if (!user.isActive()) {
            throw new UnauthorizedOperationException("Account is inactive");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedOperationException("Invalid credentials");
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
        // TODO: Implement JWT blocklist or short-lived token invalidation strategy.
    }

    private UserResponseDTO toUserResponseDTO(UniplanUser user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
