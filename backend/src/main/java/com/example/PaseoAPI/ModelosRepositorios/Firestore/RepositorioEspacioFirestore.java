package com.example.PaseoAPI.ModelosRepositorios.Firestore;

import com.example.PaseoAPI.Modelos.Espacio;
import com.example.PaseoAPI.ModelosRepositorios.iRepositorioEspacio;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

/**
 * Persistencia de espacios en Cloud Firestore (colección {@code espacios}).
 * Solo se registra como bean cuando existe un cliente {@link Firestore}.
 */
@Repository
@ConditionalOnBean(Firestore.class)
public class RepositorioEspacioFirestore implements iRepositorioEspacio {

    private static final String COLECCION = "espacios";
    private final Firestore db;

    public RepositorioEspacioFirestore(Firestore db) {
        this.db = db;
    }

    @Override
    public List<Espacio> listar() {
        try {
            List<Espacio> lista = new ArrayList<>();
            for (QueryDocumentSnapshot doc : db.collection(COLECCION).get().get().getDocuments()) {
                lista.add(doc.toObject(Espacio.class));
            }
            lista.sort(Comparator.comparing(Espacio::getNombre, Comparator.nullsLast(String::compareToIgnoreCase)));
            return lista;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al listar espacios en Firestore", e);
        }
    }

    @Override
    public Optional<Espacio> buscarPorId(String id) {
        try {
            DocumentSnapshot doc = db.collection(COLECCION).document(id).get().get();
            return doc.exists() ? Optional.ofNullable(doc.toObject(Espacio.class)) : Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al buscar el espacio en Firestore", e);
        }
    }

    @Override
    public Espacio guardar(Espacio espacio) {
        try {
            if (espacio.getId() == null || espacio.getId().isBlank()) {
                espacio.setId(UUID.randomUUID().toString());
            }
            DocumentReference ref = db.collection(COLECCION).document(espacio.getId());
            ref.set(espacio).get();
            return espacio;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al guardar el espacio en Firestore", e);
        }
    }

    @Override
    public boolean eliminar(String id) {
        try {
            DocumentReference ref = db.collection(COLECCION).document(id);
            if (!ref.get().get().exists()) {
                return false;
            }
            ref.delete().get();
            return true;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al eliminar el espacio en Firestore", e);
        }
    }

    @Override
    public long contar() {
        try {
            return db.collection(COLECCION).get().get().size();
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al contar espacios en Firestore", e);
        }
    }
}
