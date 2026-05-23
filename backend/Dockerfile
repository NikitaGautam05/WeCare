FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY src/ src/
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && chmod 755 /app/uploads

EXPOSE 8080

# Set environment variable for uploads directory
ENV UPLOADS_DIR=/app/uploads

CMD ["java", "-jar", "app.jar"]