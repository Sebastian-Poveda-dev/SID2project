package com.uniplan.dto.request;

import com.uniplan.entity.enums.EventType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Partial-update DTO: all fields are optional. Null means "do not update".
 * Cross-field validation (endDateTime > startDateTime) is enforced at the service layer.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateEventRequestDTO {

    // --- Relational / PostgreSQL fields ---

    @Size(min = 1, max = 150)
    private String title;

    @Size(max = 5000)
    private String description;

    private EventType eventType;

    @Future
    private LocalDateTime startDateTime;

    @Future
    private LocalDateTime endDateTime;

    @Size(max = 200)
    private String location;

    @Positive
    private Integer maxCapacity;

    // --- Flexible / MongoDB fields ---

    private Map<String, Object> dynamicData;

    private List<String> tags;
}
