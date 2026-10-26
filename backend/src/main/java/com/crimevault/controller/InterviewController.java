package com.crimevault.controller;

import com.crimevault.dao.InterviewStore;
import com.crimevault.model.Interview;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {
    private final InterviewStore store;
    public InterviewController(InterviewStore store) { this.store = store; }

    @GetMapping
    public List<Interview> getAll() { return store.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        if (id == null || id <= 0) return bad("Interview ID must be positive");
        return store.findById(id).<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<?> getByCase(@PathVariable Long caseId) {
        if (caseId == null || caseId <= 0) return bad("Case ID must be positive");
        return ResponseEntity.ok(store.findByCaseId(caseId));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Interview record) {
        if (record.getInterviewId() != null) return bad("Do not provide interviewId when creating");
        return ResponseEntity.status(HttpStatus.CREATED).body(store.save(record));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Interview record) {
        if (id == null || id <= 0) return bad("Interview ID must be positive");
        if (record.getInterviewId() != null && !record.getInterviewId().equals(id)) return bad("Body ID must match URL ID");
        record.setInterviewId(id);
        try { return ResponseEntity.ok(store.save(record)); }
        catch (IllegalArgumentException ex) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (id == null || id <= 0) return bad("Interview ID must be positive");
        int deleted = store.deleteById(id);
        return deleted == 0 ? ResponseEntity.notFound().build() : ResponseEntity.noContent().build();
    }

    private ResponseEntity<Map<String, String>> bad(String message) {
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }
}
