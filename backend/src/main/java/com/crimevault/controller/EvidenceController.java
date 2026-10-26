package com.crimevault.controller;

import com.crimevault.dao.EvidenceStore;
import com.crimevault.model.Evidence;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/evidence")
public class EvidenceController {
    private final EvidenceStore store;
    public EvidenceController(EvidenceStore store) { this.store = store; }

    @GetMapping
    public List<Evidence> getAll() { return store.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        if (id == null || id <= 0) return bad("Evidence ID must be positive");
        return store.findById(id).<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<?> getByCase(@PathVariable Long caseId) {
        if (caseId == null || caseId <= 0) return bad("Case ID must be positive");
        return ResponseEntity.ok(store.findByCaseId(caseId));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Evidence evidence) {
        if (evidence.getEvidenceId() != null) return bad("Do not provide evidenceId when creating");
        return ResponseEntity.status(HttpStatus.CREATED).body(store.save(evidence));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Evidence evidence) {
        if (id == null || id <= 0) return bad("Evidence ID must be positive");
        if (evidence.getEvidenceId() != null && !evidence.getEvidenceId().equals(id)) return bad("Body ID must match URL ID");
        evidence.setEvidenceId(id);
        try { return ResponseEntity.ok(store.save(evidence)); }
        catch (IllegalArgumentException ex) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (id == null || id <= 0) return bad("Evidence ID must be positive");
        int deleted = store.deleteById(id);
        return deleted == 0 ? ResponseEntity.notFound().build() : ResponseEntity.noContent().build();
    }

    private ResponseEntity<Map<String, String>> bad(String message) {
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }
}
