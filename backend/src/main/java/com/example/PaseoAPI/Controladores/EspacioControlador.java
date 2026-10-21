package com.example.PaseoAPI.Controladores;

import com.example.PaseoAPI.Dto.DisponibilidadSalida;
import com.example.PaseoAPI.Dto.EspacioEntrada;
import com.example.PaseoAPI.Modelos.Espacio;
import com.example.PaseoAPI.Servicios.EspacioServicio;
import com.example.PaseoAPI.Servicios.ReservaServicio;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Endpoints REST del módulo de Espacios. */
@RestController
@RequestMapping("/api/espacios")
public class EspacioControlador {

    private final EspacioServicio servicio;
    private final ReservaServicio reservaServicio;

    public EspacioControlador(EspacioServicio servicio, ReservaServicio reservaServicio) {
        this.servicio = servicio;
        this.reservaServicio = reservaServicio;
    }

    @GetMapping
    public List<Espacio> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public Espacio obtener(@PathVariable String id) {
        return servicio.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Espacio> registrar(@Valid @RequestBody EspacioEntrada datos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servicio.registrar(datos));
    }

    @PutMapping("/{id}")
    public Espacio actualizar(@PathVariable String id, @Valid @RequestBody EspacioEntrada datos) {
        return servicio.actualizar(id, datos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    /** Disponibilidad del espacio en un día: /api/espacios/{id}/disponibilidad?fecha=2026-11-20 */
    @GetMapping("/{id}/disponibilidad")
    public DisponibilidadSalida disponibilidad(@PathVariable String id,
                                               @RequestParam(required = false) String fecha) {
        return reservaServicio.disponibilidad(id, fecha);
    }
}
