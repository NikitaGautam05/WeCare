package backend.backend.configuration;

import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;

@Configuration
public class GridFsConfig {

    @Autowired
    private MongoDatabaseFactory mongoDatabaseFactory;

    @Bean
    public GridFSBucket gridFSBucket() {
        return GridFSBuckets.create(mongoDatabaseFactory.getMongoDatabase());
    }
}
