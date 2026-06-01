package com.uniplan.repository.institutional;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(name = "university.datasource.url")
public class InstitutionalStudentRepository {

    private final JdbcTemplate jdbc;

    public InstitutionalStudentRepository(
            @Qualifier("institutionalJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public boolean existsByIdAndEmail(String studentId, String institutionalEmail) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM students WHERE id = ? AND email = ?",
                Integer.class,
                studentId, institutionalEmail
        );
        return count != null && count > 0;
    }

    /**
     * Returns true if the student has an 'Approved' enrollment in any group
     * whose subject_code matches the given course code.
     */
    public boolean hasApprovedCourse(String studentId, String subjectCode) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM enrollments e " +
                "JOIN groups g ON e.nrc = g.nrc " +
                "WHERE e.student_id = ? AND g.subject_code = ? AND e.status = 'Approved'",
                Integer.class,
                studentId, subjectCode
        );
        return count != null && count > 0;
    }

    /**
     * Counts the number of distinct academic semesters in which the student
     * has at least one 'Approved' enrollment. Used to derive their academic level.
     */
    public int countApprovedSemesters(String studentId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(DISTINCT g.semester) FROM enrollments e " +
                "JOIN groups g ON e.nrc = g.nrc " +
                "WHERE e.student_id = ? AND e.status = 'Approved'",
                Integer.class,
                studentId
        );
        return count != null ? count : 0;
    }
}
