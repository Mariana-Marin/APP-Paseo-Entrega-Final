package com.example.PaseoAPI;

import com.example.PaseoAPI.Dto.EspacioEntrada;
import com.example.PaseoAPI.Dto.ReservaEntrada;
import com.example.PaseoAPI.Dto.UsuarioEntrada;
import com.example.PaseoAPI.Excepciones.ExcepcionConflicto;
import com.example.PaseoAPI.Excepciones.ExcepcionNegocio;
import com.example.PaseoAPI.Modelos.Espacio;
import com.example.PaseoAPI.Dto.UsuarioSalida;
import com.example.PaseoAPI.Servicios.EspacioServicio;
import com.example.PaseoAPI.Servicios.ReservaServicio;
import com.example.PaseoAPI.Servicios.UsuarioServicio;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pruebas de las reglas de negocio usando el almacenamiento en memoria.
 * No requieren Firebase ni red.
 */
@SpringBootTest
@TestPropertySource(properties = {
        "paseo.almacenamiento=memoria",
        "paseo.datos-iniciales=false"
})
class PaseoApiApplicationTests {

    @Autowired
    private UsuarioServicio usuarioServicio;
    @Autowired
    private EspacioServicio espacioServicio;
    @Autowired
    private ReservaServicio reservaServicio;

    @Test
    void contextLoads() {
        assertNotNull(reservaServicio);
    }

    @Test
    void laContrasenaNuncaSeDevuelveYElCorreoEsUnico() {
        UsuarioEntrada u = new UsuarioEntrada();
        u.setNombres("Ana Residente");
        u.setCorreo("Ana@Correo.com");
        u.setContrasena("secreta123");
        u.setRol("RESIDENTE");
        UsuarioSalida guardado = usuarioServicio.registrar(u);

        assertNotNull(guardado.getId());
        assertEquals("ana@correo.com", guardado.getCorreo()); // normalizado a minúsculas

        UsuarioEntrada repetido = new UsuarioEntrada();
        repetido.setNombres("Otra Persona");
        repetido.setCorreo("ana@correo.com");
        repetido.setContrasena("otraclave");
        repetido.setRol("RESIDENTE");
        assertThrows(ExcepcionConflicto.class, () -> usuarioServicio.registrar(repetido));
    }

