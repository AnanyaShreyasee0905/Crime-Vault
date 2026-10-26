package com.crimevault.dao;

import com.crimevault.model.Interview;
import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class InterviewStore {
    private final JdbcTemplate jdbc;
    private final RowMapper<Interview> mapper = (rs, rowNum) -> {
        Interview record = new Interview();
        record.setInterviewId(rs.getLong("INTERVIEW_ID"));
        record.setCaseId(rs.getLong("CASE_ID"));
        record.setPersonId(rs.getLong("PERSON_ID"));
        record.setInvestigatorId(rs.getLong("INVESTIGATOR_ID"));
        record.setInterviewDateTime(JdbcValueUtils.getTimestamp(rs, "INTERVIEW_DATE_TIME"));
        record.setLocation(rs.getString("LOCATION"));
        record.setSummary(rs.getString("SUMMARY"));
        return record;
    };
    public InterviewStore(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public List<Interview> findAll() { return jdbc.query("SELECT INTERVIEW_ID, CASE_ID, PERSON_ID, INVESTIGATOR_ID, INTERVIEW_DATE_TIME, LOCATION, SUMMARY FROM INTERVIEW ORDER BY INTERVIEW_ID", mapper); }
    public Optional<Interview> findById(Long id) { return jdbc.query("SELECT INTERVIEW_ID, CASE_ID, PERSON_ID, INVESTIGATOR_ID, INTERVIEW_DATE_TIME, LOCATION, SUMMARY FROM INTERVIEW WHERE INTERVIEW_ID = ?", mapper, id).stream().findFirst(); }
    public List<Interview> findByCaseId(Long caseId) { return jdbc.query("SELECT INTERVIEW_ID, CASE_ID, PERSON_ID, INVESTIGATOR_ID, INTERVIEW_DATE_TIME, LOCATION, SUMMARY FROM INTERVIEW WHERE CASE_ID = ? ORDER BY INTERVIEW_ID", mapper, caseId); }

    public Interview save(Interview record) {
        if (record.getInterviewId() == null) {
            String sql = "INSERT INTO INTERVIEW (CASE_ID, PERSON_ID, INVESTIGATOR_ID, INTERVIEW_DATE_TIME, LOCATION, SUMMARY) VALUES (?, ?, ?, ?, ?, ?)";
            KeyHolder keys = new GeneratedKeyHolder();
            jdbc.update(connection -> {
                PreparedStatement statement = connection.prepareStatement(sql, new String[]{"INTERVIEW_ID"});
            statement.setLong(1, record.getCaseId());
            statement.setLong(2, record.getPersonId());
            statement.setLong(3, record.getInvestigatorId());
            JdbcValueUtils.setTimestamp(statement, 4, record.getInterviewDateTime());
            statement.setString(5, record.getLocation());
            statement.setString(6, record.getSummary());
                return statement;
            }, keys);
            record.setInterviewId(JdbcValueUtils.generatedId(keys, "interview"));
            return record;
        }
        String sql = "UPDATE INTERVIEW SET CASE_ID=?, PERSON_ID=?, INVESTIGATOR_ID=?, INTERVIEW_DATE_TIME=?, LOCATION=?, SUMMARY=? WHERE INTERVIEW_ID = ?";
        int updated = jdbc.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql);
            statement.setLong(1, record.getCaseId());
            statement.setLong(2, record.getPersonId());
            statement.setLong(3, record.getInvestigatorId());
            JdbcValueUtils.setTimestamp(statement, 4, record.getInterviewDateTime());
            statement.setString(5, record.getLocation());
            statement.setString(6, record.getSummary());
            statement.setLong(7, record.getInterviewId());
            return statement;
        });
        if (updated == 0) throw new IllegalArgumentException("Interview not found: " + record.getInterviewId());
        return record;
    }
    public int deleteById(Long id) { return jdbc.update("DELETE FROM INTERVIEW WHERE INTERVIEW_ID = ?", id); }

}
