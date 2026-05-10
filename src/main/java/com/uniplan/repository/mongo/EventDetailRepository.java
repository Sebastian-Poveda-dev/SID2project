package com.uniplan.repository.mongo;

import com.uniplan.document.EventDetailDocument;
import com.uniplan.document.enums.DocumentEventType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface EventDetailRepository extends MongoRepository<EventDetailDocument, String> {

    Optional<EventDetailDocument> findByEventId(Long eventId);

    boolean existsByEventId(Long eventId);

    void deleteByEventId(Long eventId);

    List<EventDetailDocument> findByEventType(DocumentEventType eventType);

    List<EventDetailDocument> findByTagsContaining(String tag);

    List<EventDetailDocument> findByEventTypeAndTagsContaining(DocumentEventType eventType, String tag);
}
