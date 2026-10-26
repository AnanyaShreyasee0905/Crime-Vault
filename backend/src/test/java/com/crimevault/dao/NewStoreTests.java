package com.crimevault.dao;

import com.crimevault.model.Person;
import com.crimevault.model.CasePerson;
import com.crimevault.model.CaseAssignment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class NewStoreTests {
    private JdbcTemplate jdbc;

    @BeforeEach
    void setUp() {
        jdbc = mock(JdbcTemplate.class);
    }

    @Test
    void personFindAllQueriesDatabase() {
        Person person = new Person();
        person.setPersonId(1L);
        person.setName("Test Person");

        when(jdbc.query(anyString(), any(RowMapper.class)))
                .thenReturn(List.of(person));

        PersonStore store = new PersonStore(jdbc);

        assertEquals("Test Person", store.findAll().get(0).getName());
        verify(jdbc).query(contains("FROM PERSON"), any(RowMapper.class));
    }

    @Test
    void personUpdateRejectsMissingPerson() {
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(0);

        Person person = new Person();
        person.setPersonId(9999L);
        person.setName("Missing Person");

        assertThrows(IllegalArgumentException.class,
                () -> new PersonStore(jdbc).save(person));
    }

    @Test
    void casePersonFindByCaseQueriesDatabase() {
        when(jdbc.query(anyString(), any(RowMapper.class), eq(3001L)))
                .thenReturn(List.of(new CasePerson()));

        CasePersonStore store = new CasePersonStore(jdbc);

        assertEquals(1, store.findByCaseId(3001L).size());
        verify(jdbc).query(contains("WHERE CASE_ID = ?"),
                any(RowMapper.class), eq(3001L));
    }

    @Test
    void casePersonSaveExecutesMerge() {
        CasePerson person = new CasePerson();
        person.setCaseId(3001L);
        person.setPersonId(1L);
        person.setRole("Witness");

        when(jdbc.update(any(org.springframework.jdbc.core.PreparedStatementCreator.class)))
                .thenReturn(1);

        assertSame(person, new CasePersonStore(jdbc).save(person));
        verify(jdbc).update(any(org.springframework.jdbc.core.PreparedStatementCreator.class));
    }

    @Test
    void assignmentFindByIdReturnsDatabaseResult() {
        CaseAssignment assignment = new CaseAssignment();
        assignment.setAssignmentId(1L);

        when(jdbc.query(anyString(), any(RowMapper.class), eq(1L)))
                .thenReturn(List.of(assignment));

        Optional<CaseAssignment> result =
                new CaseAssignmentStore(jdbc).findById(1L);

        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getAssignmentId());
    }

    @Test
    void assignmentUpdateRejectsMissingAssignment() {
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(0);

        CaseAssignment assignment = new CaseAssignment();
        assignment.setAssignmentId(9999L);
        assignment.setCaseId(3001L);
        assignment.setInvestigatorId(1001L);

        assertThrows(IllegalArgumentException.class,
                () -> new CaseAssignmentStore(jdbc).save(assignment));
    }
}
