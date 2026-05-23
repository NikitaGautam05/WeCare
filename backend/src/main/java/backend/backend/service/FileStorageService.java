package backend.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
public class FileStorageService {

    @Autowired
    private GridFsOperations gridFsOperations;

    /**
     * Store file in MongoDB GridFS
     * Returns the file ID (filename for retrieval)
     */
    public String storeFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String filename = System.currentTimeMillis() + "_" + 
                         (originalFilename != null ? originalFilename.replaceAll("\\s+", "_") : "file");
        
        try (InputStream inputStream = file.getInputStream()) {
            gridFsOperations.store(
                inputStream,
                filename,
                file.getContentType()
            );
            return filename;
        }
    }

    /**
     * Retrieve file from MongoDB GridFS
     */
    public InputStream getFile(String filename) throws IOException {
        org.springframework.data.mongodb.gridfs.GridFsResource resource = gridFsOperations.getResource(filename);
        
        if (resource == null || !resource.exists()) {
            return null;
        }
        
        return resource.getInputStream();
    }

    /**
     * Check if file exists
     */
    public boolean fileExists(String filename) {
        org.springframework.data.mongodb.gridfs.GridFsResource resource = gridFsOperations.getResource(filename);
        return resource != null && resource.exists();
    }

    /**
     * Delete file from GridFS
     */
    public void deleteFile(String filename) {
        gridFsOperations.delete(new Query(Criteria.where("filename").is(filename)));
    }

    /**
     * Get file size
     */
    public long getFileSize(String filename) {
        org.springframework.data.mongodb.gridfs.GridFsResource resource = gridFsOperations.getResource(filename);
        if (resource != null && resource.exists()) {
            try {
                return resource.contentLength();
            } catch (IOException e) {
                return 0;
            }
        }
        return 0;
    }

    /**
     * Get file content type
     */
    public String getFileContentType(String filename) {
        org.springframework.data.mongodb.gridfs.GridFsResource resource = gridFsOperations.getResource(filename);
        if (resource != null && resource.exists()) {
            String contentType = resource.getContentType();
            if (contentType != null && !contentType.isEmpty()) {
                return contentType;
            }
        }
        return "application/octet-stream";
    }
}
