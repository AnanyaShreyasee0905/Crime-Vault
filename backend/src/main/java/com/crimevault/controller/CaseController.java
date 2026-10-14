
package com.crimevault.controller;

import com.crimevault.dao.CaseStore;
import com.crimevault.model.CaseRecord;
import org.springframework.web.bind.annotation.CrossOrigin;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
@CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final CaseStore caseStore;

    public CaseController(CaseStore caseStore) {
        this.caseStore = caseStore;
    }

    @GetMapping
    public List<CaseRecord> getAllCases() {
        return caseStore.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCaseById(@PathVariable Long id) {
        if (id <= 0) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Case ID must be a positive number")
            );
        }

        return caseStore.findById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Case not found")));
    }

    @PostMapping
    public ResponseEntity<?> createCase(
            @Valid @RequestBody CaseRecord record) {

        if (!hasRequiredFields(record)) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Case number, title, case type, priority, status and date reported are required")
            );
        }

        if (record.getCaseNumber().length() > 30
                || record.getTitle().length() > 150
                || record.getCaseType().length() > 50
                || record.getPriority().length() > 20
                || record.getStatus().length() > 30) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "One or more fields exceed the database length limit")
            );
        }
        // Validate that the opening date is not before the reported date.
        if (record.getDateReported() != null
                && record.getDateOpened() != null
                && record.getDateOpened().isBefore(record.getDateReported())) {

            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Date opened cannot be earlier than date reported")
            );
        }

        boolean duplicate = caseStore.findAll().stream()
            .anyMatch(existing ->
                existing.getCaseNumber().equalsIgnoreCase(record.getCaseNumber()));

        if (duplicate) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("message", "Case number already exists")
            );
        }

        record.setCaseId(null);

        CaseRecord saved = caseStore.save(record);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCase(
            @PathVariable Long id,
            @Valid @RequestBody CaseRecord record) {

        if (id <= 0) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Case ID must be a positive number")
            );
        }

        if (caseStore.findById(id).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Case not found")
            );
        }

        if (!hasRequiredFields(record)) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Case number, title, case type, priority, status and date reported are required")
            );
        }
        // Validate that the opening date is not before the reported date.
        if (record.getDateReported() != null
                && record.getDateOpened() != null
                && record.getDateOpened().isBefore(record.getDateReported())) {

            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Date opened cannot be earlier than date reported")
            );
        }

        boolean duplicate = caseStore.findAll().stream()
            .anyMatch(existing ->
                !existing.getCaseId().equals(id)
                && existing.getCaseNumber().equalsIgnoreCase(record.getCaseNumber()));

        if (duplicate) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("message", "Case number already exists")
            );
        }

        if (record.getCaseNumber().length() > 30
                || record.getTitle().length() > 150
                || record.getCaseType().length() > 50
                || record.getPriority().length() > 20
                || record.getStatus().length() > 30) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "One or more fields exceed the database length limit")
            );
        }

        record.setCaseId(id);

        CaseRecord updated = caseStore.save(record);

        return ResponseEntity.ok(updated);
    }

    private boolean hasRequiredFields(CaseRecord record) {
        return record.getCaseNumber() != null
            && !record.getCaseNumber().isBlank()
            && record.getTitle() != null
            && !record.getTitle().isBlank()
            && record.getCaseType() != null
            && !record.getCaseType().isBlank()
            && record.getPriority() != null
            && !record.getPriority().isBlank()
            && record.getStatus() != null
            && !record.getStatus().isBlank()
            && record.getDateReported() != null;
    }

    private void validateCaseDates(CaseRecord record) {
        if (record.getDateReported() != null
                && record.getDateOpened() != null
                && record.getDateOpened().isBefore(record.getDateReported())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Date opened cannot be earlier than date reported."
        );
    }
}

}
