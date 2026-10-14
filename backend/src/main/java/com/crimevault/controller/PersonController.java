
package com.crimevault.controller;

import com.crimevault.dao.PersonStore;
import com.crimevault.model.Person;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/people")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class PersonController {
    private final PersonStore store;

    public PersonController(PersonStore store) {
        this.store = store;
    }

    @GetMapping
    public List<Person> getAll() {
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
    public ResponseEntity<?> create(@RequestBody Person person) {
        if (person.getPersonId() != null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Do not provide personId when creating"));
        }
        if (person.getName() == null || person.getName().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Name is required"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(store.save(person));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestBody Person person) {
        if (id <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "ID must be positive"));
        }
        if (person.getPersonId() != null && !person.getPersonId().equals(id)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Body ID must match URL ID"));
        }
        if (person.getName() == null || person.getName().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Name is required"));
        }
        person.setPersonId(id);
        try {
            return ResponseEntity.ok(store.save(person));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Person not found"));
        }
    }
}
