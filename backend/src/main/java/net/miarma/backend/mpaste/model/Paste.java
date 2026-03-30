package net.miarma.backend.mpaste.model;

import jakarta.persistence.*;
import net.miarma.backlib.util.UuidUtil;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "mpaste_pastes")
public class Paste {
    @Id
    @Column(name = "paste_id", columnDefinition = "BINARY(16)")
    private byte[] pasteIdBin;

    @Transient
    private UUID pasteId;

    @Column(name = "owner_id", columnDefinition = "BINARY(16)")
    private byte[] ownerIdBin;

    @Transient
    private UUID ownerId;

    @Column(name = "paste_key", updatable = false, unique = true, nullable = false)
    private String pasteKey;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String content;

    private String syntax;
    private Integer views;

    @Column(name = "burn_after")
    private Boolean burnAfter;

    @Column(name = "is_private")
    private Boolean isPrivate;

    @Column(name = "is_rt")
    private Boolean isRt;

    private String password;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    @PreUpdate
    private void prePersist() {
        if (pasteId != null) {
            pasteIdBin = UuidUtil.uuidToBin(pasteId);
        }

        if (ownerId != null) {
            ownerIdBin = UuidUtil.uuidToBin(ownerId);
        }
    }

    @PostLoad
    private void postLoad() {
        if (pasteIdBin != null) {
            pasteId = UuidUtil.binToUUID(pasteIdBin);
        }

        if (ownerIdBin != null) {
            ownerId = UuidUtil.binToUUID(ownerIdBin);
        }
    }

    public UUID getPasteId() {
        return pasteId;
    }

    public void setPasteId(UUID pasteId) {
        this.pasteId = pasteId;
    }

    public UUID getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(UUID ownerId) {
        this.ownerId = ownerId;
    }

    public String getPasteKey() {
        return pasteKey;
    }

    public void setPasteKey(String pasteKey) {
        this.pasteKey = pasteKey;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSyntax() {
        return syntax;
    }

    public void setSyntax(String syntax) {
        this.syntax = syntax;
    }

    public Integer getViews() {
        return views;
    }

    public void setViews(Integer views) {
        this.views = views;
    }

    public Boolean isBurnAfter() {
        return burnAfter;
    }

    public void setBurnAfter(Boolean burnAfter) {
        this.burnAfter = burnAfter;
    }

    public Boolean isPrivate() {
        return isPrivate;
    }

    public void setPrivate(Boolean isPrivate) {
        this.isPrivate = isPrivate;
    }

    public Boolean isRt() { return isRt; }

    public void setRt(Boolean rt) { isRt = rt; }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
