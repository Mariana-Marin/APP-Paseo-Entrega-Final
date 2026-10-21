package com.example.PaseoAPI.Dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Datos que el frontend envía para registrar o actualizar una reserva. */
public class ReservaEntrada {

    @NotBlank(message = "El espacio es obligatorio")
    private String espacioId;

    @NotBlank(message = "El usuario es obligatorio")
    private String usuarioId;

    @NotBlank(message = "La fecha y hora son obligatorias")
    private String fecha; // ISO-8601, p.ej. 2026-11-20T15:00

    @NotNull(message = "La duración es obligatoria")
    @Min(value = 1, message = "La duración mínima es 1 hora")
    @Max(value = 12, message = "La duración máxima es 12 horas")
    private Integer tiempo;

    @NotNull(message = "Indique cuántas personas asistirán")
    @Min(value = 1, message = "Debe asistir al menos 1 persona")
    private Integer personas;

    private String estado;

    @Size(max = 300, message = "Las notas no pueden superar 300 caracteres")
    private String notas;

    public String getEspacioId() {
        return espacioId;
    }

    public void setEspacioId(String espacioId) {
        this.espacioId = espacioId;
    }

    public String getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(String usuarioId) {
        this.usuarioId = usuarioId;
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
}
