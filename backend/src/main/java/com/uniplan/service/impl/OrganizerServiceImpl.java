package com.uniplan.service.impl;

import com.uniplan.dto.request.OrganizerActivationRequestDTO;
import com.uniplan.dto.response.OrganizerResponseDTO;
import com.uniplan.entity.OrganizerProfile;
import com.uniplan.entity.UniplanUser;
import com.uniplan.entity.enums.UserRole;
import com.uniplan.exception.BusinessValidationException;
import com.uniplan.exception.DuplicateRegistrationException;
import com.uniplan.exception.ResourceNotFoundException;
import com.uniplan.repository.jpa.OrganizerProfileRepository;
import com.uniplan.repository.jpa.UniplanUserRepository;
import com.uniplan.service.InstitutionalValidationService;
import com.uniplan.service.OrganizerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrganizerServiceImpl implements OrganizerService {

    private final OrganizerProfileRepository organizerProfileRepository;
    private final UniplanUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final InstitutionalValidationService institutionalValidationService;

    @Override
    public OrganizerResponseDTO activate(OrganizerActivationRequestDTO request) {
        UniplanUser user = switch (request.getOrganizerType()) {
            case STUDENT_LEADER -> resolveStudentLeader(request);
            case FACULTY_MEMBER -> createFacultyMember(request);
            case INSTRUCTOR     -> createInstructor(request);
            case WELLNESS_STAFF -> createWellnessStaff(request);
        };

        if (organizerProfileRepository.existsByUserId(user.getId())) {
            throw new DuplicateRegistrationException(
                    "El usuario '" + user.getUsername() + "' ya tiene un perfil de organizador activo.");
        }

        OrganizerProfile profile = buildProfile(user, request);
        return toDTO(organizerProfileRepository.save(profile));
    }

    // ── Type resolvers ────────────────────────────────────────────────────────

    private UniplanUser resolveStudentLeader(OrganizerActivationRequestDTO req) {
        requireField(req.getUserId(), "userId es requerido para STUDENT_LEADER");
        requireField(req.getAcademicProgramCode(), "academicProgramCode es requerido para STUDENT_LEADER");
        requireField(req.getSemester(), "semester es requerido para STUDENT_LEADER");
        requireField(req.getStudentGroup(), "studentGroup es requerido para STUDENT_LEADER");

        UniplanUser user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Usuario no encontrado con id: " + req.getUserId()));

        if (user.getRole() != UserRole.STUDENT) {
            throw new BusinessValidationException(
                    "Solo estudiantes pueden ser líderes estudiantiles.");
        }
        if (!user.isActive()) {
            throw new BusinessValidationException(
                    "La cuenta del usuario está desactivada.");
        }
        // Promote to EMPLOYEE so the student leader can create and manage events.
        user.setRole(UserRole.EMPLOYEE);
        return userRepository.save(user);
    }

    private UniplanUser createFacultyMember(OrganizerActivationRequestDTO req) {
        requireField(req.getInstitutionalEmployeeId(), "institutionalEmployeeId es requerido para FACULTY_MEMBER");
        requireField(req.getInstitutionalEmail(),      "institutionalEmail es requerido para FACULTY_MEMBER");
        requireField(req.getUsername(),                "username es requerido para FACULTY_MEMBER");
        requireField(req.getTemporaryPassword(),       "temporaryPassword es requerido para FACULTY_MEMBER");
        requireField(req.getFacultyCode(),             "facultyCode es requerido para FACULTY_MEMBER");
        requireField(req.getDepartment(),              "department es requerido para FACULTY_MEMBER");

        institutionalValidationService.validateFacultyMemberExists(
                req.getInstitutionalEmployeeId(), req.getInstitutionalEmail());

        return createEmployeeUser(req);
    }

    private UniplanUser createInstructor(OrganizerActivationRequestDTO req) {
        requireField(req.getInstitutionalEmployeeId(), "institutionalEmployeeId es requerido para INSTRUCTOR");
        requireField(req.getInstitutionalEmail(),      "institutionalEmail es requerido para INSTRUCTOR");
        requireField(req.getUsername(),                "username es requerido para INSTRUCTOR");
        requireField(req.getTemporaryPassword(),       "temporaryPassword es requerido para INSTRUCTOR");
        requireField(req.getFacultyCode(),             "facultyCode es requerido para INSTRUCTOR");

        institutionalValidationService.validateInstructorExists(
                req.getInstitutionalEmployeeId(), req.getInstitutionalEmail());

        return createEmployeeUser(req);
    }

    private UniplanUser createWellnessStaff(OrganizerActivationRequestDTO req) {
        requireField(req.getInstitutionalEmployeeId(),  "institutionalEmployeeId es requerido para WELLNESS_STAFF");
        requireField(req.getInstitutionalEmail(),       "institutionalEmail es requerido para WELLNESS_STAFF");
        requireField(req.getUsername(),                 "username es requerido para WELLNESS_STAFF");
        requireField(req.getTemporaryPassword(),        "temporaryPassword es requerido para WELLNESS_STAFF");
        requireField(req.getAdministrativeAreaCode(),   "administrativeAreaCode es requerido para WELLNESS_STAFF");
        requireField(req.getJobTitle(),                 "jobTitle es requerido para WELLNESS_STAFF");

        institutionalValidationService.validateWellnessStaffExists(
                req.getInstitutionalEmployeeId(), req.getInstitutionalEmail());

        return createEmployeeUser(req);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private UniplanUser createEmployeeUser(OrganizerActivationRequestDTO req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new DuplicateRegistrationException(
                    "El nombre de usuario '" + req.getUsername() + "' ya está en uso.");
        }
        if (userRepository.existsByInstitutionalEmail(req.getInstitutionalEmail())) {
            throw new DuplicateRegistrationException(
                    "El correo '" + req.getInstitutionalEmail() + "' ya tiene una cuenta registrada.");
        }

        UniplanUser user = UniplanUser.builder()
                .username(req.getUsername())
                .firstName(req.getFirstName() != null ? req.getFirstName() : req.getUsername())
                .lastName(req.getLastName() != null ? req.getLastName() : "")
                .passwordHash(passwordEncoder.encode(req.getTemporaryPassword()))
                .role(UserRole.EMPLOYEE)
                .institutionalEmployeeId(req.getInstitutionalEmployeeId())
                .institutionalEmail(req.getInstitutionalEmail())
                .active(true)
                .build();

        return userRepository.save(user);
    }

    private OrganizerProfile buildProfile(UniplanUser user, OrganizerActivationRequestDTO req) {
        return OrganizerProfile.builder()
                .user(user)
                .organizerType(req.getOrganizerType())
                .enabled(true)
                // FACULTY_MEMBER
                .facultyCode(req.getFacultyCode())
                .department(req.getDepartment())
                .specializationArea(req.getSpecializationArea())
                // STUDENT_LEADER
                .academicProgramCode(req.getAcademicProgramCode())
                .semester(req.getSemester())
                .studentGroup(req.getStudentGroup())
                // WELLNESS_STAFF
                .administrativeAreaCode(req.getAdministrativeAreaCode())
                .jobTitle(req.getJobTitle())
                .build();
    }

    private void requireField(Object value, String message) {
        if (value == null || (value instanceof String s && s.isBlank())) {
            throw new BusinessValidationException(message);
        }
    }

    private OrganizerResponseDTO toDTO(OrganizerProfile p) {
        String institutionalId = p.getUser().getInstitutionalEmployeeId() != null
                ? p.getUser().getInstitutionalEmployeeId()
                : p.getUser().getInstitutionalStudentId();

        return OrganizerResponseDTO.builder()
                .id(p.getId())
                .username(p.getUser().getUsername())
                .institutionalId(institutionalId)
                .organizerType(p.getOrganizerType())
                .enabled(p.isEnabled())
                .facultyCode(p.getFacultyCode())
                .department(p.getDepartment())
                .specializationArea(p.getSpecializationArea())
                .academicProgramCode(p.getAcademicProgramCode())
                .semester(p.getSemester())
                .studentGroup(p.getStudentGroup())
                .administrativeAreaCode(p.getAdministrativeAreaCode())
                .jobTitle(p.getJobTitle())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrganizerResponseDTO> findAll() {
        return organizerProfileRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizerResponseDTO findById(Long organizerId) {
        return organizerProfileRepository.findById(organizerId)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Organizador no encontrado con id: " + organizerId));
    }
}
