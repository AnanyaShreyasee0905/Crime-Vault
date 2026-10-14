
package com.crimevault.dao;

import com.crimevault.model.CasePerson;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.Types;
import java.util.List;

@Repository
public class CasePersonStore {
    private final JdbcTemplate jdbc;

    public CasePersonStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<CasePerson> mapper = (rs, rowNum) -> {
        CasePerson cp = new CasePerson();
        cp.setCaseId(rs.getLong("CASE_ID"));
        cp.setPersonId(rs.getLong("PERSON_ID"));
        cp.setRole(rs.getString("ROLE"));
        Date added = rs.getDate("DATE_ADDED");
        cp.setDateAdded(added == null ? null : added.toLocalDate());
        cp.setRemarks(rs.getString("REMARKS"));
        return cp;
    };

    public List<CasePerson> findAll() {
        return jdbc.query(
                "SELECT CASE_ID, PERSON_ID, ROLE, DATE_ADDED, REMARKS FROM CASE_PERSON ORDER BY CASE_ID, PERSON_ID",
                mapper);
    }

    public List<CasePerson> findByCaseId(Long caseId) {
        return jdbc.query(
                "SELECT CASE_ID, PERSON_ID, ROLE, DATE_ADDED, REMARKS FROM CASE_PERSON WHERE CASE_ID = ? ORDER BY PERSON_ID",
                mapper, caseId);
    }

    public CasePerson save(CasePerson cp) {
        jdbc.update(connection -> {
            var ps = connection.prepareStatement(
                    "MERGE INTO CASE_PERSON t USING (SELECT ? CASE_ID, ? PERSON_ID FROM DUAL) s " +
                    "ON (t.CASE_ID=s.CASE_ID AND t.PERSON_ID=s.PERSON_ID) " +
                    "WHEN MATCHED THEN UPDATE SET t.ROLE=?, t.DATE_ADDED=?, t.REMARKS=? " +
                    "WHEN NOT MATCHED THEN INSERT (CASE_ID, PERSON_ID, ROLE, DATE_ADDED, REMARKS) " +
                    "VALUES (s.CASE_ID, s.PERSON_ID, ?, ?, ?)");
            ps.setLong(1, cp.getCaseId());
            ps.setLong(2, cp.getPersonId());
            ps.setString(3, cp.getRole());
            if (cp.getDateAdded() == null) ps.setNull(4, Types.DATE);
            else ps.setDate(4, Date.valueOf(cp.getDateAdded()));
            ps.setString(5, cp.getRemarks());
            ps.setString(6, cp.getRole());
            if (cp.getDateAdded() == null) ps.setNull(7, Types.DATE);
            else ps.setDate(7, Date.valueOf(cp.getDateAdded()));
            ps.setString(8, cp.getRemarks());
            return ps;
        });
        return cp;
    }
}
