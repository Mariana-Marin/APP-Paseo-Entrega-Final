package com.example.PaseoAPI.ModelosRepositorios.Firestore;

import com.example.PaseoAPI.Modelos.Reserva;
import com.example.PaseoAPI.ModelosRepositorios.iRepositorioReserva;
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

/** Persistencia de reservas en Cloud Firestore (colección {@code reservas}). */
@Repository
@ConditionalOnBean(Firestore.class)
public class RepositorioReservaFirestore implements iRepositorioReserva {

    private static final String COLECCION = "reservas";
    private final Firestore db;

    public RepositorioReservaFirestore(Firestore db) {
        this.db = db;
    }

    private List<Reserva> consultar(com.google.cloud.firestore.Query consulta) {
        try {
            List<Reserva> lista = new ArrayList<>();
            for (QueryDocumentSnapshot doc : consulta.get().get().getDocuments()) {
                lista.add(doc.toObject(Reserva.class));
            }
            lista.sort(Comparator.comparing(Reserva::getFecha, Comparator.nullsLast(Comparator.naturalOrder())));
            return lista;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al consultar reservas en Firestore", e);
        }
    }

    @Override
    public List<Reserva> listar() {
        return consultar(db.collection(COLECCION));
    }

    @Override
    public List<Reserva> listarPorEspacio(String espacioId) {
        return consultar(db.collection(COLECCION).whereEqualTo("espacioId", espacioId));
    }

    @Override
    public List<Reserva> listarPorUsuario(String usuarioId) {
        return consultar(db.collection(COLECCION).whereEqualTo("usuarioId", usuarioId));
    }

    @Override
    public Optional<Reserva> buscarPorId(String id) {
        try {
            DocumentSnapshot doc = db.collection(COLECCION).document(id).get().get();
            return doc.exists() ? Optional.ofNullable(doc.toObject(Reserva.class)) : Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al buscar la reserva en Firestore", e);
        }
    }

    @Override
    public Optional<Reserva> buscarPorCodigo(String codigoAcceso) {
        if (codigoAcceso == null) {
            return Optional.empty();
        }
        try {
            List<QueryDocumentSnapshot> docs = db.collection(COLECCION)
                    .whereEqualTo("codigoAcceso", codigoAcceso.toUpperCase()).limit(1).get().get().getDocuments();
            if (docs.isEmpty()) {
                return Optional.empty();
            }
            return Optional.ofNullable(docs.get(0).toObject(Reserva.class));
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al buscar la reserva por código en Firestore", e);
        }
    }

    @Override
    public Reserva guardar(Reserva reserva) {
        try {
            if (reserva.getId() == null || reserva.getId().isBlank()) {
                reserva.setId(UUID.randomUUID().toString());
            }
            DocumentReference ref = db.collection(COLECCION).document(reserva.getId());
            ref.set(reserva).get();
            return reserva;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al guardar la reserva en Firestore", e);
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
            throw new RuntimeException("Error al eliminar la reserva en Firestore", e);
        }
    }
}
