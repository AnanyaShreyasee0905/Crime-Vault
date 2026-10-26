package com.crimevault.dao;

import com.crimevault.model.*;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.RowMapper;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class NewModuleStoreTests {
    @Test void evidenceQueryUsesEvidenceRelation() {
        JdbcTemplate jdbc = emptyQuery();
        new EvidenceStore(jdbc).findAll();
        verify(jdbc).query(contains("FROM EVIDENCE"), any(RowMapper.class));
    }

    @Test void custodyQueryUsesCustodyRelation() {
        JdbcTemplate jdbc = emptyQuery();
        new CustodyRecordStore(jdbc).findAll();
        verify(jdbc).query(contains("FROM CUSTODY_RECORD"), any(RowMapper.class));
    }

    @Test void interviewQueryUsesInterviewRelation() {
        JdbcTemplate jdbc = emptyQuery();
        new InterviewStore(jdbc).findByCaseId(11L);
        verify(jdbc).query(contains("FROM INTERVIEW WHERE CASE_ID = ?"), any(RowMapper.class), eq(11L));
    }

    @Test void eventQueryUsesInvestigationEventRelation() {
        JdbcTemplate jdbc = emptyQuery();
        new InvestigationEventStore(jdbc).findByCaseId(11L);
        verify(jdbc).query(contains("FROM INVESTIGATION_EVENT WHERE CASE_ID = ?"), any(RowMapper.class), eq(11L));
    }

    @Test void examinationCaseQueryJoinsThroughEvidence() {
        JdbcTemplate jdbc = emptyQuery();
        new ForensicExaminationStore(jdbc).findByCaseId(11L);
        verify(jdbc).query(contains("JOIN EVIDENCE"), any(RowMapper.class), eq(11L));
    }

    @Test void reportCaseQueryJoinsThroughExaminationAndEvidence() {
        JdbcTemplate jdbc = emptyQuery();
        new ForensicReportStore(jdbc).findByCaseId(11L);
        verify(jdbc).query(contains("JOIN FORENSIC_EXAMINATION"), any(RowMapper.class), eq(11L));
    }

    @Test void evidenceUpdateUsesBoundPreparedStatementAndExistingId() throws Exception {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        Connection connection = mock(Connection.class);
        PreparedStatement statement = mock(PreparedStatement.class);
        when(connection.prepareStatement(anyString())).thenReturn(statement);
        when(jdbc.update(any(PreparedStatementCreator.class))).thenAnswer(call -> {
            ((PreparedStatementCreator) call.getArgument(0)).createPreparedStatement(connection);
            return 1;
        });
        Evidence evidence = new Evidence();
        evidence.setEvidenceId(51L);
        evidence.setCaseId(11L);
        evidence.setEvidenceType("Device");
        new EvidenceStore(jdbc).save(evidence);
        verify(connection).prepareStatement(contains("UPDATE EVIDENCE SET"));
        verify(statement).setLong(8, 51L);
    }

    @Test void custodyTransferWritesHistoryAndSynchronizesEvidenceLocation() throws Exception {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        Connection connection = mock(Connection.class);
        PreparedStatement statement = mock(PreparedStatement.class);
        when(connection.prepareStatement(anyString(), any(String[].class))).thenReturn(statement);
        when(jdbc.update(any(PreparedStatementCreator.class), any(org.springframework.jdbc.support.KeyHolder.class)))
                .thenAnswer(call -> {
                    ((PreparedStatementCreator) call.getArgument(0)).createPreparedStatement(connection);
                    org.springframework.jdbc.support.KeyHolder keys = call.getArgument(1);
                    keys.getKeyList().add(java.util.Map.of("CUSTODY_ID", 91L));
                    return 1;
                });
        when(jdbc.update(eq("UPDATE EVIDENCE SET CURRENT_LOCATION = ? WHERE EVIDENCE_ID = ?"), any(), any()))
                .thenReturn(1);
        CustodyRecord record = new CustodyRecord();
        record.setEvidenceId(51L);
        record.setFromInvestigatorId(8L);
        record.setToInvestigatorId(9L);
        record.setTransferDateTime(LocalDateTime.of(2026, 10, 24, 9, 0));
        record.setLocation("Forensics Lab");
        CustodyRecord saved = new CustodyRecordStore(jdbc).recordTransfer(record);
        org.junit.jupiter.api.Assertions.assertEquals(91L, saved.getCustodyId());
        verify(jdbc).update(eq("UPDATE EVIDENCE SET CURRENT_LOCATION = ? WHERE EVIDENCE_ID = ?"), eq("Forensics Lab"), eq(51L));
        org.junit.jupiter.api.Assertions.assertNotNull(
                CustodyRecordStore.class.getMethod("recordTransfer", CustodyRecord.class)
                        .getAnnotation(org.springframework.transaction.annotation.Transactional.class));
    }

    private JdbcTemplate emptyQuery() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.query(anyString(), any(RowMapper.class))).thenReturn(List.of());
        when(jdbc.query(anyString(), any(RowMapper.class), any())).thenReturn(List.of());
        return jdbc;
    }
}
