package backend.backend.configuration;

import java.io.IOException;
import java.nio.file.Path;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            Path uploadsDir = UploadDirectory.getOrCreateUploadsDir();
            String fileUri = uploadsDir.toUri().toString();

            System.out.println("📁 WebConfig: Serving uploads from: " + fileUri);

            registry.addResourceHandler("/uploads/**", "/api/uploads/**")
                    .addResourceLocations(fileUri)
                    .setCachePeriod(3600);
        } catch (IOException e) {
            System.err.println("Failed to initialize upload resource handler: " + e.getMessage());
            e.printStackTrace();
        }
    }
}


