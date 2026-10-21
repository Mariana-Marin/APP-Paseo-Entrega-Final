package com.example.PaseoAPI.Configuracion;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Metadatos de la documentación interactiva (Swagger UI). */
@Configuration
public class ConfiguracionOpenApi {

    @Bean
    public OpenAPI paseoOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("Paseo API")
                .version("1.0.0")
                .description("API de reservas de zonas comunes de la unidad residencial "
                        + "Paseo de San Francisco (Sabaneta, Antioquia). "
                        + "Gestiona usuarios, espacios y reservas sobre Cloud Firestore.")
                .contact(new Contact().name("Equipo Paseo de San Francisco"))
                .license(new License().name("Uso académico")));
    }
}
