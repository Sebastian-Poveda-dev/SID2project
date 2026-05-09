package com.uniplan.entity;

import com.uniplan.entity.enums.UserRole;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Check;

import java.time.LocalDateTime;

/**
 * UniPlan platform user. References the institutional STUDENTS or EMPLOYEES
 * tables by ID only — those tables are read-only and must never be duplicated here.
 */
@Entity
@Table(
        name = "uniplan_users",
        uniqueConstraints = @UniqueConstraint(name = "uq_uniplan_users_username", columnNames = "username"),
        indexes = {
                @Index(name = "idx_uniplan_users_institutional_student_id", columnList = "institutional_student_id"),
                @Index(name = "idx_uniplan_users_institutional_employee_id", columnList = "institutional_employee_id")
        }
)
// Enforces that a user is either a student or an employee, never both.
@Check(constraints =
        "(institutional_student_id IS NOT NULL AND institutional_employee_id IS NULL) OR " +
        "(institutional_student_id IS NULL  AND institutional_employee_id IS NOT NULL)")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UniplanUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role;

    // Foreign reference to institutional STUDENTS(id) — read-only external DB.
    @Column(name = "institutional_student_id", length = 15)
    private String institutionalStudentId;

    // Foreign reference to institutional EMPLOYEES(id) — read-only external DB.
    @Column(name = "institutional_employee_id", length = 15)
    private String institutionalEmployeeId;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Navigational convenience — OrganizerProfile owns the FK (user_id).
    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    private OrganizerProfile organizerProfile;

    @PrePersist
    private void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
