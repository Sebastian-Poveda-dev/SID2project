package com.uniplan.document;

import com.uniplan.document.enums.DocumentEventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;
import java.util.Map;

/**
 * Stores flexible, event-type-specific metadata for a UniPlan event.
 *
 * Design rationale:
 * - PostgreSQL (Event entity) owns all transactional fields: title, dates, capacity,
 *   status, organizer, registrations. Those fields are NOT duplicated here.
 * - This document holds only the attributes that vary by event type and that
 *   cannot be cleanly modelled in a fixed relational schema.
 * - A single collection with a Map<String, Object> dynamicData field is used
 *   intentionally to leverage MongoDB's schema flexibility and to avoid creating
 *   a rigid type hierarchy that would break with every new event type.
 * - Business validation of required keys inside dynamicData is the responsibility
 *   of the service layer, not this document class.
 *
 * Correlation with PostgreSQL:
 * - eventId is the Long PK of the relational events table.
 * - It is stored as a plain value — NOT a MongoDB DBRef.
 * - The unique index on eventId enforces the one-to-one relationship at the
 *   database level.
 *
 * Expected dynamicData shapes per event type (validated by the service layer):
 *
 *   WORKSHOP:
 *     { "requiredMaterials": [...], "requiredCourse": "...", "minimumSemester": 5 }
 *
 *   TALK:
 *     { "speaker": "...", "affiliation": "...", "streamingLinks": [...], "resources": [...] }
 *
 *   SPORTS_TOURNAMENT:
 *     { "sportType": "...", "rules": "...", "teamCount": 8, "bracketType": "..." }
 *
 *   VOLUNTEER:
 *     { "beneficiaryCause": "...", "requiredHours": 10,
 *       "meetingPoints": [...], "logistics": { "transportIncluded": true } }
 *
 *   OTHER:
 *     Any arbitrary key-value structure.
 */
@Document(collection = "event_details")
@CompoundIndex(name = "idx_event_type_tags", def = "{'eventType': 1, 'tags': 1}")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDetailDocument {

    @Id
    private String id;

    /**
     * Foreign reference to the PostgreSQL events.id column.
     * Unique: enforces the one-to-one relationship with the relational Event.
     */
    @Indexed(unique = true)
    @Field("eventId")
    private Long eventId;

    /**
     * Mirrors the relational EventType enum stored in PostgreSQL.
     * Indexed to support event-catalog filtering by type.
     */
    @Indexed
    @Field("eventType")
    private DocumentEventType eventType;

    /**
     * Open-structure map for event-type-specific attributes.
     * Supports nested objects, arrays, and arbitrary types.
     * Keys and required fields are validated by the service layer.
     */
    @Field("dynamicData")
    private Map<String, Object> dynamicData;

    /**
     * Optional tags for search and discovery (e.g., "tecnología", "deporte", "virtual").
     * MongoDB creates a multikey index on this array field.
     */
    @Indexed
    @Field("tags")
    private List<String> tags;

    /**
     * Extensible map for technical or administrative metadata not tied to business logic
     * (e.g., source system, migration flags, feature toggles).
     */
    @Field("metadata")
    private Map<String, Object> metadata;
}
