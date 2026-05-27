package backend.backend.service;

import java.util.Base64;

import org.springframework.web.multipart.MultipartFile;

public class Base64Utils {
    
    /**
     * Convert MultipartFile to Base64 encoded string
     */
    public static String encodeFileToBase64(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            return null;
        }
        byte[] fileBytes = file.getBytes();
        return Base64.getEncoder().encodeToString(fileBytes);
    }
    
    /**
     * Convert Base64 string to byte array
     */
    public static byte[] decodeBase64ToBytes(String base64String) {
        if (base64String == null || base64String.isEmpty()) {
            return null;
        }
        return Base64.getDecoder().decode(base64String);
    }
    
    /**
     * Create a data URI from Base64 string for direct use in HTML img tags
     */
    public static String createDataURI(String base64String, String mimeType) {
        if (base64String == null || base64String.isEmpty()) {
            return null;
        }
        return "data:" + mimeType + ";base64," + base64String;
    }
}
