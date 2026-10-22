package com.example.PaseoAPI.Servicios;

import com.example.PaseoAPI.Configuracion.PropiedadesPaseo;
import com.example.PaseoAPI.Dto.DisponibilidadSalida;
import com.example.PaseoAPI.Dto.ReservaEntrada;
import com.example.PaseoAPI.Excepciones.ExcepcionConflicto;
import com.example.PaseoAPI.Excepciones.ExcepcionNegocio;
import com.example.PaseoAPI.Excepciones.ExcepcionNoEncontrado;
import com.example.PaseoAPI.Modelos.Espacio;
import com.example.PaseoAPI.Modelos.Reserva;
import com.example.PaseoAPI.Modelos.Usuario;
import com.example.PaseoAPI.ModelosRepositorios.iRepositorioEspacio;
import com.example.PaseoAPI.ModelosRepositorios.iRepositorioReserva;
import com.example.PaseoAPI.ModelosRepositorios.iRepositorioUsuario;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Corazón de la lógica de reservas. Valida y aplica todas las reglas de negocio:
 *
 * <ul>
 *   <li>El espacio y el usuario deben existir, y el espacio debe estar activo.</li>
 *   <li>La fecha/hora debe ser futura.</li>
 *   <li>La reserva debe caber dentro del horario del espacio (apertura–cierre).</li>
 *   <li>El número de personas no puede superar el aforo.</li>
 *   <li>No puede solaparse con otra reserva vigente del mismo espacio.</li>
 * </ul>
 */
@Service
public class ReservaServicio {

    private static final Set<String> ESTADOS = Set.of("PENDIENTE", "CONFIRMADA", "CANCELADA");
    private static final String CODIGO_ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom ALEATORIO = new SecureRandom();

    private final iRepositorioReserva repositorioReserva;
    private final iRepositorioEspacio repositorioEspacio;
    private final iRepositorioUsuario repositorioUsuario;
    private final ZoneId zona;

    public ReservaServicio(iRepositorioReserva repositorioReserva,
                           iRepositorioEspacio repositorioEspacio,
                           iRepositorioUsuario repositorioUsuario,
                           PropiedadesPaseo propiedades) {
        this.repositorioReserva = repositorioReserva;
        this.repositorioEspacio = repositorioEspacio;
        this.repositorioUsuario = repositorioUsuario;
        this.zona = ZoneId.of(propiedades.getZonaHoraria());
    }

    public List<Reserva> listar(String espacioId, String usuarioId) {
        if (espacioId != null && !espacioId.isBlank()) {
            return repositorioReserva.listarPorEspacio(espacioId);
        }
        if (usuarioId != null && !usuarioId.isBlank()) {
            return repositorioReserva.listarPorUsuario(usuarioId);
        }
        return repositorioReserva.listar();
    }

    public Reserva buscarPorId(String id) {
        return repositorioReserva.buscarPorId(id)
                .orElseThrow(() -> new ExcepcionNoEncontrado("No existe la reserva solicitada"));
    }

