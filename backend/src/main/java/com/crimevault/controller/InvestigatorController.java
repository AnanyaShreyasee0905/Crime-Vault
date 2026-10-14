
package com.crimevault.controller;

import com.crimevault.dao.InvestigatorStore;
import com.crimevault.model.Investigator;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
@RestController
@RequestMapping("/api/investigators")
public class InvestigatorController {

    private final InvestigatorStore investigatorStore;

    public InvestigatorController(InvestigatorStore investigatorStore) {
        this.investigatorStore = investigatorStore;
    }

    @GetMapping
    public List<Investigator> getAllInvestigators() {
        return investigatorStore.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInvestigatorById(@PathVariable Long id) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Investigator ID must be a positive number")
            );
        }

        return investigatorStore.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Investigator not found")));
    }

    @PostMapping
    public ResponseEntity<?> createInvestigator(
            @RequestBody Investigator investigator) {

        if (investigator.getInvestigatorId() != null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Do not provide an investigator ID when creating a record")
            );
        }

        if (investigator.getName() == null
                || investigator.getName().isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Investigator name is required")
            );
        }

        try {
            Investigator saved = investigatorStore.save(investigator);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (DuplicateKeyException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    Map.of("message", "Badge number already exists")
            );
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInvestigator(
            @PathVariable Long id,
            @RequestBody Investigator investigator) {

        if (id <= 0) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Investigator ID must be a positive number")
            );
        }

        if (investigator.getInvestigatorId() != null
                && !investigator.getInvestigatorId().equals(id)) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Body ID must match the URL ID")
            );
        }

        if (investigator.getName() == null
                || investigator.getName().isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Investigator name is required")
            );
        }

        investigator.setInvestigatorId(id);

        try {
            Investigator saved = investigatorStore.save(investigator);
            return ResponseEntity.ok(saved);
        } catch (DuplicateKeyException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    Map.of("message", "Badge number already exists")
            );
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("message", "Investigator not found")
            );
        }
    }
}
