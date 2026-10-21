package com.example.PaseoAPI.Controladores;

import com.example.PaseoAPI.Excepciones.ExcepcionConflicto;
import com.example.PaseoAPI.Excepciones.ExcepcionNegocio;
import com.example.PaseoAPI.Excepciones.ExcepcionNoEncontrado;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Centraliza el formato de los errores. Todas las respuestas de error devuelven
 * un JSON con la forma {@code { "mensaje": "...", "estado": 400, "momento": "..." }},
 * que es justamente lo que el frontend lee en {@code error.response.data.mensaje}.
 */
@RestControllerAdvice
public class ManejadorErrores {

    @ExceptionHandler(ExcepcionNoEncontrado.class)
    public ResponseEntity<Map<String, Object>> noEncontrado(ExcepcionNoEncontrado e) {
        return construir(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(ExcepcionConflicto.class)
    public ResponseEntity<Map<String, Object>> conflicto(ExcepcionConflicto e) {
        return construir(HttpStatus.CONFLICT, e.getMessage());
    }

    @ExceptionHandler(ExcepcionNegocio.class)
    public ResponseEntity<Map<String, Object>> negocio(ExcepcionNegocio e) {
        return construir(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    /** Errores de validación de los DTOs (@Valid): toma el primer mensaje legible. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validacion(MethodArgumentNotValidException e) {
        String mensaje = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .findFirst()
                .orElse("Datos inválidos");
        return construir(HttpStatus.BAD_REQUEST, mensaje);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> general(Exception e) {
        return construir(HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocurrió un error inesperado en el servidor. Intenta de nuevo.");
    }

    private ResponseEntity<Map<String, Object>> construir(HttpStatus estado, String mensaje) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("mensaje", mensaje);
        cuerpo.put("estado", estado.value());
        cuerpo.put("momento", Instant.now().toString());
        return ResponseEntity.status(estado).body(cuerpo);
    }
}
