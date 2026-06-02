package com.uniplan.repository.institutional;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(name = "university.datasource.url")
public class InstitutionalEmployeeRepository {

    private final JdbcTemplate jdbc;

    public InstitutionalEmployeeRepository(
            @Qualifier("institutionalJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public boolean existsByIdAndEmailAndType(String id, String email, String employeeType) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM employees WHERE id = ? AND email = ? AND employee_type = ?",
                Integer.class, id, email, employeeType
        );
        return count != null && count > 0;
    }
}
