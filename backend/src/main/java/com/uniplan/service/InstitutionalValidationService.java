package com.uniplan.service;

public interface InstitutionalValidationService {

    /** Verifies student exists in institutional DB (id + email). */
    void validateStudentExists(String studentId, String institutionalEmail);

    /** Verifies employee is a faculty member (Docente) in institutional DB. */
    void validateFacultyMemberExists(String employeeId, String institutionalEmail);

    /** Verifies employee is an instructor in institutional DB. */
    void validateInstructorExists(String employeeId, String institutionalEmail);

    /** Verifies employee is wellness/administrative staff in institutional DB. */
    void validateWellnessStaffExists(String employeeId, String institutionalEmail);

    /**
     * Verifies workshop prerequisites for a student:
     * - requiredCourse: student must have an 'Approved' enrollment in that subject
     * - minimumSemester: student must have completed at least that many semesters
     * Either parameter may be null to skip that check.
     */
    void validateWorkshopPrerequisites(String studentId, String requiredCourse, Integer minimumSemester);
}
