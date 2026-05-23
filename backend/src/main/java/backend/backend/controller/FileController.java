package backend.backend.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FileController {

    @GetMapping("/uploads/{filename}")
    public ResponseEntity<byte[]> getUploadedFile(@PathVariable String filename) {
        try {
            // Get the uploads directory path
            String uploadsDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator;
            Path filePath = Paths.get(uploadsDir).resolve(filename).normalize();

            // Security check: ensure the resolved path is still within the uploads directory
            Path uploadsPath = Paths.get(uploadsDir).normalize();
            if (!filePath.startsWith(uploadsPath)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Check if file exists
            if (!Files.exists(filePath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            // Read file bytes
            byte[] fileBytes = Files.readAllBytes(filePath);

            // Determine content type based on file extension
            String contentType = determineContentType(filename);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentLength(fileBytes.length);
            headers.setContentDisposition(
                ContentDisposition.inline()
                    .filename(filename)
                    .build()
            );

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileBytes);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String determineContentType(String filename) {
        if (filename.endsWith(".png")) {
            return "image/png";
        } else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (filename.endsWith(".gif")) {
            return "image/gif";
        } else if (filename.endsWith(".pdf")) {
            return "application/pdf";
        }
        return "application/octet-stream";
    }
}
