package com.example.PaseoAPI.Configuracion;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Propiedades de negocio y de infraestructura de la aplicación, leídas desde
 * {@code application.properties} con el prefijo {@code paseo}. Centralizarlas
 * aquí evita repartir cadenas mágicas por todo el código.
 */
@ConfigurationProperties(prefix = "paseo")
public class PropiedadesPaseo {

    /** Modo de almacenamiento: {@code auto}, {@code firestore} o {@code memoria}. */
    private String almacenamiento = "auto";

    /** Zona horaria usada para interpretar fechas de reservas. */
    private String zonaHoraria = "America/Bogota";

    /** Si es {@code true}, se crean zonas comunes de ejemplo cuando no hay ninguna. */
    private boolean datosIniciales = true;

    private final Firebase firebase = new Firebase();
    private final Cors cors = new Cors();

    public String getAlmacenamiento() {
        return almacenamiento;
    }

    public void setAlmacenamiento(String almacenamiento) {
        this.almacenamiento = almacenamiento;
    }

    public String getZonaHoraria() {
        return zonaHoraria;
    }

    public void setZonaHoraria(String zonaHoraria) {
        this.zonaHoraria = zonaHoraria;
    }

    public boolean isDatosIniciales() {
        return datosIniciales;
    }

    public void setDatosIniciales(boolean datosIniciales) {
        this.datosIniciales = datosIniciales;
    }

    public Firebase getFirebase() {
        return firebase;
    }

    public Cors getCors() {
        return cors;
    }

    /** Datos de conexión con el proyecto de Firebase. */
    public static class Firebase {
        private String proyectoId = "";
        private String credenciales = "";
        private String credencialesBase64 = "";

        public String getProyectoId() {
            return proyectoId;
        }

        public void setProyectoId(String proyectoId) {
            this.proyectoId = proyectoId;
        }

        public String getCredenciales() {
            return credenciales;
        }

        public void setCredenciales(String credenciales) {
            this.credenciales = credenciales;
        }

        public String getCredencialesBase64() {
            return credencialesBase64;
        }

        public void setCredencialesBase64(String credencialesBase64) {
            this.credencialesBase64 = credencialesBase64;
        }
    }

    /** Orígenes permitidos para llamadas desde el navegador (CORS). */
    public static class Cors {
        private String origenes = "http://localhost:5173";

        public String getOrigenes() {
            return origenes;
        }

        public void setOrigenes(String origenes) {
            this.origenes = origenes;
        }

        /** Devuelve los orígenes como arreglo, separando por comas. */
        public String[] comoLista() {
            return java.util.Arrays.stream(origenes.split(","))
                    .map(String::trim)
                    .filter(o -> !o.isEmpty())
                    .toArray(String[]::new);
        }
    }
}
