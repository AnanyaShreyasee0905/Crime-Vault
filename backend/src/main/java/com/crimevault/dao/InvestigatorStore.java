
package com.crimevault.dao;

import com.crimevault.model.Investigator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;

@Repository
public class InvestigatorStore {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Investigator> rowMapper = (rs, rowNum) -> {
        Investigator investigator = new Investigator();
        investigator.setInvestigatorId(rs.getLong("INVESTIGATOR_ID"));
        investigator.setName(rs.getString("NAME"));
        investigator.setBadgeNumber(rs.getString("BADGE_NUMBER"));
        investigator.setDepartment(rs.getString("DEPARTMENT"));
        investigator.setRank(rs.getString("RANK"));
        investigator.setContact(rs.getString("CONTACT"));
        investigator.setEmail(rs.getString("EMAIL"));
        return investigator;
    };

    public InvestigatorStore(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Investigator> findAll() {
        return jdbcTemplate.query(
            """
            SELECT INVESTIGATOR_ID, NAME, BADGE_NUMBER, DEPARTMENT,
                   RANK, CONTACT, EMAIL
            FROM INVESTIGATOR
            ORDER BY INVESTIGATOR_ID
            """,
            rowMapper
        );
    }

    public Optional<Investigator> findById(Long id) {
        List<Investigator> investigators = jdbcTemplate.query(
            """
            SELECT INVESTIGATOR_ID, NAME, BADGE_NUMBER, DEPARTMENT,
                   RANK, CONTACT, EMAIL
            FROM INVESTIGATOR
            WHERE INVESTIGATOR_ID = ?
            """,
            rowMapper,
            id
        );

        return investigators.stream().findFirst();
    }

    public Investigator save(Investigator investigator) {
        if (investigator.getInvestigatorId() == null) {
            String sql = """
                INSERT INTO INVESTIGATOR (
                    NAME, BADGE_NUMBER, DEPARTMENT, RANK, CONTACT, EMAIL
                ) VALUES (?, ?, ?, ?, ?, ?)
                """;

            KeyHolder keyHolder = new GeneratedKeyHolder();

            jdbcTemplate.update(connection -> {
                PreparedStatement statement = connection.prepareStatement(
                    sql,
                    new String[]{"INVESTIGATOR_ID"}
                );

                statement.setString(1, investigator.getName());
                statement.setString(2, investigator.getBadgeNumber());
                statement.setString(3, investigator.getDepartment());
                statement.setString(4, investigator.getRank());
                statement.setString(5, investigator.getContact());
                statement.setString(6, investigator.getEmail());

                return statement;
            }, keyHolder);

            Number generatedId = keyHolder.getKey();

            if (generatedId == null) {
                throw new IllegalStateException(
                    "Oracle did not return the generated investigator ID"
                );
            }

            investigator.setInvestigatorId(generatedId.longValue());
            return investigator;
        }

        String sql = """
            UPDATE INVESTIGATOR
            SET NAME = ?, BADGE_NUMBER = ?, DEPARTMENT = ?,
                RANK = ?, CONTACT = ?, EMAIL = ?
            WHERE INVESTIGATOR_ID = ?
            """;

        int updated = jdbcTemplate.update(
            sql,
            investigator.getName(),
            investigator.getBadgeNumber(),
            investigator.getDepartment(),
            investigator.getRank(),
            investigator.getContact(),
            investigator.getEmail(),
            investigator.getInvestigatorId()
        );

        if (updated == 0) {
            throw new IllegalArgumentException(
                "Investigator not found: " + investigator.getInvestigatorId()
            );
        }

        return investigator;
    }
}
