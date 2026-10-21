package com.example.PaseoAPI.ModelosRepositorios.Memoria;

import com.example.PaseoAPI.Configuracion.CondicionMemoria;
import com.example.PaseoAPI.Modelos.Usuario;
import com.example.PaseoAPI.ModelosRepositorios.iRepositorioUsuario;
import org.springframework.context.annotation.Conditional;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/** Implementación en memoria para usuarios (fallback sin Firestore). */
@Repository
@Conditional(CondicionMemoria.class)
public class RepositorioUsuarioMemoria implements iRepositorioUsuario {

    private final Map<String, Usuario> datos = new ConcurrentHashMap<>();

    @Override
    public List<Usuario> listar() {
        List<Usuario> lista = new ArrayList<>(datos.values());
        lista.sort(Comparator.comparing(Usuario::getCreadoEn, Comparator.nullsLast(Comparator.naturalOrder())));
        return lista;
    }

    @Override
    public Optional<Usuario> buscarPorId(String id) {
        return Optional.ofNullable(datos.get(id));
    }

    @Override
    public Optional<Usuario> buscarPorCorreo(String correo) {
        if (correo == null) {
            return Optional.empty();
        }
        return datos.values().stream()
                .filter(u -> correo.equalsIgnoreCase(u.getCorreo()))
                .findFirst();
    }

    @Override
    public Usuario guardar(Usuario usuario) {
        if (usuario.getId() == null || usuario.getId().isBlank()) {
            usuario.setId(UUID.randomUUID().toString());
        }
        datos.put(usuario.getId(), usuario);
        return usuario;
    }

    @Override
    public boolean eliminar(String id) {
        return datos.remove(id) != null;
    }
}
