package com.example.PaseoAPI.Modelos;

import java.time.Instant;

/**
 * Residente o administrador de la unidad. La contraseña se guarda siempre
 * cifrada (BCrypt) y nunca se expone hacia el frontend.
 */
public class Usuario {

    private String id;
    private String nombres;
    private String correo;
    private String contrasena;   // hash BCrypt
    private String rol;          // ADMINISTRADOR | RESIDENTE
    private String apartamento;  // p.ej. "Torre 2 - Apto 504"
    private String telefono;
    private String creadoEn;     // ISO-8601

    public Usuario() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public String getApartamento() {
        return apartamento;
    }

    public void setApartamento(String apartamento) {
        this.apartamento = apartamento;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
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
