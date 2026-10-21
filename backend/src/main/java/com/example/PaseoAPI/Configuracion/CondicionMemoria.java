package com.example.PaseoAPI.Configuracion;

import org.springframework.boot.autoconfigure.condition.ConditionOutcome;
import org.springframework.boot.autoconfigure.condition.SpringBootCondition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

/**
 * Condición opuesta a {@link CondicionFirestore}: se cumple cuando NO se va a
 * usar Firestore, de modo que entren en juego los repositorios en memoria.
 * Usar condiciones espejo (en vez de {@code @ConditionalOnMissingBean}) hace que
 * la elección sea determinista y no dependa del orden de registro de beans.
 */
public class CondicionMemoria extends SpringBootCondition {

    private final CondicionFirestore firestore = new CondicionFirestore();

    @Override
    public ConditionOutcome getMatchOutcome(ConditionContext context, AnnotatedTypeMetadata metadata) {
        ConditionOutcome usarFirestore = firestore.getMatchOutcome(context, metadata);
        if (usarFirestore.isMatch()) {
            return ConditionOutcome.noMatch("Se usará Firestore, no memoria");
        }
        return ConditionOutcome.match("Almacenamiento en memoria activo");
    }
}
