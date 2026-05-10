package com.uniplan.document.enums;

/**
 * Mirrors com.uniplan.entity.enums.EventType exactly.
 *
 * Declared here to keep the MongoDB document layer independent of the JPA entity
 * layer. If a new type is added to the relational EventType enum, it must also be
 * added here to keep both layers in sync.
 */
public enum DocumentEventType {
    WORKSHOP,
    TALK,
    SPORTS_TOURNAMENT,
    VOLUNTEER,
    OTHER
}
