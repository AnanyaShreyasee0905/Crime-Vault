package com.crimevault.dao;

import com.crimevault.model.ForensicReport;
import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class ForensicReportStore {
    private final JdbcTemplate jdbc;
    private final RowMapper<ForensicReport> mapper = (rs, rowNum) -> {
        ForensicReport record = new ForensicReport();
        record.setReportId(rs.getLong("REPORT_ID"));
        record.setExaminationId(rs.getLong("EXAMINATION_ID"));
        record.setReportDate(JdbcValueUtils.getDate(rs, "REPORT_DATE"));
        record.setConclusion(rs.getString("CONCLUSION"));
        return record;
    };
    public ForensicReportStore(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public List<ForensicReport> findAll() { return jdbc.query("SELECT REPORT_ID, EXAMINATION_ID, REPORT_DATE, CONCLUSION FROM FORENSIC_REPORT ORDER BY REPORT_ID", mapper); }
    public Optional<ForensicReport> findById(Long id) { return jdbc.query("SELECT REPORT_ID, EXAMINATION_ID, REPORT_DATE, CONCLUSION FROM FORENSIC_REPORT WHERE REPORT_ID = ?", mapper, id).stream().findFirst(); }
    public List<ForensicReport> findByExaminationId(Long examinationId) { return jdbc.query("SELECT REPORT_ID, EXAMINATION_ID, REPORT_DATE, CONCLUSION FROM FORENSIC_REPORT WHERE EXAMINATION_ID = ? ORDER BY REPORT_ID", mapper, examinationId); }

    public List<ForensicReport> findByCaseId(Long caseId) {
        String sql = "SELECT fr.REPORT_ID, fr.EXAMINATION_ID, fr.REPORT_DATE, fr.CONCLUSION FROM FORENSIC_REPORT fr JOIN FORENSIC_EXAMINATION fe ON fe.EXAMINATION_ID = fr.EXAMINATION_ID JOIN EVIDENCE e ON e.EVIDENCE_ID = fe.EVIDENCE_ID WHERE e.CASE_ID = ? ORDER BY fr.REPORT_ID";
        return jdbc.query(sql, mapper, caseId);
    }

    public ForensicReport save(ForensicReport record) {
        if (record.getReportId() == null) {
            String sql = "INSERT INTO FORENSIC_REPORT (EXAMINATION_ID, REPORT_DATE, CONCLUSION) VALUES (?, ?, ?)";
            KeyHolder keys = new GeneratedKeyHolder();
            jdbc.update(connection -> {
                PreparedStatement statement = connection.prepareStatement(sql, new String[]{"REPORT_ID"});
            statement.setLong(1, record.getExaminationId());
            JdbcValueUtils.setDate(statement, 2, record.getReportDate());
            statement.setString(3, record.getConclusion());
                return statement;
            }, keys);
            record.setReportId(JdbcValueUtils.generatedId(keys, "forensicreport"));
            return record;
        }
        String sql = "UPDATE FORENSIC_REPORT SET EXAMINATION_ID=?, REPORT_DATE=?, CONCLUSION=? WHERE REPORT_ID = ?";
        int updated = jdbc.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql);
            statement.setLong(1, record.getExaminationId());
            JdbcValueUtils.setDate(statement, 2, record.getReportDate());
            statement.setString(3, record.getConclusion());
            statement.setLong(4, record.getReportId());
            return statement;
        });
        if (updated == 0) throw new IllegalArgumentException("ForensicReport not found: " + record.getReportId());
        return record;
    }
    public int deleteById(Long id) { return jdbc.update("DELETE FROM FORENSIC_REPORT WHERE REPORT_ID = ?", id); }

}
