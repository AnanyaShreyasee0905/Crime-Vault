package com.crimevault.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class CustodyRecord {
    private Long custodyId;

    @NotNull
    @Positive
    private Long evidenceId;

    @Positive
    private Long fromInvestigatorId;

    @NotNull
    @Positive
    private Long toInvestigatorId;

    @NotNull
    private LocalDateTime transferDateTime;

    @Size(max = 500)
    private String transferReason;

    @Size(max = 200)
    private String location;

    @Size(max = 500)
    private String remarks;

    public Long getCustodyId() { return custodyId; }
    public void setCustodyId(Long custodyId) { this.custodyId = custodyId; }

    public Long getEvidenceId() { return evidenceId; }
    public void setEvidenceId(Long evidenceId) { this.evidenceId = evidenceId; }

    public Long getFromInvestigatorId() { return fromInvestigatorId; }
    public void setFromInvestigatorId(Long fromInvestigatorId) { this.fromInvestigatorId = fromInvestigatorId; }

    public Long getToInvestigatorId() { return toInvestigatorId; }
    public void setToInvestigatorId(Long toInvestigatorId) { this.toInvestigatorId = toInvestigatorId; }

    public LocalDateTime getTransferDateTime() { return transferDateTime; }
    public void setTransferDateTime(LocalDateTime transferDateTime) { this.transferDateTime = transferDateTime; }

    public String getTransferReason() { return transferReason; }
    public void setTransferReason(String transferReason) { this.transferReason = transferReason; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

}
