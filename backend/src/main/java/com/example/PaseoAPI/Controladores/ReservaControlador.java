package com.example.PaseoAPI.Controladores;

import com.example.PaseoAPI.Dto.CheckinEntrada;
import com.example.PaseoAPI.Dto.ReservaEntrada;
import com.example.PaseoAPI.Modelos.Reserva;
import com.example.PaseoAPI.Servicios.ReservaServicio;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Endpoints REST del módulo de Reservas. */
@RestController
@RequestMapping("/api/reservas")
public class ReservaControlador {

    private final ReservaServicio servicio;

    public ReservaControlador(ReservaServicio servicio) {
        this.servicio = servicio;
    }

    /** Lista todas las reservas, o filtra por ?espacioId= o ?usuarioId=. */
    @GetMapping
    public List<Reserva> listar(@RequestParam(required = false) String espacioId,
                                @RequestParam(required = false) String usuarioId) {
        return servicio.listar(espacioId, usuarioId);
    }

    /** Resumen de ocupación de TODAS las zonas en un día (una sola consulta). */
    @GetMapping("/resumen")
    public List<java.util.Map<String, Object>> resumen(@RequestParam(required = false) String fecha) {
        return servicio.resumenDelDia(fecha);
    }

    @GetMapping("/{id}")
    public Reserva obtener(@PathVariable String id) {
        return servicio.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Reserva> registrar(@Valid @RequestBody ReservaEntrada datos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servicio.registrar(datos));
    }

    @PutMapping("/{id}")
    public Reserva actualizar(@PathVariable String id, @Valid @RequestBody ReservaEntrada datos) {
        return servicio.actualizar(id, datos);
    }

    /** Cambia solo el estado: body { "estado": "CONFIRMADA" | "CANCELADA" | "PENDIENTE" }. */
    @PatchMapping("/{id}/estado")
    public Reserva cambiarEstado(@PathVariable String id, @RequestBody Map<String, String> cuerpo) {
        return servicio.cambiarEstado(id, cuerpo.get("estado"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    /** Verificación de un pase en portería: /api/reservas/verificar/{codigo}. */
    @GetMapping("/verificar/{codigo}")
    public Reserva verificar(@PathVariable String codigo) {
        return servicio.verificarPorCodigo(codigo);
    }

    /**
     * Registro de ingreso de una persona a la unidad (check-in por QR):
     * POST /api/reservas/checkin/{codigo} con { nombre, cedula }.
     * Disminuye el cupo y, al completarse, emite el código de verificación.
     */
    @PostMapping("/checkin/{codigo}")
    public Reserva checkin(@PathVariable String codigo, @Valid @RequestBody CheckinEntrada datos) {
        return servicio.registrarIngreso(codigo, datos.getNombre(), datos.getCedula());
    }
}
