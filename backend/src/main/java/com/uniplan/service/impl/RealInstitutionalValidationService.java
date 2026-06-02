package com.uniplan.service.impl;

import com.uniplan.exception.InstitutionalValidationException;
import com.uniplan.repository.institutional.InstitutionalEmployeeRepository;
import com.uniplan.repository.institutional.InstitutionalStudentRepository;
import com.uniplan.service.InstitutionalValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "university.datasource.url")
@RequiredArgsConstructor
public class RealInstitutionalValidationService implements InstitutionalValidationService {

    private final InstitutionalStudentRepository studentRepository;
    private final InstitutionalEmployeeRepository employeeRepository;

    @Override
    public void validateStudentExists(String studentId, String institutionalEmail) {
        if (!studentRepository.existsByIdAndEmail(studentId, institutionalEmail)) {
            throw new InstitutionalValidationException(
                    "El estudiante con código '" + studentId + "' y correo '" + institutionalEmail +
                    "' no fue encontrado en la base de datos institucional.");
        }
    }

    @Override
    public void validateFacultyMemberExists(String employeeId, String institutionalEmail) {
        if (!employeeRepository.existsByIdAndEmailAndType(employeeId, institutionalEmail, "Docente")) {
            throw new InstitutionalValidationException(
                    "No se encontró ningún docente con ID '" + employeeId + "' y correo '" +
                    institutionalEmail + "' en la base de datos institucional.");
        }
    }

    @Override
    public void validateInstructorExists(String employeeId, String institutionalEmail) {
        if (!employeeRepository.existsByIdAndEmailAndType(employeeId, institutionalEmail, "Instructor")) {
            throw new InstitutionalValidationException(
                    "No se encontró ningún instructor con ID '" + employeeId + "' y correo '" +
                    institutionalEmail + "' en la base de datos institucional.");
        }
    }

    @Override
    public void validateWellnessStaffExists(String employeeId, String institutionalEmail) {
        if (!employeeRepository.existsByIdAndEmailAndType(employeeId, institutionalEmail, "Administrativo")) {
            throw new InstitutionalValidationException(
                    "No se encontró ningún administrativo con ID '" + employeeId + "' y correo '" +
                    institutionalEmail + "' en la base de datos institucional.");
        }
    }

    @Override
    public void validateWorkshopPrerequisites(String studentId, String requiredCourse, Integer minimumSemester) {
        if (requiredCourse != null) {
            if (!studentRepository.hasApprovedCourse(studentId, requiredCourse)) {
                throw new InstitutionalValidationException(
                        "El estudiante no ha aprobado el curso requerido para este taller: '" +
                        requiredCourse + "'.");
            }
        }

        if (minimumSemester != null) {
            int completed = studentRepository.countApprovedSemesters(studentId);
            if (completed < minimumSemester) {
                throw new InstitutionalValidationException(
                        "Este taller requiere haber cursado al menos " + minimumSemester +
                        " semestre(s). El estudiante ha completado " + completed + ".");
            }
        }
    }
}
