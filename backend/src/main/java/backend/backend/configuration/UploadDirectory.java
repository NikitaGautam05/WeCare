package backend.backend.configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public final class UploadDirectory {

    private static final String UPLOADS_FOLDER = "uploads";

    private UploadDirectory() {
        // Utility class
    }

    public static Path resolveUploadsDir() {
        Path currentUploads = Paths.get(System.getProperty("user.dir"), UPLOADS_FOLDER).toAbsolutePath().normalize();
        if (Files.exists(currentUploads)) {
            return currentUploads;
        }

        Path backendUploads = Paths.get(System.getProperty("user.dir"), "backend", UPLOADS_FOLDER).toAbsolutePath().normalize();
        if (Files.exists(backendUploads)) {
            return backendUploads;
        }

        return currentUploads;
    }

    public static Path getOrCreateUploadsDir() throws IOException {
        Path uploadsDir = resolveUploadsDir();
        if (Files.notExists(uploadsDir)) {
            Files.createDirectories(uploadsDir);
        }
        return uploadsDir;
    }
}
