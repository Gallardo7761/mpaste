package net.miarma.backend.mpaste.service;

import jakarta.transaction.Transactional;
import net.miarma.backend.mpaste.model.Paste;
import net.miarma.backend.mpaste.repository.PasteRepository;
import net.miarma.backend.mpaste.util.PasteKeyGenerator;
import net.miarma.backend.mpaste.validation.PasteValidator;
import net.miarma.backlib.exception.ForbiddenException;
import net.miarma.backlib.exception.NotFoundException;
import net.miarma.backlib.util.UuidUtil;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PasteService {
    private final PasteRepository pasteRepository;
    private final PasswordEncoder passwordEncoder;
    private final TaskScheduler taskScheduler;

    public PasteService(PasteRepository pasteRepository, PasswordEncoder passwordEncoder, TaskScheduler taskScheduler) {
        this.pasteRepository = pasteRepository;
        this.passwordEncoder = passwordEncoder;
        this.taskScheduler = taskScheduler;
    }

    public List<Paste> getAll() {
        return pasteRepository.findAll().stream()
                .filter(p -> !Boolean.TRUE.equals(p.isPrivate()))
                .filter(p -> !Boolean.TRUE.equals(p.isRt()))
                .toList();
    }

    public Paste getById(UUID pasteId) {
        byte[] idBytes = UuidUtil.uuidToBin(pasteId);
        return pasteRepository.findById(idBytes)
                .orElseThrow(() -> new NotFoundException("Paste not found"));
    }

    public Paste getByKey(String pasteKey, String password) {
        Paste paste = pasteRepository.findByPasteKey(pasteKey)
                .orElseThrow(() -> new NotFoundException("Paste not found"));

        if(Boolean.TRUE.equals(paste.isPrivate())) {
            if(password == null || !passwordEncoder.matches(password, paste.getPassword())) {
                throw new ForbiddenException("Incorrect password");
            }
        }

        if(Boolean.TRUE.equals(paste.isBurnAfter())) {
            taskScheduler.schedule(
                    () -> pasteRepository.delete(paste),
                    Instant.now().plusSeconds(5)
            );
        }

        return paste;
    }

    public Paste create(Paste paste) {
        PasteValidator.validate(paste);

        return pasteRepository.findByPasteKey(paste.getPasteKey())
                .map(existing -> {
                    existing.setContent(paste.getContent());
                    existing.setSyntax(paste.getSyntax());
                    existing.setTitle(paste.getTitle());
                    return pasteRepository.save(existing);
                })
                .orElseGet(() -> {
                    if (Boolean.TRUE.equals(paste.isPrivate()) && paste.getPassword() != null) {
                        paste.setPassword(passwordEncoder.encode(paste.getPassword()));
                    }

                    paste.setPasteId(UUID.randomUUID());

                    if (paste.getPasteKey() == null || paste.getPasteKey().isEmpty()) {
                        paste.setPasteKey(PasteKeyGenerator.generate(6));
                    }

                    return pasteRepository.save(paste);
                });
    }

    public Paste update(UUID pasteId, Paste changes) {
        throw new UnsupportedOperationException("Pastes cannot be updated");
    }

    public Paste delete(UUID pasteId) {
        byte[] idBytes = UuidUtil.uuidToBin(pasteId);
        if(!pasteRepository.existsById(idBytes)) {
            throw new NotFoundException("Paste not found");
        }
        Paste paste = getById(pasteId);
        pasteRepository.deleteById(idBytes);
        return paste;
    }
}
