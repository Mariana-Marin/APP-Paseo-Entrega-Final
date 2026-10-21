package com.example.PaseoAPI.Excepciones;

/** Error de regla de negocio (datos inválidos, conflicto, etc.) -> HTTP 400/409. */
public class ExcepcionNegocio extends RuntimeException {
    public ExcepcionNegocio(String mensaje) {
        super(mensaje);
    }
}
