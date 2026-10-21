package com.example.PaseoAPI.Configuracion;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Habilita CORS para que el frontend de React (local, vista previa y
 * GitHub Pages) pueda consumir la API desde el navegador.
 */
@Configuration
public class ConfiguracionCors implements WebMvcConfigurer {

    private final PropiedadesPaseo propiedades;

    public ConfiguracionCors(PropiedadesPaseo propiedades) {
        this.propiedades = propiedades;
    }

    @Override
    public void addCorsMappings(CorsRegistry registro) {
        registro.addMapping("/api/**")
                .allowedOrigins(propiedades.getCors().comoLista())
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}
