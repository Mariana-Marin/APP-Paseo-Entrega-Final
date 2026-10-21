package com.example.PaseoAPI.Configuracion;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

/**
 * Crea el cliente de Cloud Firestore SOLO cuando {@link CondicionFirestore}
 * determina que hay credenciales (o el emulador) y el modo lo permite. Si la
 * condición no se cumple, este bean no existe y la aplicación cae a los
 * repositorios en memoria.
 *
 * Las credenciales se resuelven en este orden:
 * <ol>
 *   <li>{@code FIREBASE_CREDENCIALES_BASE64} (JSON en Base64, ideal para la nube).</li>
 *   <li>Archivo apuntado por {@code paseo.firebase.credenciales}.</li>
 *   <li>Credenciales por defecto del entorno (GOOGLE_APPLICATION_CREDENTIALS).</li>
 *   <li>Emulador si está definido {@code FIRESTORE_EMULATOR_HOST}.</li>
 * </ol>
 */
@Configuration
public class ConfiguracionFirebase {

    private static final Logger log = LoggerFactory.getLogger(ConfiguracionFirebase.class);

    @Bean
    @Conditional(CondicionFirestore.class)
    public Firestore firestore(PropiedadesPaseo propiedades) {
        FirebaseApp app = inicializarFirebase(propiedades);
        Firestore db = FirestoreClient.getFirestore(app);
        log.info("Conectado a Cloud Firestore (proyecto '{}').", propiedades.getFirebase().getProyectoId());
        return db;
    }

    private FirebaseApp inicializarFirebase(PropiedadesPaseo propiedades) {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }

        String proyectoId = propiedades.getFirebase().getProyectoId();
        GoogleCredentials credenciales = resolverCredenciales(propiedades);
        boolean hayEmulador = System.getenv("FIRESTORE_EMULATOR_HOST") != null;

        FirebaseOptions.Builder opciones = FirebaseOptions.builder();
        if (proyectoId != null && !proyectoId.isBlank()) {
            opciones.setProjectId(proyectoId);
        }
        // El emulador no requiere credenciales reales.
        opciones.setCredentials(credenciales != null ? credenciales : GoogleCredentials.newBuilder().build());

        if (hayEmulador) {
            log.info("Usando el emulador de Firestore en {}.", System.getenv("FIRESTORE_EMULATOR_HOST"));
        }

        return FirebaseApp.initializeApp(opciones.build());
    }

    private GoogleCredentials resolverCredenciales(PropiedadesPaseo propiedades) {
        PropiedadesPaseo.Firebase fb = propiedades.getFirebase();

        // 1) JSON en Base64 (variable de entorno, útil para desplegar en la nube).
        if (fb.getCredencialesBase64() != null && !fb.getCredencialesBase64().isBlank()) {
            try {
                byte[] json = Base64.getDecoder().decode(fb.getCredencialesBase64().trim());
                try (InputStream in = new ByteArrayInputStream(json)) {
                    return GoogleCredentials.fromStream(in);
                }
            } catch (Exception e) {
                log.warn("FIREBASE_CREDENCIALES_BASE64 inválido: {}", e.getMessage());
            }
        }

        // 2) Archivo local de la cuenta de servicio.
        if (fb.getCredenciales() != null && !fb.getCredenciales().isBlank()) {
            Path ruta = Path.of(fb.getCredenciales());
            if (Files.exists(ruta)) {
                try (InputStream in = new FileInputStream(ruta.toFile())) {
                    return GoogleCredentials.fromStream(in);
                } catch (Exception e) {
                    log.warn("No se pudo leer el archivo de credenciales '{}': {}", ruta, e.getMessage());
                }
            }
        }

        // 3) Credenciales por defecto del entorno (GOOGLE_APPLICATION_CREDENTIALS, etc.).
        try {
            return GoogleCredentials.getApplicationDefault();
        } catch (Exception ignored) {
            return null;
        }
    }
}
