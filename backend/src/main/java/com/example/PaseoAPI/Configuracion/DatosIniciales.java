package com.example.PaseoAPI.Configuracion;

import com.example.PaseoAPI.Dto.EspacioEntrada;
import com.example.PaseoAPI.Dto.UsuarioEntrada;
import com.example.PaseoAPI.ModelosRepositorios.iRepositorioEspacio;
import com.example.PaseoAPI.ModelosRepositorios.iRepositorioUsuario;
import com.example.PaseoAPI.Servicios.EspacioServicio;
import com.example.PaseoAPI.Servicios.UsuarioServicio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Crea las zonas comunes típicas de Paseo de San Francisco y un usuario
 * administrador de ejemplo la primera vez que arranca con la base vacía.
 * Así la app nunca se ve "en blanco" durante una demostración.
 */
@Component
public class DatosIniciales implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatosIniciales.class);

    private final PropiedadesPaseo propiedades;
    private final EspacioServicio espacioServicio;
    private final UsuarioServicio usuarioServicio;
    private final iRepositorioEspacio repositorioEspacio;
    private final iRepositorioUsuario repositorioUsuario;

    public DatosIniciales(PropiedadesPaseo propiedades,
                          EspacioServicio espacioServicio,
                          UsuarioServicio usuarioServicio,
                          iRepositorioEspacio repositorioEspacio,
                          iRepositorioUsuario repositorioUsuario) {
        this.propiedades = propiedades;
        this.espacioServicio = espacioServicio;
        this.usuarioServicio = usuarioServicio;
        this.repositorioEspacio = repositorioEspacio;
        this.repositorioUsuario = repositorioUsuario;
    }

    @Override
    public void run(String... args) {
        if (!propiedades.isDatosIniciales()) {
            return;
        }
        try {
            sembrarEspacios();
            sembrarAdministrador();
        } catch (RuntimeException e) {
            log.warn("No se pudieron crear los datos iniciales: {}", e.getMessage());
        }
    }

    private void sembrarEspacios() {
        if (repositorioEspacio.contar() > 0) {
            return;
        }
        log.info("Creando zonas comunes de ejemplo para Paseo de San Francisco...");

        crear("Piscina", "Zona húmeda con piscina para adultos y niños, ideal para los fines de semana en familia.",
                "img/piscina.jpg", 40,
                "PISCINA", "Torre central - Terraza nivel 1", 8, 20, true);
        crear("Salón Social", "Espacio para celebraciones, reuniones de copropietarios y eventos familiares con cocina integrada.",
                "img/edificios.jpg", 80,
                "SALON", "Bloque A - Piso 1", 9, 23, false);
        crear("Gimnasio", "Equipos de cardio y fuerza disponibles todos los días para los residentes.",
                "img/gimnasio.jpg", 15,
                "GIMNASIO", "Bloque B - Sótano", 5, 22, false);
        crear("Zona BBQ", "Asadores y mesas al aire libre para tus encuentros al atardecer.",
                "img/aerea.jpg", 30,
                "BBQ", "Terraza jardín norte", 10, 22, true);
        crear("Cancha Múltiple", "Cancha para microfútbol y baloncesto con iluminación nocturna.",
                "img/cancha.jpg", 25,
                "DEPORTIVO", "Zona deportiva exterior", 6, 21, true);
        crear("Coworking", "Sala silenciosa con wifi de alta velocidad para teletrabajo y estudio.",
                "img/piscina-2.jpg", 12,
                "COWORKING", "Bloque A - Piso 2", 7, 20, false);
    }

    private void crear(String nombre, String descripcion, String foto, int aforo,
                       String categoria, String ubicacion, int apertura, int cierre, boolean aireLibre) {
        EspacioEntrada e = new EspacioEntrada();
        e.setNombre(nombre);
        e.setDescripcion(descripcion);
        e.setFoto(foto);
        e.setAforo(aforo);
        e.setCategoria(categoria);
        e.setUbicacion(ubicacion);
        e.setHoraApertura(apertura);
        e.setHoraCierre(cierre);
        e.setAlAireLibre(aireLibre);
        e.setActivo(true);
        espacioServicio.registrar(e);
    }

    private void sembrarAdministrador() {
        if (repositorioUsuario.buscarPorCorreo("admin@paseosanfrancisco.co").isPresent()) {
            return;
        }
        UsuarioEntrada admin = new UsuarioEntrada();
        admin.setNombres("Administración Paseo de San Francisco");
        admin.setCorreo("admin@paseosanfrancisco.co");
        admin.setContrasena("paseo2026");
        admin.setRol("ADMINISTRADOR");
        admin.setApartamento("Portería principal");
        admin.setTelefono("604 000 0000");
        usuarioServicio.registrar(admin);
        log.info("Usuario administrador de ejemplo: admin@paseosanfrancisco.co / paseo2026");
    }
}
