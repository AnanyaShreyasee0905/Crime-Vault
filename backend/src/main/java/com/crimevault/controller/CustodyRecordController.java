package com.crimevault.controller;

import com.crimevault.dao.CustodyRecordStore;
import com.crimevault.model.CustodyRecord;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/custody-records")
public class CustodyRecordController {
    private final CustodyRecordStore store;
    public CustodyRecordController(CustodyRecordStore store) { this.store = store; }

    @GetMapping
    public List<CustodyRecord> getAll() { return store.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        if (id == null || id <= 0) return bad("Custody ID must be positive");
        return store.findById(id).<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/evidence/{evidenceId}")
    public ResponseEntity<?> getByEvidence(@PathVariable Long evidenceId) {
        if (evidenceId == null || evidenceId <= 0) return bad("Evidence ID must be positive");
        return ResponseEntity.ok(store.findByEvidenceId(evidenceId));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CustodyRecord record) {
        if (record.getCustodyId() != null) return bad("Do not provide custodyId when creating");
        return ResponseEntity.status(HttpStatus.CREATED).body(store.recordTransfer(record));
    }

    private ResponseEntity<Map<String, String>> bad(String message) {
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }
}
