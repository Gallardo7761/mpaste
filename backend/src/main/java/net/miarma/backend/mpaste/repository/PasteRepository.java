package net.miarma.backend.mpaste.repository;

import net.miarma.backend.mpaste.model.Paste;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasteRepository extends JpaRepository<Paste, byte[]> {
    Optional<Paste> findByPasteKey(String pasteKey);
}
