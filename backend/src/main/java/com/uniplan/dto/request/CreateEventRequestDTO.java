package com.uniplan.dto.request;

import com.uniplan.entity.enums.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
 * Supports hybrid persistence: base fields go to PostgreSQL,
 * dynamicData and tags go to MongoDB (EventDetailDocument).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateEventRequestDTO {

    // --- Relational / PostgreSQL fields ---

    @NotBlank
    @Size(max = 150)
    private String title;

    @Size(max = 5000)
    private String description;

    @NotNull
    private EventType eventType;

    @NotNull
    private LocalDateTime startDateTime;

    // Cross-field validation (endDateTime > startDateTime) is enforced at the service layer.
    @NotNull
    private LocalDateTime endDateTime;

    @NotBlank
    @Size(max = 200)
    private String location;

    @NotNull
    @Positive
    private Integer maxCapacity;

    // --- Flexible / MongoDB fields ---

    /**
     * Open-structure map for event-type-specific attributes.
     *
     * Expected keys per eventType:
     *   WORKSHOP        → requiredMaterials (List), requiredCourse (String), minimumSemester (Integer)
     *   TALK            → speaker (String), affiliation (String), streamingLinks (List), resources (List)
     *   SPORTS_TOURNAMENT → sportType (String), rules (String), teamCount (Integer), bracketType (String)
     *   VOLUNTEER       → beneficiaryCause (String), requiredHours (Integer), meetingPoints (List), logistics (Map)
     *   OTHER           → any key-value structure
     *
     * Required-key validation is enforced at the service layer, not here.
     */
    private Map<String, Object> dynamicData;

    private List<String> tags;
}
