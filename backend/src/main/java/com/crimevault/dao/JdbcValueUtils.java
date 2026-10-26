package com.crimevault.dao;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.jdbc.support.KeyHolder;

final class JdbcValueUtils {
    private JdbcValueUtils() { }
    static void setDate(PreparedStatement s, int i, LocalDate v) throws SQLException {
        if (v == null) s.setNull(i, Types.DATE); else s.setDate(i, Date.valueOf(v));
    }
    static void setTimestamp(PreparedStatement s, int i, LocalDateTime v) throws SQLException {
        if (v == null) s.setNull(i, Types.TIMESTAMP); else s.setTimestamp(i, Timestamp.valueOf(v));
    }
    static void setNullableLong(PreparedStatement s, int i, Long v) throws SQLException {
        if (v == null) s.setNull(i, Types.NUMERIC); else s.setLong(i, v);
    }
    static LocalDate getDate(ResultSet rs, String c) throws SQLException {
        Date v = rs.getDate(c); return v == null ? null : v.toLocalDate();
    }
    static LocalDateTime getTimestamp(ResultSet rs, String c) throws SQLException {
        Timestamp v = rs.getTimestamp(c); return v == null ? null : v.toLocalDateTime();
    }
    static Long generatedId(KeyHolder k, String label) {
        Number v = k.getKey();
        if (v == null) throw new IllegalStateException("Oracle did not return the generated " + label + " ID");
        return v.longValue();
    }
}