    public Reserva registrar(ReservaEntrada datos) {
        Espacio espacio = repositorioEspacio.buscarPorId(datos.getEspacioId())
                .orElseThrow(() -> new ExcepcionNegocio("El espacio seleccionado no existe"));
        if (espacio.getActivo() != null && !espacio.getActivo()) {
            throw new ExcepcionNegocio("El espacio no está disponible para reservas");
        }
        Usuario usuario = repositorioUsuario.buscarPorId(datos.getUsuarioId())
                .orElseThrow(() -> new ExcepcionNegocio("El usuario indicado no existe"));

        LocalDateTime inicio = parsearFecha(datos.getFecha());
        if (inicio.isBefore(LocalDateTime.now(zona))) {
            throw new ExcepcionNegocio("La fecha de la reserva debe ser futura");
        }

        int horaInicio = inicio.getHour();
        int horaFin = horaInicio + datos.getTiempo();
        validarHorario(espacio, horaInicio, horaFin);
        validarAforo(espacio, datos.getPersonas());
        validarSolapamiento(espacio, inicio.toLocalDate(), horaInicio, horaFin, datos.getPersonas(), null);

        Reserva r = new Reserva();
        r.setEspacioId(espacio.getId());
        r.setEspacioNombre(espacio.getNombre());
        r.setUsuarioId(usuario.getId());
        r.setUsuarioNombre(usuario.getNombres());
        r.setFecha(inicio.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        r.setTiempo(datos.getTiempo());
        r.setPersonas(datos.getPersonas());
        r.setEstado(normalizarEstado(datos.getEstado(), "CONFIRMADA"));
        r.setNotas(datos.getNotas() == null ? null : datos.getNotas().trim());
        r.setCodigoAcceso(generarCodigoUnico());
        r.marcarCreacion();

        return repositorioReserva.guardar(r);
    }

    public Reserva actualizar(String id, ReservaEntrada datos) {
        Reserva actual = buscarPorId(id);
        Espacio espacio = repositorioEspacio.buscarPorId(datos.getEspacioId())
                .orElseThrow(() -> new ExcepcionNegocio("El espacio seleccionado no existe"));
        Usuario usuario = repositorioUsuario.buscarPorId(datos.getUsuarioId())
                .orElseThrow(() -> new ExcepcionNegocio("El usuario indicado no existe"));

        LocalDateTime inicio = parsearFecha(datos.getFecha());
        int horaInicio = inicio.getHour();
        int horaFin = horaInicio + datos.getTiempo();
        validarHorario(espacio, horaInicio, horaFin);
        validarAforo(espacio, datos.getPersonas());
        validarSolapamiento(espacio, inicio.toLocalDate(), horaInicio, horaFin, datos.getPersonas(), id);

        actual.setEspacioId(espacio.getId());
        actual.setEspacioNombre(espacio.getNombre());
        actual.setUsuarioId(usuario.getId());
        actual.setUsuarioNombre(usuario.getNombres());
        actual.setFecha(inicio.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        actual.setTiempo(datos.getTiempo());
        actual.setPersonas(datos.getPersonas());
        actual.setEstado(normalizarEstado(datos.getEstado(), actual.getEstado()));
        actual.setNotas(datos.getNotas() == null ? null : datos.getNotas().trim());

        return repositorioReserva.guardar(actual);
    }

    public Reserva cambiarEstado(String id, String estado) {
        Reserva r = buscarPorId(id);
        r.setEstado(normalizarEstado(estado, r.getEstado()));
        return repositorioReserva.guardar(r);
    }

    public void eliminar(String id) {
        if (!repositorioReserva.eliminar(id)) {
            throw new ExcepcionNoEncontrado("No existe la reserva a eliminar");
        }
    }

    public Reserva verificarPorCodigo(String codigo) {
        String c = codigo == null ? null : codigo.trim().toUpperCase();
        // El QR puede traer el código del pase (QR 1) o el de verificación (QR 2).
        Optional<Reserva> porAcceso = repositorioReserva.buscarPorCodigo(c);
        if (porAcceso.isPresent()) {
            return porAcceso.get();
        }
        return repositorioReserva.listar().stream()
                .filter(r -> r.getCodigoVerificacion() != null && r.getCodigoVerificacion().equalsIgnoreCase(c))
                .findFirst()
                .orElseThrow(() -> new ExcepcionNoEncontrado("No hay ninguna reserva con ese código"));
    }

    /**
     * Registra el ingreso de una persona (nombre + cédula) a la unidad usando el
     * código del pase. Disminuye el cupo restante. Cuando ya han ingresado todas
     * las personas de la reserva, genera un código de verificación (QR 2) que el
     * portero puede usar para confirmar que el registro quedó completo.
     */
    public Reserva registrarIngreso(String codigo, String nombre, String cedula) {
        Reserva r = repositorioReserva.buscarPorCodigo(codigo == null ? null : codigo.trim().toUpperCase())
                .orElseThrow(() -> new ExcepcionNoEncontrado("No hay ninguna reserva con ese código de acceso"));

        if ("CANCELADA".equalsIgnoreCase(r.getEstado())) {
            throw new ExcepcionNegocio("Esta reserva fue cancelada; no permite ingresos");
        }

        int total = r.getPersonas() == null ? 1 : r.getPersonas();
        int yaIngresados = r.getIngresados();
        if (yaIngresados >= total) {
            throw new ExcepcionNegocio("Ya ingresaron todas las personas de esta reserva (" + total + ")");
        }

        r.getAsistentes().add(new Reserva.Asistente(
                nombre.trim(), cedula.trim(), LocalDateTime.now(zona).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)));
        r.setIngresados(yaIngresados + 1);

        // Si ya entraron todos, emitir el código de verificación (QR 2).
        if (r.getIngresados() >= total && r.getCodigoVerificacion() == null) {
            r.setCodigoVerificacion("OK-" + generarCodigo());
        }
        return repositorioReserva.guardar(r);
    }

    /** Calcula franjas ocupadas y horas libres de un espacio en un día dado. */
    public DisponibilidadSalida disponibilidad(String espacioId, String fecha) {
        Espacio espacio = repositorioEspacio.buscarPorId(espacioId)
                .orElseThrow(() -> new ExcepcionNoEncontrado("No existe el espacio solicitado"));
        LocalDate dia = parsearDia(fecha);

        int apertura = espacio.getHoraApertura() == null ? 6 : espacio.getHoraApertura();
        int cierre = espacio.getHoraCierre() == null ? 22 : espacio.getHoraCierre();
        boolean compartible = espacio.getCompartible() != null && espacio.getCompartible();
        int aforo = espacio.getAforo() == null ? Integer.MAX_VALUE : espacio.getAforo();

        List<DisponibilidadSalida.FranjaOcupada> ocupadas = new ArrayList<>();
        int[] personasPorHora = new int[24];

        for (Reserva r : repositorioReserva.listarPorEspacio(espacioId)) {
            if (esCancelada(r) || r.getFecha() == null) {
                continue;
            }
            LocalDateTime ini = parsearFechaSilencioso(r.getFecha());
            if (ini == null || !ini.toLocalDate().equals(dia)) {
                continue;
            }
            int h0 = ini.getHour();
            int h1 = h0 + (r.getTiempo() == null ? 1 : r.getTiempo());
            ocupadas.add(new DisponibilidadSalida.FranjaOcupada(h0, h1, r.getId()));
            for (int h = h0; h < h1 && h < 24; h++) {
                personasPorHora[h] += (r.getPersonas() == null ? 1 : r.getPersonas());
            }
        }

        // Una hora está libre si: en espacio exclusivo no hay nadie; en espacio
        // compartible todavía queda cupo (personas acumuladas < aforo).
        List<Integer> horasLibres = new ArrayList<>();
        for (int h = apertura; h < cierre; h++) {
            boolean libre = compartible ? personasPorHora[h] < aforo : personasPorHora[h] == 0;
            if (libre) {
                horasLibres.add(h);
            }
        }
        return new DisponibilidadSalida(espacioId, dia.toString(), apertura, cierre, ocupadas, horasLibres);
    }

    // ---------------------------------------------------------------------
    // Reglas de negocio auxiliares
    // ---------------------------------------------------------------------

    private void validarHorario(Espacio espacio, int horaInicio, int horaFin) {
        int apertura = espacio.getHoraApertura() == null ? 6 : espacio.getHoraApertura();
        int cierre = espacio.getHoraCierre() == null ? 22 : espacio.getHoraCierre();
        if (horaInicio < apertura || horaFin > cierre) {
            throw new ExcepcionNegocio(String.format(
                    "El espacio '%s' solo está disponible entre las %02d:00 y las %02d:00",
                    espacio.getNombre(), apertura, cierre));
        }
    }

    private void validarAforo(Espacio espacio, int personas) {
        if (espacio.getAforo() != null && personas > espacio.getAforo()) {
            throw new ExcepcionNegocio(String.format(
                    "El aforo de '%s' es %d personas y solicitaste %d",
                    espacio.getNombre(), espacio.getAforo(), personas));
        }
    }

    /**
     * Valida choques de horario según el tipo de espacio:
     *  - Espacio COMPARTIBLE (piscina, gimnasio, coworking): varios residentes
     *    pueden coincidir mientras la suma de personas de las reservas que se
     *    solapan NO supere el aforo. Solo se bloquea si se llenaría el cupo.
     *  - Espacio EXCLUSIVO (salón, BBQ, cancha): una sola reserva por franja.
     */
    private void validarSolapamiento(Espacio espacio, LocalDate dia, int horaInicio, int horaFin,
                                     int personasNuevas, String ignorarId) {
        boolean compartible = espacio.getCompartible() != null && espacio.getCompartible();
        int aforo = espacio.getAforo() == null ? Integer.MAX_VALUE : espacio.getAforo();

        for (Reserva r : repositorioReserva.listarPorEspacio(espacio.getId())) {
            if (esCancelada(r) || r.getFecha() == null) {
                continue;
            }
            if (ignorarId != null && ignorarId.equals(r.getId())) {
                continue;
            }
            LocalDateTime ini = parsearFechaSilencioso(r.getFecha());
            if (ini == null || !ini.toLocalDate().equals(dia)) {
                continue;
            }
            int h0 = ini.getHour();
            int h1 = h0 + (r.getTiempo() == null ? 1 : r.getTiempo());
            boolean seSolapan = horaInicio < h1 && h0 < horaFin;
            if (!seSolapan) {
                continue;
            }

            if (!compartible) {
                throw new ExcepcionConflicto(String.format(
                        "Ya hay una reserva de %02d:00 a %02d:00 para ese espacio ese día", h0, h1));
            }
        }

        // En espacios compartibles, revisar hora por hora que no se supere el aforo.
        if (compartible) {
            for (int h = horaInicio; h < horaFin; h++) {
                int ocupadas = personasNuevas;
                for (Reserva r : repositorioReserva.listarPorEspacio(espacio.getId())) {
                    if (esCancelada(r) || r.getFecha() == null) continue;
                    if (ignorarId != null && ignorarId.equals(r.getId())) continue;
                    LocalDateTime ini = parsearFechaSilencioso(r.getFecha());
                    if (ini == null || !ini.toLocalDate().equals(dia)) continue;
                    int h0 = ini.getHour();
                    int h1 = h0 + (r.getTiempo() == null ? 1 : r.getTiempo());
                    if (h >= h0 && h < h1) {
                        ocupadas += (r.getPersonas() == null ? 1 : r.getPersonas());
                    }
                }
                if (ocupadas > aforo) {
                    throw new ExcepcionConflicto(String.format(
                            "A las %02d:00 el espacio '%s' llegaría a %d personas y el aforo es %d. "
                            + "Elige otra hora o reduce el número de personas.",
                            h, espacio.getNombre(), ocupadas, aforo));
                }
            }
        }
    }

    private boolean esCancelada(Reserva r) {
        return "CANCELADA".equalsIgnoreCase(r.getEstado());
    }

    private String normalizarEstado(String estado, String porDefecto) {
        if (estado == null || estado.isBlank()) {
            return porDefecto;
        }
        String e = estado.trim().toUpperCase();
        if (!ESTADOS.contains(e)) {
            throw new ExcepcionNegocio("El estado debe ser PENDIENTE, CONFIRMADA o CANCELADA");
        }
        return e;
    }

    private LocalDateTime parsearFecha(String texto) {
        LocalDateTime fecha = parsearFechaSilencioso(texto);
        if (fecha == null) {
            throw new ExcepcionNegocio("La fecha debe tener el formato AAAA-MM-DDTHH:mm");
        }
        return fecha;
    }

    private LocalDateTime parsearFechaSilencioso(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }
        String limpio = texto.trim();
        try {
            if (limpio.length() == 16) { // yyyy-MM-ddTHH:mm
                return LocalDateTime.parse(limpio);
            }
            if (limpio.length() >= 19) {
                return LocalDateTime.parse(limpio.substring(0, 19));
            }
            if (limpio.length() == 10) { // solo fecha -> medianoche
                return LocalDate.parse(limpio).atStartOfDay();
            }
            return LocalDateTime.parse(limpio);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private LocalDate parsearDia(String texto) {
        if (texto == null || texto.isBlank()) {
            return LocalDate.now(zona);
        }
        try {
            return LocalDate.parse(texto.trim().substring(0, 10));
        } catch (RuntimeException e) {
            throw new ExcepcionNegocio("La fecha de consulta debe tener el formato AAAA-MM-DD");
        }
    }

    private String generarCodigoUnico() {
        for (int intento = 0; intento < 12; intento++) {
            String codigo = generarCodigo();
            Optional<Reserva> existente = repositorioReserva.buscarPorCodigo(codigo);
            if (existente.isEmpty()) {
                return codigo;
            }
        }
        return generarCodigo();
    }

    private String generarCodigo() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(CODIGO_ALFABETO.charAt(ALEATORIO.nextInt(CODIGO_ALFABETO.length())));
        }
        return sb.toString();
    }
}
