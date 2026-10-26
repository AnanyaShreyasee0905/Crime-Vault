package com.crimevault.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ForensicExamination {
    private Long examinationId;

    @NotNull
    @Positive
    private Long evidenceId;

    @NotNull
    @Positive
    private Long examinerId;

    @NotBlank
    @Size(max = 100)
    private String examinationType;

    private LocalDate startDate;

    private LocalDate endDate;

    @Size(max = 30)
    private String status;

    @Size(max = 1000)
    private String findings;

    public Long getExaminationId() { return examinationId; }
    public void setExaminationId(Long examinationId) { this.examinationId = examinationId; }

    public Long getEvidenceId() { return evidenceId; }
    public void setEvidenceId(Long evidenceId) { this.evidenceId = evidenceId; }

    public Long getExaminerId() { return examinerId; }
    public void setExaminerId(Long examinerId) { this.examinerId = examinerId; }

    public String getExaminationType() { return examinationType; }
    public void setExaminationType(String examinationType) { this.examinationType = examinationType; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFindings() { return findings; }
    public void setFindings(String findings) { this.findings = findings; }

}
