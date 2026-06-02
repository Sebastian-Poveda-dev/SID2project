package com.uniplan.service;

import com.uniplan.dto.response.EventStatisticsResponseDTO;
import com.uniplan.dto.response.EventSummaryResponseDTO;
import com.uniplan.dto.response.EventTypeStatisticsResponseDTO;
import com.uniplan.dto.response.OrganizerPerformanceResponseDTO;
import com.uniplan.dto.response.StatisticsSummaryResponseDTO;

import java.util.List;

public interface StatisticsService {

    EventStatisticsResponseDTO findByEvent(Long eventId);

    List<EventSummaryResponseDTO> findPopularEvents();

    List<EventStatisticsResponseDTO> findOccupancyReport();

    StatisticsSummaryResponseDTO getSummary();

    List<EventTypeStatisticsResponseDTO> findByEventType();

    List<OrganizerPerformanceResponseDTO> findOrganizerPerformance();
}
