package com.crimevault.dao;

import com.crimevault.model.InvestigationEvent;
import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class InvestigationEventStore {
    private final JdbcTemplate jdbc;
    private final RowMapper<InvestigationEvent> mapper = (rs, rowNum) -> {
        InvestigationEvent record = new InvestigationEvent();
        record.setEventId(rs.getLong("EVENT_ID"));
        record.setCaseId(rs.getLong("CASE_ID"));
        record.setInvestigatorId(rs.getLong("INVESTIGATOR_ID"));
        record.setEventDateTime(JdbcValueUtils.getTimestamp(rs, "EVENT_DATE_TIME"));
        record.setEventType(rs.getString("EVENT_TYPE"));
        record.setDescription(rs.getString("DESCRIPTION"));
        return record;
    };
    public InvestigationEventStore(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public List<InvestigationEvent> findAll() { return jdbc.query("SELECT EVENT_ID, CASE_ID, INVESTIGATOR_ID, EVENT_DATE_TIME, EVENT_TYPE, DESCRIPTION FROM INVESTIGATION_EVENT ORDER BY EVENT_ID", mapper); }
    public Optional<InvestigationEvent> findById(Long id) { return jdbc.query("SELECT EVENT_ID, CASE_ID, INVESTIGATOR_ID, EVENT_DATE_TIME, EVENT_TYPE, DESCRIPTION FROM INVESTIGATION_EVENT WHERE EVENT_ID = ?", mapper, id).stream().findFirst(); }
    public List<InvestigationEvent> findByCaseId(Long caseId) { return jdbc.query("SELECT EVENT_ID, CASE_ID, INVESTIGATOR_ID, EVENT_DATE_TIME, EVENT_TYPE, DESCRIPTION FROM INVESTIGATION_EVENT WHERE CASE_ID = ? ORDER BY EVENT_ID", mapper, caseId); }


    public InvestigationEvent save(InvestigationEvent record) {
        if (record.getEventId() == null) {
            String sql = "INSERT INTO INVESTIGATION_EVENT (CASE_ID, INVESTIGATOR_ID, EVENT_DATE_TIME, EVENT_TYPE, DESCRIPTION) VALUES (?, ?, ?, ?, ?)";
            KeyHolder keys = new GeneratedKeyHolder();
            jdbc.update(connection -> {
                PreparedStatement statement = connection.prepareStatement(sql, new String[]{"EVENT_ID"});
            statement.setLong(1, record.getCaseId());
            statement.setLong(2, record.getInvestigatorId());
            JdbcValueUtils.setTimestamp(statement, 3, record.getEventDateTime());
            statement.setString(4, record.getEventType());
            statement.setString(5, record.getDescription());
                return statement;
            }, keys);
            record.setEventId(JdbcValueUtils.generatedId(keys, "investigationevent"));
            return record;
        }
        String sql = "UPDATE INVESTIGATION_EVENT SET CASE_ID=?, INVESTIGATOR_ID=?, EVENT_DATE_TIME=?, EVENT_TYPE=?, DESCRIPTION=? WHERE EVENT_ID = ?";
        int updated = jdbc.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql);
            statement.setLong(1, record.getCaseId());
            statement.setLong(2, record.getInvestigatorId());
            JdbcValueUtils.setTimestamp(statement, 3, record.getEventDateTime());
            statement.setString(4, record.getEventType());
            statement.setString(5, record.getDescription());
            statement.setLong(6, record.getEventId());
            return statement;
        });
        if (updated == 0) throw new IllegalArgumentException("InvestigationEvent not found: " + record.getEventId());
        return record;
    }
    public int deleteById(Long id) { return jdbc.update("DELETE FROM INVESTIGATION_EVENT WHERE EVENT_ID = ?", id); }

}
