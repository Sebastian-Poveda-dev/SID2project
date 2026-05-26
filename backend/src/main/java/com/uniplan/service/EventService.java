package com.uniplan.service;

import com.uniplan.dto.request.CreateEventRequestDTO;
import com.uniplan.dto.request.UpdateEventRequestDTO;
import com.uniplan.dto.response.EventDetailResponseDTO;
import com.uniplan.dto.response.EventSummaryResponseDTO;
import com.uniplan.entity.enums.EventStatus;
import com.uniplan.entity.enums.EventType;

import java.time.LocalDateTime;
import java.util.List;

public interface EventService {

    List<EventSummaryResponseDTO> findAll(EventType eventType, EventStatus status,
                                          LocalDateTime startDate, LocalDateTime endDate);

    EventDetailResponseDTO findById(Long eventId);

    EventDetailResponseDTO create(CreateEventRequestDTO request);

    EventDetailResponseDTO update(Long eventId, UpdateEventRequestDTO request);

    EventDetailResponseDTO publish(Long eventId);

    void cancel(Long eventId);

    List<EventSummaryResponseDTO> findUpcoming();

    List<EventSummaryResponseDTO> search(String keyword);
}
