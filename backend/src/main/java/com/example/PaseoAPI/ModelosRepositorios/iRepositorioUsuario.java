package com.example.PaseoAPI.ModelosRepositorios;

import com.example.PaseoAPI.Modelos.Usuario;

import java.util.List;
import java.util.Optional;

/** Operaciones de persistencia para usuarios (independiente del motor). */
public interface iRepositorioUsuario {

    List<Usuario> listar();

    Optional<Usuario> buscarPorId(String id);

    Optional<Usuario> buscarPorCorreo(String correo);

    Usuario guardar(Usuario usuario);

    boolean eliminar(String id);
}
