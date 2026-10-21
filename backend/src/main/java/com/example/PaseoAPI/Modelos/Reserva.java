package com.example.PaseoAPI.Modelos;

import java.time.Instant;

/**
 * Reserva de un espacio por parte de un usuario. Mantiene los campos originales
 * ({@code fecha} y {@code tiempo} en horas) y añade el vínculo con el espacio y
 * el usuario, personas asistentes, estado y un código de acceso para portería.
 */
public class Reserva {

    private String id;
    private String fecha;        // ISO-8601, inicio de la reserva
    private Integer tiempo;      // duración en horas
    private String espacioId;
    private String espacioNombre;
    private String usuarioId;
    private String usuarioNombre;
    private Integer personas;
    private String estado;       // PENDIENTE | CONFIRMADA | CANCELADA
    private String notas;
    private String codigoAcceso; // código corto para validar en portería (QR)
    private String creadoEn;

    public Reserva() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public Integer getTiempo() {
        return tiempo;
    }

    public void setTiempo(Integer tiempo) {
        this.tiempo = tiempo;
    }

    public String getEspacioId() {
        return espacioId;
    }

    public void setEspacioId(String espacioId) {
        this.espacioId = espacioId;
    }

    public String getEspacioNombre() {
        return espacioNombre;
    }

    public void setEspacioNombre(String espacioNombre) {
        this.espacioNombre = espacioNombre;
    }

    public String getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(String usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

    public Integer getPersonas() {
        return personas;
    }

    public void setPersonas(Integer personas) {
        this.personas = personas;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    public String getCodigoAcceso() {
        return codigoAcceso;
    }

    public void setCodigoAcceso(String codigoAcceso) {
        this.codigoAcceso = codigoAcceso;
    }

    public String getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(String creadoEn) {
        this.creadoEn = creadoEn;
    }

    public void marcarCreacion() {
        if (this.creadoEn == null) {
            this.creadoEn = Instant.now().toString();
        }
    }
}
