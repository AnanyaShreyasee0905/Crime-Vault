package com.crimevault.dao;

import com.crimevault.model.Evidence;
import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class EvidenceStore {
    private final JdbcTemplate jdbc;
    private final RowMapper<Evidence> mapper = (rs, rowNum) -> {
        Evidence record = new Evidence();
        record.setEvidenceId(rs.getLong("EVIDENCE_ID"));
        record.setCaseId(rs.getLong("CASE_ID"));
        record.setEvidenceType(rs.getString("EVIDENCE_TYPE"));
        record.setDescription(rs.getString("DESCRIPTION"));
        record.setCollectionLocation(rs.getString("COLLECTION_LOCATION"));
        record.setCollectionDateTime(JdbcValueUtils.getTimestamp(rs, "COLLECTION_DATE_TIME"));
        record.setStatus(rs.getString("STATUS"));
        record.setCurrentLocation(rs.getString("CURRENT_LOCATION"));
        return record;
    };
    public EvidenceStore(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public List<Evidence> findAll() { return jdbc.query("SELECT EVIDENCE_ID, CASE_ID, EVIDENCE_TYPE, DESCRIPTION, COLLECTION_LOCATION, COLLECTION_DATE_TIME, STATUS, CURRENT_LOCATION FROM EVIDENCE ORDER BY EVIDENCE_ID", mapper); }
    public Optional<Evidence> findById(Long id) { return jdbc.query("SELECT EVIDENCE_ID, CASE_ID, EVIDENCE_TYPE, DESCRIPTION, COLLECTION_LOCATION, COLLECTION_DATE_TIME, STATUS, CURRENT_LOCATION FROM EVIDENCE WHERE EVIDENCE_ID = ?", mapper, id).stream().findFirst(); }
    public List<Evidence> findByCaseId(Long caseId) { return jdbc.query("SELECT EVIDENCE_ID, CASE_ID, EVIDENCE_TYPE, DESCRIPTION, COLLECTION_LOCATION, COLLECTION_DATE_TIME, STATUS, CURRENT_LOCATION FROM EVIDENCE WHERE CASE_ID = ? ORDER BY EVIDENCE_ID", mapper, caseId); }

    public Evidence save(Evidence record) {
        if (record.getEvidenceId() == null) {
            String sql = "INSERT INTO EVIDENCE (CASE_ID, EVIDENCE_TYPE, DESCRIPTION, COLLECTION_LOCATION, COLLECTION_DATE_TIME, STATUS, CURRENT_LOCATION) VALUES (?, ?, ?, ?, ?, ?, ?)";
            KeyHolder keys = new GeneratedKeyHolder();
            jdbc.update(connection -> {
                PreparedStatement statement = connection.prepareStatement(sql, new String[]{"EVIDENCE_ID"});
            statement.setLong(1, record.getCaseId());
            statement.setString(2, record.getEvidenceType());
            statement.setString(3, record.getDescription());
            statement.setString(4, record.getCollectionLocation());
            JdbcValueUtils.setTimestamp(statement, 5, record.getCollectionDateTime());
            statement.setString(6, record.getStatus());
            statement.setString(7, record.getCurrentLocation());
                return statement;
            }, keys);
            record.setEvidenceId(JdbcValueUtils.generatedId(keys, "evidence"));
            return record;
        }
        String sql = "UPDATE EVIDENCE SET CASE_ID=?, EVIDENCE_TYPE=?, DESCRIPTION=?, COLLECTION_LOCATION=?, COLLECTION_DATE_TIME=?, STATUS=?, CURRENT_LOCATION=? WHERE EVIDENCE_ID = ?";
        int updated = jdbc.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql);
            statement.setLong(1, record.getCaseId());
            statement.setString(2, record.getEvidenceType());
            statement.setString(3, record.getDescription());
            statement.setString(4, record.getCollectionLocation());
            JdbcValueUtils.setTimestamp(statement, 5, record.getCollectionDateTime());
            statement.setString(6, record.getStatus());
            statement.setString(7, record.getCurrentLocation());
            statement.setLong(8, record.getEvidenceId());
            return statement;
        });
        if (updated == 0) throw new IllegalArgumentException("Evidence not found: " + record.getEvidenceId());
        return record;
    }
    public int deleteById(Long id) { return jdbc.update("DELETE FROM EVIDENCE WHERE EVIDENCE_ID = ?", id); }

}
