package com.uniplan.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.Map;

@Value
@Builder
public class StatisticsSummaryResponseDTO {

    int totalEvents;
    Map<String, Integer> eventsByStatus;
    int totalRegistrations;
    int totalCancellations;
    int totalAttendances;
    double globalAttendanceRate;
    double globalCancellationRate;
    double avgOccupancyPercentage;
    String topEventType;
}
