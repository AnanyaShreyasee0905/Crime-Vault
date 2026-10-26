package com.crimevault.api;

import jakarta.servlet.http.HttpServletRequest;
import java.sql.SQLException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("Request validation failed");
        return response(HttpStatus.BAD_REQUEST, "Bad Request", message, request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> malformedRequest(HttpMessageNotReadableException ex, HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, "Bad Request", "Request body is malformed or contains an invalid date/time value", request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> integrity(DataIntegrityViolationException ex, HttpServletRequest request) {
        return response(HttpStatus.CONFLICT, "Conflict", "The request conflicts with a database key or relationship constraint", request);
    }

    @ExceptionHandler(DataAccessResourceFailureException.class)
    public ResponseEntity<ApiError> unavailable(DataAccessResourceFailureException ex, HttpServletRequest request) {
        Throwable cause = ex.getMostSpecificCause();
        SQLException sqlException = findSqlException(cause);
        if (sqlException == null) {
            log.warn("Database resource unavailable: causeType={}", cause.getClass().getName());
        } else {
            log.warn("Database resource unavailable: causeType={}, oracleErrorCode={}, sqlState={}",
                    cause.getClass().getName(), sqlException.getErrorCode(), sqlException.getSQLState());
        }
        return response(HttpStatus.SERVICE_UNAVAILABLE, "Service Unavailable", "The database is unavailable", request);
    }

    private SQLException findSqlException(Throwable cause) {
        for (Throwable current = cause; current != null; current = current.getCause()) {
            if (current instanceof SQLException sqlException) return sqlException;
        }
        return null;
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiError> database(DataAccessException ex, HttpServletRequest request) {
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "The database operation failed", request);
    }

    private ResponseEntity<ApiError> response(HttpStatus status, String error, String message, HttpServletRequest request) {
        return ResponseEntity.status(status).body(new ApiError(status.value(), error, message, request.getRequestURI()));
    }
}
