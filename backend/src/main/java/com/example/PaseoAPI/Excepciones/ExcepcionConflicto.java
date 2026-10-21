package com.example.PaseoAPI.Excepciones;

/** Conflicto con el estado actual (correo duplicado, choque de horario) -> HTTP 409. */
public class ExcepcionConflicto extends RuntimeException {
    public ExcepcionConflicto(String mensaje) {
        super(mensaje);
    }
}
