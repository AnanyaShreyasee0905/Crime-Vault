
package com.crimevault.dao;

import com.crimevault.model.Investigator;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class InvestigatorStore {

    private final Map<Long, Investigator> investigators =
            new LinkedHashMap<>();

    private long nextId = 1;

    public InvestigatorStore() {
        addSample("Demo Investigator Alpha", "BADGE-1001",
                "Major Crimes", "Inspector",
                "0000000001", "alpha.demo@example.com");

        addSample("Demo Investigator Bravo", "BADGE-1002",
                "Cybercrime", "Sub-Inspector",
                "0000000002", "bravo.demo@example.com");
    }

    private void addSample(
            String name,
            String badgeNumber,
            String department,
            String rank,
            String contact,
            String email) {

        Investigator investigator = new Investigator();
        investigator.setInvestigatorId(nextId++);
        investigator.setName(name);
        investigator.setBadgeNumber(badgeNumber);
        investigator.setDepartment(department);
        investigator.setRank(rank);
        investigator.setContact(contact);
        investigator.setEmail(email);

        investigators.put(investigator.getInvestigatorId(), investigator);
    }

    public List<Investigator> findAll() {
        return new ArrayList<>(investigators.values());
    }

    public Optional<Investigator> findById(Long id) {
        return Optional.ofNullable(investigators.get(id));
    }

    public Investigator save(Investigator investigator) {
        if (investigator.getInvestigatorId() == null) {
            investigator.setInvestigatorId(nextId++);
        }

        investigators.put(investigator.getInvestigatorId(), investigator);
        return investigator;
    }
}
