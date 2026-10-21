package com.example.PaseoAPI.Configuracion;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionOutcome;
import org.springframework.boot.autoconfigure.condition.SpringBootCondition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Decide, en tiempo de arranque, si se debe crear el cliente de Firestore.
 *
 * <p>Esto evita el patrón frágil de un {@code @Bean} que devuelve {@code null}:
 * si la condición no se cumple, el bean {@code Firestore} sencillamente no existe
 * y los repositorios en memoria toman su lugar mediante
 * {@code @ConditionalOnMissingBean(Firestore.class)}.</p>
 *
 * Reglas:
 * <ul>
 *   <li>{@code paseo.almacenamiento=memoria} -> nunca usa Firestore.</li>
 *   <li>{@code paseo.almacenamiento=firestore} -> siempre intenta Firestore.</li>
 *   <li>{@code auto} (por defecto) -> usa Firestore solo si detecta credenciales
 *       (archivo, Base64, credenciales por defecto de Google) o el emulador.</li>
 * </ul>
 */
public class CondicionFirestore extends SpringBootCondition {

    private static final Logger log = LoggerFactory.getLogger(CondicionFirestore.class);

    @Override
    public ConditionOutcome getMatchOutcome(ConditionContext context, AnnotatedTypeMetadata metadata) {
        var env = context.getEnvironment();
        String modo = env.getProperty("paseo.almacenamiento", "auto").trim().toLowerCase();

        if ("memoria".equals(modo)) {
            return ConditionOutcome.noMatch("paseo.almacenamiento=memoria");
        }
        if ("firestore".equals(modo)) {
            return ConditionOutcome.match("paseo.almacenamiento=firestore (forzado)");
        }

        // modo auto: ¿hay forma de autenticarse?
        if (hayCredenciales(env)) {
            return ConditionOutcome.match("auto: se encontraron credenciales de Firebase");
        }
        log.warn("No se encontraron credenciales de Firebase. Se usará almacenamiento en MEMORIA. "
                + "Configura FIREBASE_CREDENCIALES o FIREBASE_CREDENCIALES_BASE64 para persistir en Firestore.");
        return ConditionOutcome.noMatch("auto: sin credenciales de Firebase");
    }

    private boolean hayCredenciales(org.springframework.core.env.Environment env) {
        // 1) Emulador
        if (System.getenv("FIRESTORE_EMULATOR_HOST") != null) {
            return true;
        }
        // 2) JSON en Base64
        String base64 = env.getProperty("paseo.firebase.credenciales-base64", "");
        if (base64 != null && !base64.isBlank()) {
            return true;
        }
        // 3) Archivo local de la cuenta de servicio
        String archivo = env.getProperty("paseo.firebase.credenciales", "");
        if (archivo != null && !archivo.isBlank() && Files.exists(Path.of(archivo))) {
            return true;
        }
        // 4) Credenciales por defecto del entorno
        return System.getenv("GOOGLE_APPLICATION_CREDENTIALS") != null;
    }
}
