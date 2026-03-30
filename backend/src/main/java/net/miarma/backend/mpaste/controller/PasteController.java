package net.miarma.backend.mpaste.controller;

import net.miarma.backend.mpaste.dto.PasteDto;
import net.miarma.backend.mpaste.mapper.PasteMapper;
import net.miarma.backend.mpaste.service.PasteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/pastes")
public class PasteController {
    private PasteService pasteService;

    public PasteController(PasteService pasteService) {
        this.pasteService = pasteService;
    }

    @GetMapping
    public ResponseEntity<List<PasteDto.Response>> getAll() {
        return ResponseEntity.ok(
            pasteService.getAll().stream()
                .map(PasteMapper::toResponse)
                .toList()
        );
    }

    @GetMapping("/by-id/{paste_id}")
    public ResponseEntity<PasteDto.Response> getById(@PathVariable("paste_id") UUID pasteId) {
        return ResponseEntity.ok(
            PasteMapper.toResponse(pasteService.getById(pasteId))
        );
    }

    @GetMapping("/s/{paste_key}")
    public ResponseEntity<PasteDto.Response> getByKey(
            @PathVariable("paste_key") String pasteKey,
            @RequestHeader(value = "X-Paste-Password", required = false) String password
    ) {
        return ResponseEntity.ok(
                PasteMapper.toResponse(pasteService.getByKey(pasteKey, password))
        );
    }

    @PostMapping
    public ResponseEntity<PasteDto.Response> create(@RequestBody PasteDto.Request request) {
        return ResponseEntity.ok(
            PasteMapper.toResponse(
                pasteService.create(
                    PasteMapper.toEntity(request)
                )
            )
        );
    }

    @PutMapping("/{paste_id}")
    public void update() {
        throw new UnsupportedOperationException("Pastes cannot be updated");
    }

    @DeleteMapping("/{paste_id}")
    public ResponseEntity<PasteDto.Response> delete(@PathVariable("paste_id") UUID pasteId) {
        throw new UnsupportedOperationException("Pastes cannot be deleted manually");
    }
}
