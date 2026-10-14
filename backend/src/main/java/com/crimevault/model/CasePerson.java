
package com.crimevault.model;

import java.time.LocalDate;

public class CasePerson {
    private Long caseId;
    private Long personId;
    private String role;
    private LocalDate dateAdded;
    private String remarks;

    public Long getCaseId() { return caseId; }
    public void setCaseId(Long caseId) { this.caseId = caseId; }
    public Long getPersonId() { return personId; }
    public void setPersonId(Long personId) { this.personId = personId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public LocalDate getDateAdded() { return dateAdded; }
    public void setDateAdded(LocalDate dateAdded) { this.dateAdded = dateAdded; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
