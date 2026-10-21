package com.example.PaseoAPI.Controladores;

import com.google.cloud.firestore.Firestore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/** Endpoint de salud para comprobar que la API vive y qué almacenamiento usa. */
@RestController
@RequestMapping("/api")
public class EstadoControlador {

    @Autowired(required = false)
    private Firestore firestore;

    @GetMapping({"/estado", "/salud"})
    public Map<String, Object> estado() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("servicio", "Paseo API");
        info.put("estado", "activo");
        info.put("almacenamiento", firestore != null ? "firestore" : "memoria");
        return info;
    }
}
