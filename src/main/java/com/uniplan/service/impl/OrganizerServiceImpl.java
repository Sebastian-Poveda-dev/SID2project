package com.uniplan.service.impl;

import com.uniplan.dto.request.OrganizerActivationRequestDTO;
import com.uniplan.dto.response.OrganizerResponseDTO;
import com.uniplan.entity.OrganizerProfile;
import com.uniplan.entity.UniplanUser;
import com.uniplan.exception.BusinessValidationException;
import com.uniplan.exception.DuplicateRegistrationException;
import com.uniplan.exception.ResourceNotFoundException;
import com.uniplan.repository.jpa.OrganizerProfileRepository;
import com.uniplan.repository.jpa.UniplanUserRepository;
import com.uniplan.service.OrganizerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrganizerServiceImpl implements OrganizerService {

    private final OrganizerProfileRepository organizerProfileRepository;
    private final UniplanUserRepository userRepository;

    @Override
    public OrganizerResponseDTO activate(OrganizerActivationRequestDTO request) {
        UniplanUser user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));

        if (!user.isActive()) {
            throw new BusinessValidationException("Cannot activate organizer: user account is inactive");
        }
        if (organizerProfileRepository.existsByUserId(request.getUserId())) {
            throw new DuplicateRegistrationException(
                    "Organizer profile already exists for user: " + request.getUserId());
        }

        OrganizerProfile profile = OrganizerProfile.builder()
                .user(user)
                .organizerType(request.getOrganizerType())
                .enabled(true)
                .build();

        profile = organizerProfileRepository.save(profile);
        return toDTO(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrganizerResponseDTO> findAll() {
        return organizerProfileRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizerResponseDTO findById(Long organizerId) {
        OrganizerProfile profile = organizerProfileRepository.findById(organizerId)
                .orElseThrow(() -> new ResourceNotFoundException("Organizer not found: " + organizerId));
        return toDTO(profile);
    }

    private OrganizerResponseDTO toDTO(OrganizerProfile profile) {
        return OrganizerResponseDTO.builder()
                .id(profile.getId())
                .username(profile.getUser().getUsername())
                .organizerType(profile.getOrganizerType())
                .enabled(profile.isEnabled())
                .build();
    }
}
