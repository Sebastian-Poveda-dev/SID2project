package com.uniplan.repository.jpa;

import com.uniplan.entity.UniplanUser;
import com.uniplan.entity.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UniplanUserRepository extends JpaRepository<UniplanUser, Long> {

    Optional<UniplanUser> findByUsername(String username);

    boolean existsByUsername(String username);

    Optional<UniplanUser> findByInstitutionalStudentId(String institutionalStudentId);

    Optional<UniplanUser> findByInstitutionalEmployeeId(String institutionalEmployeeId);

    List<UniplanUser> findByRole(UserRole role);

    List<UniplanUser> findByActiveTrue();

    List<UniplanUser> findByRoleAndActiveTrue(UserRole role);
}
