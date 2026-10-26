package com.crimevault.dao;

import com.crimevault.model.CustodyRecord;
import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class CustodyRecordStore {
    private final JdbcTemplate jdbc;
    private final RowMapper<CustodyRecord> mapper = (rs, rowNum) -> {
        CustodyRecord record = new CustodyRecord();
        record.setCustodyId(rs.getLong("CUSTODY_ID"));
        record.setEvidenceId(rs.getLong("EVIDENCE_ID"));
        long fromId = rs.getLong("FROM_INVESTIGATOR_ID");
        record.setFromInvestigatorId(rs.wasNull() ? null : fromId);
        record.setToInvestigatorId(rs.getLong("TO_INVESTIGATOR_ID"));
        record.setTransferDateTime(JdbcValueUtils.getTimestamp(rs, "TRANSFER_DATE_TIME"));
        record.setTransferReason(rs.getString("TRANSFER_REASON"));
        record.setLocation(rs.getString("LOCATION"));
        record.setRemarks(rs.getString("REMARKS"));
        return record;
    };
    public CustodyRecordStore(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    private String selectColumns() { return "CUSTODY_ID, EVIDENCE_ID, FROM_INVESTIGATOR_ID, TO_INVESTIGATOR_ID, TRANSFER_DATE_TIME, TRANSFER_REASON, LOCATION, REMARKS"; }
    public List<CustodyRecord> findAll() {
        return jdbc.query("SELECT " + selectColumns() + " FROM CUSTODY_RECORD ORDER BY TRANSFER_DATE_TIME, CUSTODY_ID", mapper);
    }
    public Optional<CustodyRecord> findById(Long id) {
        return jdbc.query("SELECT " + selectColumns() + " FROM CUSTODY_RECORD WHERE CUSTODY_ID = ?", mapper, id).stream().findFirst();
    }
    public List<CustodyRecord> findByEvidenceId(Long evidenceId) {
        return jdbc.query("SELECT " + selectColumns() + " FROM CUSTODY_RECORD WHERE EVIDENCE_ID = ? ORDER BY TRANSFER_DATE_TIME, CUSTODY_ID", mapper, evidenceId);
    }
    @Transactional
    public CustodyRecord recordTransfer(CustodyRecord record) {
        String sql = "INSERT INTO CUSTODY_RECORD (EVIDENCE_ID, FROM_INVESTIGATOR_ID, TO_INVESTIGATOR_ID, TRANSFER_DATE_TIME, TRANSFER_REASON, LOCATION, REMARKS) VALUES (?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keys = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql, new String[]{"CUSTODY_ID"});
            statement.setLong(1, record.getEvidenceId());
            JdbcValueUtils.setNullableLong(statement, 2, record.getFromInvestigatorId());
            statement.setLong(3, record.getToInvestigatorId());
            JdbcValueUtils.setTimestamp(statement, 4, record.getTransferDateTime());
            statement.setString(5, record.getTransferReason());
            statement.setString(6, record.getLocation());
            statement.setString(7, record.getRemarks());
            return statement;
        }, keys);
        record.setCustodyId(JdbcValueUtils.generatedId(keys, "custody"));
        if (record.getLocation() != null) {
            jdbc.update("UPDATE EVIDENCE SET CURRENT_LOCATION = ? WHERE EVIDENCE_ID = ?", record.getLocation(), record.getEvidenceId());
        }
        return record;
    }
}
