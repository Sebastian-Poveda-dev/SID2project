package com.uniplan.repository.jpa;

import com.uniplan.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByUserId(Long userId);

    List<AuditLog> findByEntityName(String entityName);

    List<AuditLog> findByEntityNameAndEntityId(String entityName, String entityId);

    List<AuditLog> findByAction(String action);

    List<AuditLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<AuditLog> findByUserIdAndCreatedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

    List<AuditLog> findByEntityNameAndCreatedAtBetween(String entityName, LocalDateTime start, LocalDateTime end);
}
