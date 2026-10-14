
package com.crimevault.controller;

import com.crimevault.dao.InvestigatorStore;
import com.crimevault.model.Investigator;
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
    public ResponseEntity<?> getInvestigatorById(
            @PathVariable Long id) {

        if (id <= 0) {
            return ResponseEntity.badRequest().body(
                    Map.of("message",
                            "Investigator ID must be a positive number")
            );
        }

        return investigatorStore.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message",
                                "Investigator not found")));
    }
}
