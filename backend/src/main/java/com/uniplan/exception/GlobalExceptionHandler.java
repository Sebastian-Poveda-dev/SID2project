package com.uniplan.exception;

import com.uniplan.dto.response.ErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 404 ──────────────────────────────────────────────────────────────────

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, "Recurso no encontrado", ex.getMessage(), request);
    }

    // ── 409 ──────────────────────────────────────────────────────────────────

    @ExceptionHandler(DuplicateRegistrationException.class)
    public ResponseEntity<ErrorResponseDTO> handleDuplicate(
            DuplicateRegistrationException ex, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, "Registro duplicado", ex.getMessage(), request);
    }

    @ExceptionHandler(CapacityExceededException.class)
    public ResponseEntity<ErrorResponseDTO> handleCapacity(
            CapacityExceededException ex, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, "Capacidad excedida", ex.getMessage(), request);
    }

    // ── 422 ──────────────────────────────────────────────────────────────────

    @ExceptionHandler(InstitutionalValidationException.class)
    public ResponseEntity<ErrorResponseDTO> handleInstitutionalValidation(
            InstitutionalValidationException ex, HttpServletRequest request) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, "Validación institucional fallida", ex.getMessage(), request);
    }

    @ExceptionHandler(InvalidEventStateException.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidState(
            InvalidEventStateException ex, HttpServletRequest request) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, "Estado de evento inválido", ex.getMessage(), request);
    }

    @ExceptionHandler(BusinessValidationException.class)
    public ResponseEntity<ErrorResponseDTO> handleBusiness(
            BusinessValidationException ex, HttpServletRequest request) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, "Validación de negocio fallida", ex.getMessage(), request);
    }

    // ── 403 ──────────────────────────────────────────────────────────────────

    @ExceptionHandler(UnauthorizedOperationException.class)
    public ResponseEntity<ErrorResponseDTO> handleUnauthorizedOp(
            UnauthorizedOperationException ex, HttpServletRequest request) {
        return build(HttpStatus.FORBIDDEN, "Operación no autorizada", ex.getMessage(), request);
    }

    /**
     * Catches @PreAuthorize failures (method-level security).
     * Note: filter-level 403s (missing/invalid token) are handled by JwtAccessDeniedHandler.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDTO> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        return build(HttpStatus.FORBIDDEN, "Acceso denegado",
                "No tiene permisos suficientes para realizar esta operación", request);
    }

    // ── 401 ──────────────────────────────────────────────────────────────────

    /**
     * Catches Spring Security AuthenticationExceptions that escape the filter chain.
     * Normal 401s (missing token) are handled by JwtAuthenticationEntryPoint.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponseDTO> handleAuthentication(
            AuthenticationException ex, HttpServletRequest request) {
        return build(HttpStatus.UNAUTHORIZED, "No autorizado", ex.getMessage(), request);
    }

    // ── 400 ──────────────────────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return build(HttpStatus.BAD_REQUEST, "Datos de entrada inválidos", message, request);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponseDTO> handleMissingParam(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, "Parámetro requerido faltante", ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponseDTO> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String message = "El parámetro '" + ex.getName() + "' tiene un valor inválido: " + ex.getValue();
        return build(HttpStatus.BAD_REQUEST, "Tipo de parámetro inválido", message, request);
    }

    // ── 500 ──────────────────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGeneral(
            Exception ex, HttpServletRequest request) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor",
                "Ha ocurrido un error inesperado. Contacte al administrador.", request);
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    private ResponseEntity<ErrorResponseDTO> build(
            HttpStatus status, String error, String message, HttpServletRequest request) {
        ErrorResponseDTO body = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(error)
                .message(message)
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(status).body(body);
    }
}
