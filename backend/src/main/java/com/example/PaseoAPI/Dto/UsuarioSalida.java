package com.example.PaseoAPI.Dto;

import com.example.PaseoAPI.Modelos.Usuario;

/**
 * Vista pública de un usuario: igual que {@link Usuario} pero SIN la contraseña.
 * Es lo único que la API devuelve hacia el frontend.
 */
public class UsuarioSalida {

    private String id;
    private String nombres;
    private String correo;
    private String rol;
    private String apartamento;
    private String telefono;
    private String creadoEn;

    public static UsuarioSalida desde(Usuario u) {
        UsuarioSalida s = new UsuarioSalida();
        s.id = u.getId();
        s.nombres = u.getNombres();
        s.correo = u.getCorreo();
        s.rol = u.getRol();
        s.apartamento = u.getApartamento();
        s.telefono = u.getTelefono();
        s.creadoEn = u.getCreadoEn();
        return s;
    }

    public String getId() {
        return id;
    }

    public String getNombres() {
        return nombres;
    }

    public String getCorreo() {
        return correo;
    }

    public String getRol() {
        return rol;
    }

    public String getApartamento() {
        return apartamento;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getCreadoEn() {
        return creadoEn;
    }
}
