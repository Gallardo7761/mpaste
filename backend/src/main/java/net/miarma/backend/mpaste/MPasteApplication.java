package net.miarma.backend.mpaste;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {
        "net.miarma.backend.mpaste",
        "net.miarma.backlib"
})
public class MPasteApplication {
    public static void main(String[] args) {
        SpringApplication.run(MPasteApplication.class, args);
    }
}

