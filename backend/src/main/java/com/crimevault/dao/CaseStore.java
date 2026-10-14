
package com.crimevault.dao;

import com.crimevault.model.CaseRecord;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class CaseStore {

    private final Map<Long, CaseRecord> cases = new LinkedHashMap<>();
    private long nextId = 1;

    public CaseStore() {
        CaseRecord sample = new CaseRecord();
        sample.setCaseId(nextId++);
        sample.setCaseNumber("CV-2026-001");
        sample.setTitle("Sample Theft Investigation");
        sample.setDescription("Fictional development test record.");
        sample.setCaseType("THEFT");
        sample.setPriority("MEDIUM");
        sample.setStatus("OPEN");
        sample.setLocation("Test Location");
        sample.setDateReported(LocalDate.of(2026, 10, 1));
        sample.setDateOpened(LocalDate.of(2026, 10, 1));

        cases.put(sample.getCaseId(), sample);
    }

    public List<CaseRecord> findAll() {
        return new ArrayList<>(cases.values());
    }

    public Optional<CaseRecord> findById(Long id) {
        return Optional.ofNullable(cases.get(id));
    }

    public CaseRecord save(CaseRecord record) {
        if (record.getCaseId() == null) {
            record.setCaseId(nextId++);
        }

        cases.put(record.getCaseId(), record);
        return record;
    }
}
