package com.example.PaseoAPI.Excepciones;

/** El recurso solicitado no existe -> HTTP 404. */
public class ExcepcionNoEncontrado extends RuntimeException {
    public ExcepcionNoEncontrado(String mensaje) {
        super(mensaje);
    }
}
