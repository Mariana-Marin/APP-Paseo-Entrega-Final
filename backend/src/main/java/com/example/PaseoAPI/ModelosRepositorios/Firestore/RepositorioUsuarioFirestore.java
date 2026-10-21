package com.example.PaseoAPI.ModelosRepositorios.Firestore;

import com.example.PaseoAPI.Modelos.Usuario;
import com.example.PaseoAPI.ModelosRepositorios.iRepositorioUsuario;
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

/** Persistencia de usuarios en Cloud Firestore (colección {@code usuarios}). */
@Repository
@ConditionalOnBean(Firestore.class)
public class RepositorioUsuarioFirestore implements iRepositorioUsuario {

    private static final String COLECCION = "usuarios";
    private final Firestore db;

    public RepositorioUsuarioFirestore(Firestore db) {
        this.db = db;
    }

    @Override
    public List<Usuario> listar() {
        try {
            List<Usuario> lista = new ArrayList<>();
            for (QueryDocumentSnapshot doc : db.collection(COLECCION).get().get().getDocuments()) {
                lista.add(doc.toObject(Usuario.class));
            }
            lista.sort(Comparator.comparing(Usuario::getCreadoEn, Comparator.nullsLast(Comparator.naturalOrder())));
            return lista;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al listar usuarios en Firestore", e);
        }
    }

    @Override
    public Optional<Usuario> buscarPorId(String id) {
        try {
            DocumentSnapshot doc = db.collection(COLECCION).document(id).get().get();
            return doc.exists() ? Optional.ofNullable(doc.toObject(Usuario.class)) : Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al buscar el usuario en Firestore", e);
        }
    }

    @Override
    public Optional<Usuario> buscarPorCorreo(String correo) {
        if (correo == null) {
            return Optional.empty();
        }
        try {
            // Firestore distingue mayúsculas; guardamos y consultamos en minúsculas.
            List<QueryDocumentSnapshot> docs = db.collection(COLECCION)
                    .whereEqualTo("correo", correo.toLowerCase()).limit(1).get().get().getDocuments();
            if (docs.isEmpty()) {
                return Optional.empty();
            }
            return Optional.ofNullable(docs.get(0).toObject(Usuario.class));
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al buscar usuario por correo en Firestore", e);
        }
    }

    @Override
    public Usuario guardar(Usuario usuario) {
        try {
            if (usuario.getId() == null || usuario.getId().isBlank()) {
                usuario.setId(UUID.randomUUID().toString());
            }
            DocumentReference ref = db.collection(COLECCION).document(usuario.getId());
            ref.set(usuario).get();
            return usuario;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al guardar el usuario en Firestore", e);
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
            throw new RuntimeException("Error al eliminar el usuario en Firestore", e);
        }
    }
}
