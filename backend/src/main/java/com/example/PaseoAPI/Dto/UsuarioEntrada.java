package com.example.PaseoAPI.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Datos que el frontend envía para registrar o actualizar un usuario. */
public class UsuarioEntrada {

    @NotBlank(message = "Los nombres son obligatorios")
    @Size(min = 3, max = 80, message = "Los nombres deben tener entre 3 y 80 caracteres")
    private String nombres;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Ingrese un correo válido")
    private String correo;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 100, message = "La contraseña debe tener mínimo 6 caracteres")
    private String contrasena;

    @NotBlank(message = "Seleccione un rol")
    private String rol;

    @Size(max = 60, message = "El apartamento no puede superar 60 caracteres")
    private String apartamento;

    @Size(max = 30, message = "El teléfono no puede superar 30 caracteres")
    private String telefono;

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
}
