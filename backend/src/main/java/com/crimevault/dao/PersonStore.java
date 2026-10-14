
package com.crimevault.dao;

import com.crimevault.model.Person;
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
public class PersonStore {
    private final JdbcTemplate jdbc;

    public PersonStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Person> mapper = (rs, rowNum) -> {
        Person p = new Person();
        p.setPersonId(rs.getLong("PERSON_ID"));
        p.setName(rs.getString("NAME"));
        Date dob = rs.getDate("DATE_OF_BIRTH");
        p.setDateOfBirth(dob == null ? null : dob.toLocalDate());
        p.setGender(rs.getString("GENDER"));
        p.setContact(rs.getString("CONTACT"));
        p.setAddress(rs.getString("ADDRESS"));
        return p;
    };

    public List<Person> findAll() {
        return jdbc.query(
                "SELECT PERSON_ID, NAME, DATE_OF_BIRTH, GENDER, CONTACT, ADDRESS FROM PERSON ORDER BY PERSON_ID",
                mapper);
    }

    public Optional<Person> findById(Long id) {
        return jdbc.query(
                "SELECT PERSON_ID, NAME, DATE_OF_BIRTH, GENDER, CONTACT, ADDRESS FROM PERSON WHERE PERSON_ID = ?",
                mapper, id).stream().findFirst();
    }

    public Person save(Person p) {
        if (p.getPersonId() == null) {
            String sql = "INSERT INTO PERSON (NAME, DATE_OF_BIRTH, GENDER, CONTACT, ADDRESS) VALUES (?, ?, ?, ?, ?)";
            KeyHolder keys = new GeneratedKeyHolder();

            jdbc.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(
                        sql, new String[]{"PERSON_ID"});
                ps.setString(1, p.getName());
                if (p.getDateOfBirth() == null) ps.setNull(2, Types.DATE);
                else ps.setDate(2, Date.valueOf(p.getDateOfBirth()));
                ps.setString(3, p.getGender());
                ps.setString(4, p.getContact());
                ps.setString(5, p.getAddress());
                return ps;
            }, keys);

            if (keys.getKey() != null) p.setPersonId(keys.getKey().longValue());
            return p;
        }

        int updated = jdbc.update(
                "UPDATE PERSON SET NAME=?, DATE_OF_BIRTH=?, GENDER=?, CONTACT=?, ADDRESS=? WHERE PERSON_ID=?",
                p.getName(),
                p.getDateOfBirth() == null ? null : Date.valueOf(p.getDateOfBirth()),
                p.getGender(), p.getContact(), p.getAddress(), p.getPersonId());

        if (updated == 0) throw new IllegalArgumentException("Person not found");
        return p;
    }
}
