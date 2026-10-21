package com.example.PaseoAPI.ModelosRepositorios.Memoria;

import com.example.PaseoAPI.Configuracion.CondicionMemoria;
import com.example.PaseoAPI.Modelos.Reserva;
import com.example.PaseoAPI.ModelosRepositorios.iRepositorioReserva;
import org.springframework.context.annotation.Conditional;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/** Implementación en memoria para reservas (fallback sin Firestore). */
@Repository
@Conditional(CondicionMemoria.class)
public class RepositorioReservaMemoria implements iRepositorioReserva {

    private final Map<String, Reserva> datos = new ConcurrentHashMap<>();

    @Override
    public List<Reserva> listar() {
        List<Reserva> lista = new ArrayList<>(datos.values());
        lista.sort(Comparator.comparing(Reserva::getFecha, Comparator.nullsLast(Comparator.naturalOrder())));
        return lista;
    }

    @Override
    public List<Reserva> listarPorEspacio(String espacioId) {
        return datos.values().stream()
                .filter(r -> espacioId != null && espacioId.equals(r.getEspacioId()))
                .sorted(Comparator.comparing(Reserva::getFecha, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    @Override
    public List<Reserva> listarPorUsuario(String usuarioId) {
        return datos.values().stream()
                .filter(r -> usuarioId != null && usuarioId.equals(r.getUsuarioId()))
                .sorted(Comparator.comparing(Reserva::getFecha, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    @Override
    public Optional<Reserva> buscarPorId(String id) {
        return Optional.ofNullable(datos.get(id));
    }

    @Override
    public Optional<Reserva> buscarPorCodigo(String codigoAcceso) {
        if (codigoAcceso == null) {
            return Optional.empty();
        }
        return datos.values().stream()
                .filter(r -> codigoAcceso.equalsIgnoreCase(r.getCodigoAcceso()))
                .findFirst();
    }

    @Override
    public Reserva guardar(Reserva reserva) {
        if (reserva.getId() == null || reserva.getId().isBlank()) {
            reserva.setId(UUID.randomUUID().toString());
        }
        datos.put(reserva.getId(), reserva);
        return reserva;
    }

    @Override
    public boolean eliminar(String id) {
        return datos.remove(id) != null;
    }
}
