package com.uniplan.service;

import com.uniplan.dto.response.EventStatisticsResponseDTO;
import com.uniplan.dto.response.EventSummaryResponseDTO;

import java.util.List;

public interface StatisticsService {

    EventStatisticsResponseDTO findByEvent(Long eventId);

    List<EventSummaryResponseDTO> findPopularEvents();

    List<EventStatisticsResponseDTO> findOccupancyReport();
}
