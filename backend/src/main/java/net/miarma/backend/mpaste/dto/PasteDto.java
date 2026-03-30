package net.miarma.backend.mpaste.dto;

import java.time.Instant;
import java.util.UUID;

public class PasteDto {

    private PasteDto() { }

    public static class Request {

        private String pasteKey;
        private String title;
        private String content;
        private String syntax;

        private Boolean burnAfter;
        private Boolean isPrivate;
        private Boolean isRt;
        private String password;

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

        public Boolean getIsBurnAfter() {
            return burnAfter;
        }

        public void setBurnAfter(Boolean burnAfter) {
            this.burnAfter = burnAfter;
        }

        public Boolean getIsPrivate() {
            return isPrivate;
        }

        public void setIsPrivate(Boolean isPrivate) {
            this.isPrivate = isPrivate;
        }

        public Boolean getIsRt() {
            return isRt;
        }

        public void setIsRt(Boolean rt) {
            isRt = rt;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class Response {

        private UUID pasteId;
        private String pasteKey;

        private String title;
        private String content;
        private String syntax;

        private Integer views;

        private Boolean burnAfter;
        private Boolean isPrivate;
        private Boolean isRt;

        private Instant createdAt;

        public UUID getPasteId() {
            return pasteId;
        }

        public void setPasteId(UUID pasteId) {
            this.pasteId = pasteId;
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

        public Boolean getIsBurnAfter() {
            return burnAfter;
        }

        public void setIsBurnAfter(Boolean burnAfter) {
            this.burnAfter = burnAfter;
        }

        public Boolean getIsPrivate() {
            return isPrivate;
        }

        public void setIsPrivate(Boolean isPrivate) {
            this.isPrivate = isPrivate;
        }

        public Boolean getIsRt() {
            return isRt;
        }

        public void setIsRt(Boolean rt) {
            isRt = rt;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Instant createdAt) {
            this.createdAt = createdAt;
        }
    }
}