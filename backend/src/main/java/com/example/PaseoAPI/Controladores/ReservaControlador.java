package com.example.PaseoAPI.Controladores;

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
}
