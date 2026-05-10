package com.uniplan.repository.jpa;

import com.uniplan.entity.OrganizerProfile;
import com.uniplan.entity.enums.OrganizerType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrganizerProfileRepository extends JpaRepository<OrganizerProfile, Long> {

    Optional<OrganizerProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<OrganizerProfile> findByOrganizerType(OrganizerType organizerType);

    List<OrganizerProfile> findByEnabledTrue();

    List<OrganizerProfile> findByOrganizerTypeAndEnabledTrue(OrganizerType organizerType);
}
