package backend.backend.controller;

import backend.backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.InputStream;

@RestController
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/uploads/{filename}")
    public ResponseEntity<byte[]> getUploadedFile(@PathVariable String filename) {
        try {
            // Get file from GridFS
            InputStream inputStream = fileStorageService.getFile(filename);
            
            if (inputStream == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            // Read file bytes
            byte[] fileBytes = inputStream.readAllBytes();
            inputStream.close();

            // Determine content type
            String contentType = fileStorageService.getFileContentType(filename);
            if (contentType == null || contentType.isEmpty()) {
                contentType = determineContentType(filename);
            }

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
