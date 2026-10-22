package com.example.PaseoAPI.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Datos de una persona que ingresa a la unidad, registrados en portería. */
public class CheckinEntrada {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 80, message = "El nombre debe tener entre 3 y 80 caracteres")
    private String nombre;

    @NotBlank(message = "La cédula es obligatoria")
    @Size(min = 4, max = 20, message = "La cédula debe tener entre 4 y 20 caracteres")
    private String cedula;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }
}
