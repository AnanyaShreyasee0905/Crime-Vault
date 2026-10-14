
package com.crimevault.dao;

import com.crimevault.model.Investigator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class InvestigatorStoreTests {

    private JdbcTemplate jdbcTemplate;
    private InvestigatorStore investigatorStore;

    @BeforeEach
    void setUp() {
        jdbcTemplate = mock(JdbcTemplate.class);
        investigatorStore = new InvestigatorStore(jdbcTemplate);
    }

    @Test
    void findAllReturnsInvestigatorsFromDatabaseQuery() {
        Investigator investigator = new Investigator();
        investigator.setInvestigatorId(1001L);
        investigator.setName("Ananya Rao");

        when(jdbcTemplate.query(
                anyString(),
                any(RowMapper.class)
        )).thenReturn(List.of(investigator));

        List<Investigator> result = investigatorStore.findAll();

        assertEquals(1, result.size());
        assertEquals("Ananya Rao", result.get(0).getName());

        verify(jdbcTemplate).query(
                contains("FROM INVESTIGATOR"),
                any(RowMapper.class)
        );
    }

    @Test
    void saveUpdatesExistingInvestigator() {
        Investigator investigator = new Investigator();
        investigator.setInvestigatorId(1001L);
        investigator.setName("Ananya Rao");
        investigator.setBadgeNumber("CV-1042");
        investigator.setDepartment("Cyber Crime");
        investigator.setRank("Inspector");
        investigator.setContact("0000000001");
        investigator.setEmail("ananya@example.com");

        when(jdbcTemplate.update(
                anyString(),
                any(Object[].class)
        )).thenReturn(1);

        Investigator result = investigatorStore.save(investigator);

        assertSame(investigator, result);

        verify(jdbcTemplate).update(
                contains("UPDATE INVESTIGATOR"),
                any(Object[].class)
        );
    }

    @Test
    void saveThrowsWhenInvestigatorDoesNotExist() {
        Investigator investigator = new Investigator();
        investigator.setInvestigatorId(9999L);
        investigator.setName("Missing Investigator");

        when(jdbcTemplate.update(
                anyString(),
                any(Object[].class)
        )).thenReturn(0);

        assertThrows(
                IllegalArgumentException.class,
                () -> investigatorStore.save(investigator)
        );
    }
}
