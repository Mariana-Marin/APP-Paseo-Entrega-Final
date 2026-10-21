package com.example.PaseoAPI.Controladores;

import com.example.PaseoAPI.Dto.LoginEntrada;
import com.example.PaseoAPI.Dto.UsuarioEntrada;
import com.example.PaseoAPI.Dto.UsuarioSalida;
import com.example.PaseoAPI.Servicios.UsuarioServicio;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Endpoints REST del módulo de Usuarios. */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioControlador {

    private final UsuarioServicio servicio;

    public UsuarioControlador(UsuarioServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<UsuarioSalida> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public UsuarioSalida obtener(@PathVariable String id) {
        return servicio.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<UsuarioSalida> registrar(@Valid @RequestBody UsuarioEntrada datos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servicio.registrar(datos));
    }

    @PutMapping("/{id}")
    public UsuarioSalida actualizar(@PathVariable String id, @Valid @RequestBody UsuarioEntrada datos) {
        return servicio.actualizar(id, datos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    /** Inicio de sesión: valida correo + contraseña y devuelve el usuario sin la clave. */
    @PostMapping("/login")
    public UsuarioSalida login(@Valid @RequestBody LoginEntrada datos) {
        return servicio.autenticar(datos);
    }
}
