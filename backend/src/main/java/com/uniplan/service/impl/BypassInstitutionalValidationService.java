package com.uniplan.service.impl;

import com.uniplan.service.InstitutionalValidationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;

/**
 * No-op fallback active when {@code university.datasource.url} is not configured.
 * In production, the real institutional database must be set up.
 */
@Slf4j
@Service
@ConditionalOnMissingBean(InstitutionalValidationService.class)
public class BypassInstitutionalValidationService implements InstitutionalValidationService {

    @Override
    public void validateStudentExists(String studentId, String institutionalEmail) {
        log.warn("[DEV] Institutional DB not configured — skipping student validation for '{}'", studentId);
    }

    @Override
    public void validateFacultyMemberExists(String employeeId, String institutionalEmail) {
        log.warn("[DEV] Institutional DB not configured — skipping faculty member validation for '{}'", employeeId);
    }

    @Override
    public void validateInstructorExists(String employeeId, String institutionalEmail) {
        log.warn("[DEV] Institutional DB not configured — skipping instructor validation for '{}'", employeeId);
    }

    @Override
    public void validateWellnessStaffExists(String employeeId, String institutionalEmail) {
        log.warn("[DEV] Institutional DB not configured — skipping wellness staff validation for '{}'", employeeId);
    }

    @Override
    public void validateWorkshopPrerequisites(String studentId, String requiredCourse, Integer minimumSemester) {
        log.warn("[DEV] Institutional DB not configured — skipping workshop prerequisites for student '{}'", studentId);
    }
}
