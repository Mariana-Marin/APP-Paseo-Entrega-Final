package com.example.PaseoAPI.Servicios;

import com.example.PaseoAPI.Dto.LoginEntrada;
import com.example.PaseoAPI.Dto.UsuarioEntrada;
import com.example.PaseoAPI.Dto.UsuarioSalida;
import com.example.PaseoAPI.Excepciones.ExcepcionConflicto;
import com.example.PaseoAPI.Excepciones.ExcepcionNegocio;
import com.example.PaseoAPI.Excepciones.ExcepcionNoEncontrado;
import com.example.PaseoAPI.Modelos.Usuario;
import com.example.PaseoAPI.ModelosRepositorios.iRepositorioUsuario;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

/**
 * Reglas de negocio de usuarios: correo único, contraseña cifrada con BCrypt
 * (nunca se devuelve), roles válidos y autenticación.
 */
@Service
public class UsuarioServicio {

    private static final Set<String> ROLES = Set.of("ADMINISTRADOR", "RESIDENTE");

    private final iRepositorioUsuario repositorio;
    private final BCryptPasswordEncoder cifrador = new BCryptPasswordEncoder();

    public UsuarioServicio(iRepositorioUsuario repositorio) {
        this.repositorio = repositorio;
    }

    public List<UsuarioSalida> listar() {
        return repositorio.listar().stream().map(UsuarioSalida::desde).toList();
    }

    public UsuarioSalida buscarPorId(String id) {
        Usuario u = repositorio.buscarPorId(id)
                .orElseThrow(() -> new ExcepcionNoEncontrado("No existe el usuario solicitado"));
        return UsuarioSalida.desde(u);
    }

    public UsuarioSalida registrar(UsuarioEntrada datos) {
        String correo = normalizarCorreo(datos.getCorreo());
        String rol = normalizarRol(datos.getRol());

        if (repositorio.buscarPorCorreo(correo).isPresent()) {
            throw new ExcepcionConflicto("Ya existe un usuario registrado con ese correo");
        }

        Usuario u = new Usuario();
        u.setNombres(datos.getNombres().trim());
        u.setCorreo(correo);
        u.setContrasena(cifrador.encode(datos.getContrasena()));
        u.setRol(rol);
        u.setApartamento(limpiar(datos.getApartamento()));
        u.setTelefono(limpiar(datos.getTelefono()));
        u.marcarCreacion();

        return UsuarioSalida.desde(repositorio.guardar(u));
    }

    public UsuarioSalida actualizar(String id, UsuarioEntrada datos) {
        Usuario u = repositorio.buscarPorId(id)
                .orElseThrow(() -> new ExcepcionNoEncontrado("No existe el usuario a actualizar"));

        String correo = normalizarCorreo(datos.getCorreo());
        // Si cambia el correo, verificar que no lo tenga otro usuario.
        repositorio.buscarPorCorreo(correo)
                .filter(otro -> !otro.getId().equals(id))
                .ifPresent(otro -> {
                    throw new ExcepcionConflicto("Ese correo ya pertenece a otro usuario");
                });

        u.setNombres(datos.getNombres().trim());
        u.setCorreo(correo);
        u.setRol(normalizarRol(datos.getRol()));
        u.setApartamento(limpiar(datos.getApartamento()));
        u.setTelefono(limpiar(datos.getTelefono()));
        if (datos.getContrasena() != null && !datos.getContrasena().isBlank()) {
            u.setContrasena(cifrador.encode(datos.getContrasena()));
        }
        return UsuarioSalida.desde(repositorio.guardar(u));
    }

    public void eliminar(String id) {
        if (!repositorio.eliminar(id)) {
            throw new ExcepcionNoEncontrado("No existe el usuario a eliminar");
        }
    }

    public UsuarioSalida autenticar(LoginEntrada datos) {
        Usuario u = repositorio.buscarPorCorreo(normalizarCorreo(datos.getCorreo()))
                .orElseThrow(() -> new ExcepcionNegocio("Correo o contraseña incorrectos"));
        if (!cifrador.matches(datos.getContrasena(), u.getContrasena())) {
            throw new ExcepcionNegocio("Correo o contraseña incorrectos");
        }
        return UsuarioSalida.desde(u);
    }

    private String normalizarCorreo(String correo) {
        return correo == null ? "" : correo.trim().toLowerCase();
    }

    private String normalizarRol(String rol) {
        String r = rol == null ? "" : rol.trim().toUpperCase();
        if (!ROLES.contains(r)) {
            throw new ExcepcionNegocio("El rol debe ser ADMINISTRADOR o RESIDENTE");
        }
        return r;
    }

    private String limpiar(String texto) {
        return texto == null ? null : texto.trim();
    }
}
