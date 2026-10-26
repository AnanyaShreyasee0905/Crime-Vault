package com.crimevault.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class InvestigationEvent {
    private Long eventId;

    @NotNull
    @Positive
    private Long caseId;

    @NotNull
    @Positive
    private Long investigatorId;

    @NotNull
    private LocalDateTime eventDateTime;

    @NotBlank
    @Size(max = 50)
    private String eventType;

    @Size(max = 1000)
    private String description;

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public Long getCaseId() { return caseId; }
    public void setCaseId(Long caseId) { this.caseId = caseId; }

    public Long getInvestigatorId() { return investigatorId; }
    public void setInvestigatorId(Long investigatorId) { this.investigatorId = investigatorId; }

    public LocalDateTime getEventDateTime() { return eventDateTime; }
    public void setEventDateTime(LocalDateTime eventDateTime) { this.eventDateTime = eventDateTime; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

}