    @Test
    void noPermiteReservasSolapadasYRespetaAforo() {
        Espacio salon = crearSalon();
        String usuarioId = crearUsuario("carlos@correo.com");

        String manana = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0)
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));

        ReservaEntrada r1 = new ReservaEntrada();
        r1.setEspacioId(salon.getId());
        r1.setUsuarioId(usuarioId);
        r1.setFecha(manana);
        r1.setTiempo(2);
        r1.setPersonas(10);
        assertNotNull(reservaServicio.registrar(r1).getCodigoAcceso());

        // Se solapa (10:00-12:00 vs 11:00-13:00) -> conflicto
        ReservaEntrada r2 = new ReservaEntrada();
        r2.setEspacioId(salon.getId());
        r2.setUsuarioId(usuarioId);
        r2.setFecha(LocalDateTime.now().plusDays(1).withHour(11).withMinute(0)
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm")));
        r2.setTiempo(2);
        r2.setPersonas(5);
        assertThrows(ExcepcionConflicto.class, () -> reservaServicio.registrar(r2));

        // Supera el aforo (20) -> error de negocio
        ReservaEntrada r3 = new ReservaEntrada();
        r3.setEspacioId(salon.getId());
        r3.setUsuarioId(usuarioId);
        r3.setFecha(LocalDateTime.now().plusDays(1).withHour(14).withMinute(0)
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm")));
        r3.setTiempo(1);
        r3.setPersonas(99);
        assertThrows(ExcepcionNegocio.class, () -> reservaServicio.registrar(r3));
    }

    @Test
    void espacioCompartibleAdmiteVariosHastaElAforo() {
        // Gimnasio compartible, aforo 10
        EspacioEntrada e = new EspacioEntrada();
        e.setNombre("Gimnasio de pruebas");
        e.setDescripcion("Espacio compartible de pruebas");
        e.setAforo(10);
        e.setCategoria("GIMNASIO");
        e.setHoraApertura(6);
        e.setHoraCierre(22);
        e.setActivo(true);
        Espacio gim = espacioServicio.registrar(e);
        assertTrue(gim.getCompartible());

        String u1 = crearUsuario("g1@correo.com");
        String u2 = crearUsuario("g2@correo.com");
        String u3 = crearUsuario("g3@correo.com");
        String manana = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0)
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));

        // Dos reservas a la misma hora (6 + 3 = 9 <= 10) deben permitirse
        assertNotNull(reservaServicio.registrar(reserva(gim.getId(), u1, manana, 1, 6)));
        assertNotNull(reservaServicio.registrar(reserva(gim.getId(), u2, manana, 1, 3)));

        // La tercera (9 + 2 = 11 > 10) debe bloquearse por aforo
        assertThrows(ExcepcionConflicto.class,
                () -> reservaServicio.registrar(reserva(gim.getId(), u3, manana, 1, 2)));
    }

    @Test
    void checkinDisminuyeCupoYGeneraVerificacion() {
        Espacio salon = crearSalon();
        String usuarioId = crearUsuario("checkin@correo.com");
        String manana = LocalDateTime.now().plusDays(1).withHour(9).withMinute(0)
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
        var creada = reservaServicio.registrar(reserva(salon.getId(), usuarioId, manana, 2, 2));

        var r1 = reservaServicio.registrarIngreso(creada.getCodigoAcceso(), "Ana Perez", "123456");
        assertEquals(1, r1.getIngresados());
        assertNull(r1.getCodigoVerificacion()); // aún falta una persona

        var r2 = reservaServicio.registrarIngreso(creada.getCodigoAcceso(), "Luis Gomez", "654321");
        assertEquals(2, r2.getIngresados());
        assertNotNull(r2.getCodigoVerificacion()); // completo -> QR 2

        // No se puede ingresar más gente de la reservada
        assertThrows(ExcepcionNegocio.class,
                () -> reservaServicio.registrarIngreso(creada.getCodigoAcceso(), "Otro", "000000"));
    }

    @Test
    void rechazaReservasEnElPasado() {
        Espacio salon = crearSalon();
        String usuarioId = crearUsuario("diana@correo.com");

        ReservaEntrada r = new ReservaEntrada();
        r.setEspacioId(salon.getId());
        r.setUsuarioId(usuarioId);
        r.setFecha(LocalDateTime.now().minusDays(1).withHour(10).withMinute(0)
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm")));
        r.setTiempo(1);
        r.setPersonas(2);
        assertThrows(ExcepcionNegocio.class, () -> reservaServicio.registrar(r));
    }

    private Espacio crearSalon() {
        EspacioEntrada e = new EspacioEntrada();
        e.setNombre("Salón de pruebas");
        e.setDescripcion("Espacio de pruebas automatizadas");
        e.setAforo(20);
        e.setHoraApertura(8);
        e.setHoraCierre(22);
        e.setActivo(true);
        return espacioServicio.registrar(e);
    }

    private String crearUsuario(String correo) {
        UsuarioEntrada u = new UsuarioEntrada();
        u.setNombres("Usuario Prueba");
        u.setCorreo(correo);
        u.setContrasena("clave123");
        u.setRol("RESIDENTE");
        return usuarioServicio.registrar(u).getId();
    }

    private ReservaEntrada reserva(String espacioId, String usuarioId, String fecha, int horas, int personas) {
        ReservaEntrada r = new ReservaEntrada();
        r.setEspacioId(espacioId);
        r.setUsuarioId(usuarioId);
        r.setFecha(fecha);
        r.setTiempo(horas);
        r.setPersonas(personas);
        return r;
    }
}
