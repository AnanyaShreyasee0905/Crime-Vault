package com.crimevault.dao;

import com.crimevault.model.ForensicExamination;
import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class ForensicExaminationStore {
    private final JdbcTemplate jdbc;
    private final RowMapper<ForensicExamination> mapper = (rs, rowNum) -> {
        ForensicExamination record = new ForensicExamination();
        record.setExaminationId(rs.getLong("EXAMINATION_ID"));
        record.setEvidenceId(rs.getLong("EVIDENCE_ID"));
        record.setExaminerId(rs.getLong("EXAMINER_ID"));
        record.setExaminationType(rs.getString("EXAMINATION_TYPE"));
        record.setStartDate(JdbcValueUtils.getDate(rs, "START_DATE"));
        record.setEndDate(JdbcValueUtils.getDate(rs, "END_DATE"));
        record.setStatus(rs.getString("STATUS"));
        record.setFindings(rs.getString("FINDINGS"));
        return record;
    };
    public ForensicExaminationStore(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public List<ForensicExamination> findAll() { return jdbc.query("SELECT EXAMINATION_ID, EVIDENCE_ID, EXAMINER_ID, EXAMINATION_TYPE, START_DATE, END_DATE, STATUS, FINDINGS FROM FORENSIC_EXAMINATION ORDER BY EXAMINATION_ID", mapper); }
    public Optional<ForensicExamination> findById(Long id) { return jdbc.query("SELECT EXAMINATION_ID, EVIDENCE_ID, EXAMINER_ID, EXAMINATION_TYPE, START_DATE, END_DATE, STATUS, FINDINGS FROM FORENSIC_EXAMINATION WHERE EXAMINATION_ID = ?", mapper, id).stream().findFirst(); }
    public List<ForensicExamination> findByEvidenceId(Long evidenceId) { return jdbc.query("SELECT EXAMINATION_ID, EVIDENCE_ID, EXAMINER_ID, EXAMINATION_TYPE, START_DATE, END_DATE, STATUS, FINDINGS FROM FORENSIC_EXAMINATION WHERE EVIDENCE_ID = ? ORDER BY EXAMINATION_ID", mapper, evidenceId); }

    public List<ForensicExamination> findByCaseId(Long caseId) {
        String sql = "SELECT fe.EXAMINATION_ID, fe.EVIDENCE_ID, fe.EXAMINER_ID, fe.EXAMINATION_TYPE, fe.START_DATE, fe.END_DATE, fe.STATUS, fe.FINDINGS FROM FORENSIC_EXAMINATION fe JOIN EVIDENCE e ON e.EVIDENCE_ID = fe.EVIDENCE_ID WHERE e.CASE_ID = ? ORDER BY fe.EXAMINATION_ID";
        return jdbc.query(sql, mapper, caseId);
    }

    public ForensicExamination save(ForensicExamination record) {
        if (record.getExaminationId() == null) {
            String sql = "INSERT INTO FORENSIC_EXAMINATION (EVIDENCE_ID, EXAMINER_ID, EXAMINATION_TYPE, START_DATE, END_DATE, STATUS, FINDINGS) VALUES (?, ?, ?, ?, ?, ?, ?)";
            KeyHolder keys = new GeneratedKeyHolder();
            jdbc.update(connection -> {
                PreparedStatement statement = connection.prepareStatement(sql, new String[]{"EXAMINATION_ID"});
            statement.setLong(1, record.getEvidenceId());
            statement.setLong(2, record.getExaminerId());
            statement.setString(3, record.getExaminationType());
            JdbcValueUtils.setDate(statement, 4, record.getStartDate());
            JdbcValueUtils.setDate(statement, 5, record.getEndDate());
            statement.setString(6, record.getStatus());
            statement.setString(7, record.getFindings());
                return statement;
            }, keys);
            record.setExaminationId(JdbcValueUtils.generatedId(keys, "forensicexamination"));
            return record;
        }
        String sql = "UPDATE FORENSIC_EXAMINATION SET EVIDENCE_ID=?, EXAMINER_ID=?, EXAMINATION_TYPE=?, START_DATE=?, END_DATE=?, STATUS=?, FINDINGS=? WHERE EXAMINATION_ID = ?";
        int updated = jdbc.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql);
            statement.setLong(1, record.getEvidenceId());
            statement.setLong(2, record.getExaminerId());
            statement.setString(3, record.getExaminationType());
            JdbcValueUtils.setDate(statement, 4, record.getStartDate());
            JdbcValueUtils.setDate(statement, 5, record.getEndDate());
            statement.setString(6, record.getStatus());
            statement.setString(7, record.getFindings());
            statement.setLong(8, record.getExaminationId());
            return statement;
        });
        if (updated == 0) throw new IllegalArgumentException("ForensicExamination not found: " + record.getExaminationId());
        return record;
    }
    public int deleteById(Long id) { return jdbc.update("DELETE FROM FORENSIC_EXAMINATION WHERE EXAMINATION_ID = ?", id); }

}
