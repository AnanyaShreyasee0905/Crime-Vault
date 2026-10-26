package com.crimevault.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class Evidence {
    private Long evidenceId;

    @NotNull
    @Positive
    private Long caseId;

    @NotBlank
    @Size(max = 50)
    private String evidenceType;

    @Size(max = 1000)
    private String description;

    @Size(max = 200)
    private String collectionLocation;

    private LocalDateTime collectionDateTime;

    @Size(max = 30)
    private String status;

    @Size(max = 200)
    private String currentLocation;

    public Long getEvidenceId() { return evidenceId; }
    public void setEvidenceId(Long evidenceId) { this.evidenceId = evidenceId; }

    public Long getCaseId() { return caseId; }
    public void setCaseId(Long caseId) { this.caseId = caseId; }

    public String getEvidenceType() { return evidenceType; }
    public void setEvidenceType(String evidenceType) { this.evidenceType = evidenceType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCollectionLocation() { return collectionLocation; }
    public void setCollectionLocation(String collectionLocation) { this.collectionLocation = collectionLocation; }

    public LocalDateTime getCollectionDateTime() { return collectionDateTime; }
    public void setCollectionDateTime(LocalDateTime collectionDateTime) { this.collectionDateTime = collectionDateTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }

}
