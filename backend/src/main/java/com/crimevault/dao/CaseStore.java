
package com.crimevault.dao;

import com.crimevault.model.CaseRecord;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Types;
import java.util.List;
import java.util.Optional;

@Repository
public class CaseStore {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<CaseRecord> rowMapper = (rs, rowNum) -> {
        CaseRecord record = new CaseRecord();
        record.setCaseId(rs.getLong("CASE_ID"));
        record.setCaseNumber(rs.getString("CASE_NUMBER"));
        record.setTitle(rs.getString("TITLE"));
        record.setDescription(rs.getString("DESCRIPTION"));
        record.setCaseType(rs.getString("CASE_TYPE"));
        record.setPriority(rs.getString("PRIORITY"));
        record.setStatus(rs.getString("STATUS"));
        record.setLocation(rs.getString("LOCATION"));

        Date dateReported = rs.getDate("DATE_REPORTED");
        Date dateOpened = rs.getDate("DATE_OPENED");
        Date dateClosed = rs.getDate("DATE_CLOSED");

        record.setDateReported(dateReported == null ? null : dateReported.toLocalDate());
        record.setDateOpened(dateOpened == null ? null : dateOpened.toLocalDate());
        record.setDateClosed(dateClosed == null ? null : dateClosed.toLocalDate());
        record.setOutcome(rs.getString("OUTCOME"));

        return record;
    };

    public CaseStore(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<CaseRecord> findAll() {
        return jdbcTemplate.query(
            "SELECT CASE_ID, CASE_NUMBER, TITLE, DESCRIPTION, CASE_TYPE, PRIORITY, STATUS, LOCATION, DATE_REPORTED, DATE_OPENED, DATE_CLOSED, OUTCOME FROM \"CASE\" ORDER BY CASE_ID",
            rowMapper
        );
    }

    public Optional<CaseRecord> findById(Long id) {
        List<CaseRecord> records = jdbcTemplate.query(
            "SELECT CASE_ID, CASE_NUMBER, TITLE, DESCRIPTION, CASE_TYPE, PRIORITY, STATUS, LOCATION, DATE_REPORTED, DATE_OPENED, DATE_CLOSED, OUTCOME FROM \"CASE\" WHERE CASE_ID = ?",
            rowMapper,
            id
        );

        return records.stream().findFirst();
    }

    public CaseRecord save(CaseRecord record) {
        if (record.getCaseId() == null) {
            String sql = """
                INSERT INTO "CASE" (
                    CASE_NUMBER, TITLE, DESCRIPTION, CASE_TYPE, PRIORITY,
                    STATUS, LOCATION, DATE_REPORTED, DATE_OPENED, DATE_CLOSED, OUTCOME
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

            KeyHolder keyHolder = new GeneratedKeyHolder();

            jdbcTemplate.update(connection -> {
                PreparedStatement statement = connection.prepareStatement(
                    sql,
                    new String[]{"CASE_ID"}
                );

                statement.setString(1, record.getCaseNumber());
                statement.setString(2, record.getTitle());
                statement.setString(3, record.getDescription());
                statement.setString(4, record.getCaseType());
                statement.setString(5, record.getPriority());
                statement.setString(6, record.getStatus());
                statement.setString(7, record.getLocation());
                setDate(statement, 8, record.getDateReported());
                setDate(statement, 9, record.getDateOpened());
                setDate(statement, 10, record.getDateClosed());
                statement.setString(11, record.getOutcome());

                return statement;
            }, keyHolder);

            Number generatedId = keyHolder.getKey();

            if (generatedId == null) {
                throw new IllegalStateException("Oracle did not return the generated case ID");
            }

            record.setCaseId(generatedId.longValue());
            return record;
        }

        String sql = """
            UPDATE "CASE"
            SET CASE_NUMBER = ?, TITLE = ?, DESCRIPTION = ?, CASE_TYPE = ?,
                PRIORITY = ?, STATUS = ?, LOCATION = ?, DATE_REPORTED = ?,
                DATE_OPENED = ?, DATE_CLOSED = ?, OUTCOME = ?
            WHERE CASE_ID = ?
            """;

        int updated = jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql);

            statement.setString(1, record.getCaseNumber());
            statement.setString(2, record.getTitle());
            statement.setString(3, record.getDescription());
            statement.setString(4, record.getCaseType());
            statement.setString(5, record.getPriority());
            statement.setString(6, record.getStatus());
            statement.setString(7, record.getLocation());
            setDate(statement, 8, record.getDateReported());
            setDate(statement, 9, record.getDateOpened());
            setDate(statement, 10, record.getDateClosed());
            statement.setString(11, record.getOutcome());
            statement.setLong(12, record.getCaseId());

            return statement;
        });

        if (updated == 0) {
            throw new IllegalArgumentException("Case not found: " + record.getCaseId());
        }

        return record;
    }

    private void setDate(
        PreparedStatement statement,
        int index,
        java.time.LocalDate value
    ) throws java.sql.SQLException {
        if (value == null) {
            statement.setNull(index, Types.DATE);
        } else {
            statement.setDate(index, Date.valueOf(value));
        }
    }
}
