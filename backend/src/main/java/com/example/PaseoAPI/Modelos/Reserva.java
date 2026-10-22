package com.example.PaseoAPI.Modelos;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

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
    private String codigoAcceso;         // código del pase del residente (QR 1)
    private String codigoVerificacion;   // código que se genera tras el check-in (QR 2)
    private Integer ingresados;          // cuántas personas han entrado ya
    private List<Asistente> asistentes;  // registro de quienes entraron
    private String creadoEn;

    public Reserva() {
        this.ingresados = 0;
        this.asistentes = new ArrayList<>();
    }

    /** Persona que ingresa a la unidad, registrada en portería. */
    public static class Asistente {
        private String nombre;
        private String cedula;
        private String ingresoEn;

        public Asistente() {}

        public Asistente(String nombre, String cedula, String ingresoEn) {
            this.nombre = nombre;
            this.cedula = cedula;
            this.ingresoEn = ingresoEn;
        }

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getCedula() { return cedula; }
        public void setCedula(String cedula) { this.cedula = cedula; }
        public String getIngresoEn() { return ingresoEn; }
        public void setIngresoEn(String ingresoEn) { this.ingresoEn = ingresoEn; }
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

    public String getCodigoVerificacion() {
        return codigoVerificacion;
    }

    public void setCodigoVerificacion(String codigoVerificacion) {
        this.codigoVerificacion = codigoVerificacion;
    }

    public Integer getIngresados() {
        return ingresados == null ? 0 : ingresados;
    }

    public void setIngresados(Integer ingresados) {
        this.ingresados = ingresados;
    }

    public List<Asistente> getAsistentes() {
        if (asistentes == null) {
            asistentes = new ArrayList<>();
        }
        return asistentes;
    }

    public void setAsistentes(List<Asistente> asistentes) {
        this.asistentes = asistentes;
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
