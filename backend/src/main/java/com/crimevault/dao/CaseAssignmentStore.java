
package com.crimevault.dao;

import com.crimevault.model.CaseAssignment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Types;
import java.util.List;
import java.util.Optional;

@Repository
public class CaseAssignmentStore {
    private final JdbcTemplate jdbc;

    public CaseAssignmentStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<CaseAssignment> mapper = (rs, rowNum) -> {
        CaseAssignment a = new CaseAssignment();
        a.setAssignmentId(rs.getLong("ASSIGNMENT_ID"));
        a.setCaseId(rs.getLong("CASE_ID"));
        a.setInvestigatorId(rs.getLong("INVESTIGATOR_ID"));
        Date date = rs.getDate("ASSIGNMENT_DATE");
        a.setAssignmentDate(date == null ? null : date.toLocalDate());
        a.setAssignmentRole(rs.getString("ASSIGNMENT_ROLE"));
        a.setAssignmentStatus(rs.getString("ASSIGNMENT_STATUS"));
        return a;
    };

    public List<CaseAssignment> findAll() {
        return jdbc.query(
                "SELECT ASSIGNMENT_ID, CASE_ID, INVESTIGATOR_ID, ASSIGNMENT_DATE, ASSIGNMENT_ROLE, ASSIGNMENT_STATUS FROM CASE_ASSIGNMENT ORDER BY ASSIGNMENT_ID",
                mapper);
    }

    public Optional<CaseAssignment> findById(Long id) {
        return jdbc.query(
                "SELECT ASSIGNMENT_ID, CASE_ID, INVESTIGATOR_ID, ASSIGNMENT_DATE, ASSIGNMENT_ROLE, ASSIGNMENT_STATUS FROM CASE_ASSIGNMENT WHERE ASSIGNMENT_ID=?",
                mapper, id).stream().findFirst();
    }

    public CaseAssignment save(CaseAssignment a) {
        if (a.getAssignmentId() == null) {
            String sql = "INSERT INTO CASE_ASSIGNMENT (CASE_ID, INVESTIGATOR_ID, ASSIGNMENT_DATE, ASSIGNMENT_ROLE, ASSIGNMENT_STATUS) VALUES (?, ?, ?, ?, ?)";
            KeyHolder keys = new GeneratedKeyHolder();

            jdbc.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(
                        sql, new String[]{"ASSIGNMENT_ID"});
                ps.setLong(1, a.getCaseId());
                ps.setLong(2, a.getInvestigatorId());
                if (a.getAssignmentDate() == null) ps.setNull(3, Types.DATE);
                else ps.setDate(3, Date.valueOf(a.getAssignmentDate()));
                ps.setString(4, a.getAssignmentRole());
                ps.setString(5, a.getAssignmentStatus());
                return ps;
            }, keys);

            if (keys.getKey() != null) a.setAssignmentId(keys.getKey().longValue());
            return a;
        }

        int updated = jdbc.update(
                "UPDATE CASE_ASSIGNMENT SET CASE_ID=?, INVESTIGATOR_ID=?, ASSIGNMENT_DATE=?, ASSIGNMENT_ROLE=?, ASSIGNMENT_STATUS=? WHERE ASSIGNMENT_ID=?",
                a.getCaseId(), a.getInvestigatorId(),
                a.getAssignmentDate() == null ? null : Date.valueOf(a.getAssignmentDate()),
                a.getAssignmentRole(), a.getAssignmentStatus(), a.getAssignmentId());

        if (updated == 0) throw new IllegalArgumentException("Assignment not found");
        return a;
    }
}
