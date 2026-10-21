package com.example.PaseoAPI.Dto;

import java.util.List;

/**
 * Resultado de consultar la disponibilidad de un espacio en un día concreto:
 * las franjas horarias ya ocupadas y las horas libres sugeridas.
 */
public class DisponibilidadSalida {

    private String espacioId;
    private String fecha; // YYYY-MM-DD
    private Integer horaApertura;
    private Integer horaCierre;
    private List<FranjaOcupada> ocupadas;
    private List<Integer> horasLibres;

    public DisponibilidadSalida(String espacioId, String fecha, Integer horaApertura,
                                Integer horaCierre, List<FranjaOcupada> ocupadas,
                                List<Integer> horasLibres) {
        this.espacioId = espacioId;
        this.fecha = fecha;
        this.horaApertura = horaApertura;
        this.horaCierre = horaCierre;
        this.ocupadas = ocupadas;
        this.horasLibres = horasLibres;
    }

    public String getEspacioId() {
        return espacioId;
    }

    public String getFecha() {
        return fecha;
    }

    public Integer getHoraApertura() {
        return horaApertura;
    }

    public Integer getHoraCierre() {
        return horaCierre;
    }

    public List<FranjaOcupada> getOcupadas() {
        return ocupadas;
    }

    public List<Integer> getHorasLibres() {
        return horasLibres;
    }

    /** Franja [inicio, fin) ocupada por una reserva existente. */
    public static class FranjaOcupada {
        private int inicio;
        private int fin;
        private String reservaId;

        public FranjaOcupada(int inicio, int fin, String reservaId) {
            this.inicio = inicio;
            this.fin = fin;
            this.reservaId = reservaId;
        }

        public int getInicio() {
            return inicio;
        }

        public int getFin() {
            return fin;
        }

        public String getReservaId() {
            return reservaId;
        }
    }
}
