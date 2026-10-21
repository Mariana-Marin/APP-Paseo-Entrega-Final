package com.example.PaseoAPI.ModelosRepositorios;

import com.example.PaseoAPI.Modelos.Espacio;

import java.util.List;
import java.util.Optional;

/** Operaciones de persistencia para espacios (independiente del motor). */
public interface iRepositorioEspacio {

    List<Espacio> listar();

    Optional<Espacio> buscarPorId(String id);

    Espacio guardar(Espacio espacio);

    boolean eliminar(String id);

    long contar();
}
