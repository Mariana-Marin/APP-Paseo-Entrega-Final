package com.example.PaseoAPI.ModelosRepositorios;

import com.example.PaseoAPI.Modelos.Reserva;

import java.util.List;
import java.util.Optional;

/** Operaciones de persistencia para reservas (independiente del motor). */
public interface iRepositorioReserva {

    List<Reserva> listar();

    List<Reserva> listarPorEspacio(String espacioId);

    List<Reserva> listarPorUsuario(String usuarioId);

    Optional<Reserva> buscarPorId(String id);

    Optional<Reserva> buscarPorCodigo(String codigoAcceso);

    Reserva guardar(Reserva reserva);

    boolean eliminar(String id);
}
