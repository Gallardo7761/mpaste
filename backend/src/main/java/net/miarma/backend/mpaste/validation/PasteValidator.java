package net.miarma.backend.mpaste.validation;

import net.miarma.backend.mpaste.model.Paste;
import net.miarma.backlib.exception.ValidationException;

public class PasteValidator {
    public static void validate(Paste paste) {
        if (Boolean.TRUE.equals(paste.isRt())) {
            if (paste.getTitle() == null || paste.getTitle().trim().isEmpty()) {
                String uuidStr = paste.getPasteId().toString();
                String shortId = uuidStr.substring(0, 8);
                paste.setTitle("Sesión: " + shortId);
            }
        }

        if (paste.getTitle() == null || paste.getTitle().trim().isEmpty()) {
            throw new ValidationException("title", "The title cannot be empty");
        }

        if (paste.getContent() == null || paste.getContent().trim().isEmpty()) {
            throw new ValidationException("content", "The content cannot be empty");
        }

        if (Boolean.TRUE.equals(paste.isPrivate())) {
            if (paste.getPassword() == null || paste.getPassword().trim().isEmpty()) {
                throw new ValidationException("password", "Private pastes require password");
            }
        }

        if (paste.getTitle() != null && paste.getTitle().length() > 128) {
            throw new ValidationException("title", "Title too long (128 characters max.)");
        }
    }
}
