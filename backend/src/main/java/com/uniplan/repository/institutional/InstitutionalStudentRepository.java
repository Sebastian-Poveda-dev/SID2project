package com.uniplan.repository.institutional;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class InstitutionalStudentRepository {

    @Qualifier("institutionalJdbcTemplate")
    private final JdbcTemplate jdbc;

    public boolean existsByIdAndEmail(String id, String email) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM students WHERE id = ? AND email = ?",
                Integer.class,
                id, email
        );
        return count != null && count > 0;
    }
}
