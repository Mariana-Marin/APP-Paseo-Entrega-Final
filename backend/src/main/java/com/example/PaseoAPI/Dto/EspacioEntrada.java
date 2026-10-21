package com.example.PaseoAPI.Dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Datos que el frontend envía para registrar o actualizar un espacio. */
public class EspacioEntrada {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 80, message = "El nombre debe tener entre 3 y 80 caracteres")
    private String nombre;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 10, max = 500, message = "La descripción debe tener entre 10 y 500 caracteres")
    private String descripcion;

    @Size(max = 500, message = "La URL de la foto es demasiado larga")
    private String foto;

    @NotNull(message = "El aforo es obligatorio")
    @Min(value = 1, message = "El aforo debe ser mayor a 0")
    @Max(value = 1000, message = "El aforo no puede superar 1000")
    private Integer aforo;

    private String categoria;

    @Size(max = 120, message = "La ubicación es demasiado larga")
    private String ubicacion;

    @Min(value = 0, message = "La hora de apertura debe estar entre 0 y 23")
    @Max(value = 23, message = "La hora de apertura debe estar entre 0 y 23")
    private Integer horaApertura;

    @Min(value = 1, message = "La hora de cierre debe estar entre 1 y 24")
    @Max(value = 24, message = "La hora de cierre debe estar entre 1 y 24")
    private Integer horaCierre;

    private Boolean alAireLibre;
    private Boolean activo;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getFoto() {
        return foto;
    }

    public void setFoto(String foto) {
        this.foto = foto;
    }

    public Integer getAforo() {
        return aforo;
    }

    public void setAforo(Integer aforo) {
        this.aforo = aforo;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public Integer getHoraApertura() {
        return horaApertura;
    }

    public void setHoraApertura(Integer horaApertura) {
        this.horaApertura = horaApertura;
    }

    public Integer getHoraCierre() {
        return horaCierre;
    }

    public void setHoraCierre(Integer horaCierre) {
        this.horaCierre = horaCierre;
    }

    public Boolean getAlAireLibre() {
        return alAireLibre;
    }

    public void setAlAireLibre(Boolean alAireLibre) {
        this.alAireLibre = alAireLibre;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
