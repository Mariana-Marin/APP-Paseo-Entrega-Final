package com.example.PaseoAPI.ModelosRepositorios.Memoria;

import com.example.PaseoAPI.Configuracion.CondicionMemoria;
import com.example.PaseoAPI.Modelos.Espacio;
import com.example.PaseoAPI.ModelosRepositorios.iRepositorioEspacio;
import org.springframework.context.annotation.Conditional;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementación en memoria para espacios. Se activa únicamente cuando NO hay
 * un cliente de Firestore disponible (ver {@code ConfiguracionFirebase}).
 */
@Repository
@Conditional(CondicionMemoria.class)
public class RepositorioEspacioMemoria implements iRepositorioEspacio {

    private final Map<String, Espacio> datos = new ConcurrentHashMap<>();

    @Override
    public List<Espacio> listar() {
        List<Espacio> lista = new ArrayList<>(datos.values());
        lista.sort(Comparator.comparing(Espacio::getNombre, Comparator.nullsLast(String::compareToIgnoreCase)));
        return lista;
    }

    @Override
    public Optional<Espacio> buscarPorId(String id) {
        return Optional.ofNullable(datos.get(id));
    }

    @Override
    public Espacio guardar(Espacio espacio) {
        if (espacio.getId() == null || espacio.getId().isBlank()) {
            espacio.setId(UUID.randomUUID().toString());
        }
        datos.put(espacio.getId(), espacio);
        return espacio;
    }

    @Override
    public boolean eliminar(String id) {
        return datos.remove(id) != null;
    }

    @Override
    public long contar() {
        return datos.size();
    }
}
