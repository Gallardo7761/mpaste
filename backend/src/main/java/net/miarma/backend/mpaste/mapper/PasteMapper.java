package net.miarma.backend.mpaste.mapper;

import net.miarma.backend.mpaste.dto.PasteDto;
import net.miarma.backend.mpaste.model.Paste;

import java.time.Instant;

public final class PasteMapper {

    private PasteMapper() { }

    public static Paste toEntity(PasteDto.Request request) {

        Paste paste = new Paste();

        paste.setTitle(request.getTitle());
        paste.setContent(request.getContent());
        paste.setSyntax(request.getSyntax());
        paste.setPasteKey(request.getPasteKey());

        paste.setBurnAfter(Boolean.TRUE.equals(request.getIsBurnAfter()));
        paste.setPrivate(Boolean.TRUE.equals(request.getIsPrivate()));
        paste.setRt(Boolean.TRUE.equals(request.getIsRt()));

        paste.setPassword(request.getPassword());

        paste.setViews(0);
        paste.setCreatedAt(Instant.now());

        return paste;
    }

    public static PasteDto.Response toResponse(Paste paste) {

        PasteDto.Response response = new PasteDto.Response();

        response.setPasteId(paste.getPasteId());
        response.setPasteKey(paste.getPasteKey());

        response.setTitle(paste.getTitle());
        response.setContent(paste.getContent());
        response.setSyntax(paste.getSyntax());

        response.setViews(paste.getViews());

        response.setIsBurnAfter(paste.isBurnAfter());
        response.setIsPrivate(paste.isPrivate());
        response.setIsRt(paste.isRt());

        response.setCreatedAt(paste.getCreatedAt());

        return response;
    }
}