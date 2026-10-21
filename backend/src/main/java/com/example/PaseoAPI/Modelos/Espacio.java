package com.example.PaseoAPI.Modelos;

import java.time.Instant;

/**
 * Zona común reservable de la unidad (piscina, salón social, gimnasio, BBQ...).
 * Conserva los campos originales ({@code nombre, descripcion, foto, aforo}) y
 * agrega metadatos para enriquecer la experiencia de reserva.
 */
public class Espacio {

    private String id;
    private String nombre;
    private String descripcion;
    private String foto;
    private Integer aforo;

    private String categoria;      // PISCINA, SALON, GIMNASIO, BBQ, DEPORTIVO, OTRO
    private String ubicacion;      // p.ej. "Torre 1 - Terraza"
    private Integer horaApertura;  // hora local 0..23
    private Integer horaCierre;    // hora local 1..24
    private Boolean alAireLibre;   // habilita el pronóstico del clima
    private Boolean activo;
    private String creadoEn;

    public Espacio() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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
