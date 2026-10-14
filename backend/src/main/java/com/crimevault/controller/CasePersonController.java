
package com.crimevault.controller;

import com.crimevault.dao.CasePersonStore;
import com.crimevault.model.CasePerson;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/case-people")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class CasePersonController {
    private final CasePersonStore store;

    public CasePersonController(CasePersonStore store) {
        this.store = store;
    }

    @GetMapping
    public List<CasePerson> getAll() {
        return store.findAll();
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<?> getByCase(@PathVariable Long caseId) {
        if (caseId <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Case ID must be positive"));
        }
        return ResponseEntity.ok(store.findByCaseId(caseId));
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody CasePerson person) {
        if (person.getCaseId() == null || person.getCaseId() <= 0
                || person.getPersonId() == null || person.getPersonId() <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Valid caseId and personId are required"));
        }
        if (person.getRole() == null || person.getRole().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Role is required"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(store.save(person));
    }
}
