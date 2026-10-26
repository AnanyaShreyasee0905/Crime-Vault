package com.crimevault.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class Interview {
    private Long interviewId;

    @NotNull
    @Positive
    private Long caseId;

    @NotNull
    @Positive
    private Long personId;

    @NotNull
    @Positive
    private Long investigatorId;

    @NotNull
    private LocalDateTime interviewDateTime;

    @Size(max = 200)
    private String location;

    @Size(max = 1000)
    private String summary;

    public Long getInterviewId() { return interviewId; }
    public void setInterviewId(Long interviewId) { this.interviewId = interviewId; }

    public Long getCaseId() { return caseId; }
    public void setCaseId(Long caseId) { this.caseId = caseId; }

    public Long getPersonId() { return personId; }
    public void setPersonId(Long personId) { this.personId = personId; }

    public Long getInvestigatorId() { return investigatorId; }
    public void setInvestigatorId(Long investigatorId) { this.investigatorId = investigatorId; }

    public LocalDateTime getInterviewDateTime() { return interviewDateTime; }
    public void setInterviewDateTime(LocalDateTime interviewDateTime) { this.interviewDateTime = interviewDateTime; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

}
