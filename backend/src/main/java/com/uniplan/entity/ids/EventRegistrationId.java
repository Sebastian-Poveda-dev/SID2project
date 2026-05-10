package com.uniplan.entity.ids;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class EventRegistrationId implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "student_user_id", nullable = false)
    private Long studentUserId;
}
