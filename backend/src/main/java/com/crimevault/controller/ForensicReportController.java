package com.crimevault.controller;

import com.crimevault.dao.ForensicReportStore;
import com.crimevault.model.ForensicReport;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/forensic-reports")
public class ForensicReportController {
    private final ForensicReportStore store;
    public ForensicReportController(ForensicReportStore store) { this.store = store; }

    @GetMapping
    public List<ForensicReport> getAll() { return store.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        if (id == null || id <= 0) return bad("Report ID must be positive");
        return store.findById(id).<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/examination/{examinationId}")
    public ResponseEntity<?> getByExamination(@PathVariable Long examinationId) {
        if (examinationId == null || examinationId <= 0) return bad("Examination ID must be positive");
        return ResponseEntity.ok(store.findByExaminationId(examinationId));
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<?> getByCase(@PathVariable Long caseId) {
        if (caseId == null || caseId <= 0) return bad("Case ID must be positive");
        return ResponseEntity.ok(store.findByCaseId(caseId));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ForensicReport record) {
        if (record.getReportId() != null) return bad("Do not provide reportId when creating");
        return ResponseEntity.status(HttpStatus.CREATED).body(store.save(record));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody ForensicReport record) {
        if (id == null || id <= 0) return bad("Report ID must be positive");
        if (record.getReportId() != null && !record.getReportId().equals(id)) return bad("Body ID must match URL ID");
        record.setReportId(id);
        try { return ResponseEntity.ok(store.save(record)); }
        catch (IllegalArgumentException ex) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (id == null || id <= 0) return bad("Report ID must be positive");
        int deleted = store.deleteById(id);
        return deleted == 0 ? ResponseEntity.notFound().build() : ResponseEntity.noContent().build();
    }

    private ResponseEntity<Map<String, String>> bad(String message) {
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }
}
