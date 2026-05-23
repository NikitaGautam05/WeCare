package backend.backend.service;

import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSUploadStream;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Objects;

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
            com.mongodb.client.gridfs.model.GridFSFile gridFSFile = gridFsOperations.store(
                inputStream,
                filename,
                file.getContentType()
            );
            return gridFSFile.getFilename();
        }
    }

    /**
     * Retrieve file from MongoDB GridFS
     */
    public InputStream getFile(String filename) throws IOException {
        GridFSFile file = gridFsOperations.findOne(new Query(Criteria.where("filename").is(filename)));
        
        if (file == null) {
            return null;
        }
        
        return gridFsOperations.getResource(file).getInputStream();
    }

    /**
     * Check if file exists
     */
    public boolean fileExists(String filename) {
        GridFSFile file = gridFsOperations.findOne(new Query(Criteria.where("filename").is(filename)));
        return file != null;
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
        GridFSFile file = gridFsOperations.findOne(new Query(Criteria.where("filename").is(filename)));
        if (file != null) {
            return file.getLength();
        }
        return 0;
    }

    /**
     * Get file content type
     */
    public String getFileContentType(String filename) {
        GridFSFile file = gridFsOperations.findOne(new Query(Criteria.where("filename").is(filename)));
        if (file != null && file.getMetadata() != null) {
            Object contentType = file.getMetadata().get("_contentType");
            if (contentType != null) {
                return contentType.toString();
            }
        }
        return "application/octet-stream";
    }
}
