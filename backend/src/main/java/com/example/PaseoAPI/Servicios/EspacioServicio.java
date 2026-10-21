package com.example.PaseoAPI.Servicios;

import com.example.PaseoAPI.Dto.EspacioEntrada;
import com.example.PaseoAPI.Excepciones.ExcepcionNegocio;
import com.example.PaseoAPI.Excepciones.ExcepcionNoEncontrado;
import com.example.PaseoAPI.Modelos.Espacio;
import com.example.PaseoAPI.ModelosRepositorios.iRepositorioEspacio;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

/**
 * Reglas de negocio de espacios: datos válidos, horario coherente y categorías
 * permitidas. Un espacio inactivo sigue existiendo pero no admite reservas.
 */
@Service
public class EspacioServicio {

    private static final Set<String> CATEGORIAS =
            Set.of("PISCINA", "SALON", "GIMNASIO", "BBQ", "DEPORTIVO", "COWORKING", "OTRO");

    private final iRepositorioEspacio repositorio;

    public EspacioServicio(iRepositorioEspacio repositorio) {
        this.repositorio = repositorio;
    }

    public List<Espacio> listar() {
        return repositorio.listar();
    }

    public Espacio buscarPorId(String id) {
        return repositorio.buscarPorId(id)
                .orElseThrow(() -> new ExcepcionNoEncontrado("No existe el espacio solicitado"));
    }

    public Espacio registrar(EspacioEntrada datos) {
        Espacio e = new Espacio();
        aplicar(e, datos);
        e.marcarCreacion();
        return repositorio.guardar(e);
    }

    public Espacio actualizar(String id, EspacioEntrada datos) {
        Espacio e = repositorio.buscarPorId(id)
                .orElseThrow(() -> new ExcepcionNoEncontrado("No existe el espacio a actualizar"));
        aplicar(e, datos);
        return repositorio.guardar(e);
    }

    public void eliminar(String id) {
        if (!repositorio.eliminar(id)) {
            throw new ExcepcionNoEncontrado("No existe el espacio a eliminar");
        }
    }

    private void aplicar(Espacio e, EspacioEntrada datos) {
        int apertura = datos.getHoraApertura() == null ? 6 : datos.getHoraApertura();
        int cierre = datos.getHoraCierre() == null ? 22 : datos.getHoraCierre();
        if (cierre <= apertura) {
            throw new ExcepcionNegocio("La hora de cierre debe ser mayor que la de apertura");
        }

        e.setNombre(datos.getNombre().trim());
        e.setDescripcion(datos.getDescripcion().trim());
        e.setFoto(datos.getFoto() == null ? null : datos.getFoto().trim());
        e.setAforo(datos.getAforo());
        e.setCategoria(normalizarCategoria(datos.getCategoria()));
        e.setUbicacion(datos.getUbicacion() == null ? null : datos.getUbicacion().trim());
        e.setHoraApertura(apertura);
        e.setHoraCierre(cierre);
        e.setAlAireLibre(datos.getAlAireLibre() != null && datos.getAlAireLibre());
        e.setActivo(datos.getActivo() == null || datos.getActivo());
    }

    private String normalizarCategoria(String categoria) {
        if (categoria == null || categoria.isBlank()) {
            return "OTRO";
        }
        String c = categoria.trim().toUpperCase();
        return CATEGORIAS.contains(c) ? c : "OTRO";
    }
}
