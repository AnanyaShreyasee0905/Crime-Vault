
package com.crimevault.controller;

import com.crimevault.dao.CaseAssignmentStore;
import com.crimevault.model.CaseAssignment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class CaseAssignmentController {
    private final CaseAssignmentStore store;

    public CaseAssignmentController(CaseAssignmentStore store) {
        this.store = store;
    }

    @GetMapping
    public List<CaseAssignment> getAll() {
        return store.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        if (id <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "ID must be positive"));
        }
        return store.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CaseAssignment assignment) {
        if (assignment.getAssignmentId() != null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Do not provide assignmentId when creating"));
        }
        if (assignment.getCaseId() == null || assignment.getCaseId() <= 0
                || assignment.getInvestigatorId() == null
                || assignment.getInvestigatorId() <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Valid caseId and investigatorId are required"));
        }
        if (assignment.getAssignmentDate() == null) {
            assignment.setAssignmentDate(LocalDate.now());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(store.save(assignment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestBody CaseAssignment assignment) {
        if (id <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "ID must be positive"));
        }
        if (assignment.getAssignmentId() != null
                && !assignment.getAssignmentId().equals(id)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Body ID must match URL ID"));
        }
        if (assignment.getCaseId() == null || assignment.getCaseId() <= 0
                || assignment.getInvestigatorId() == null
                || assignment.getInvestigatorId() <= 0
                || assignment.getAssignmentDate() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Valid case, investigator and assignment date are required"));
        }
        assignment.setAssignmentId(id);
        try {
            return ResponseEntity.ok(store.save(assignment));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Assignment not found"));
        }
    }
}
