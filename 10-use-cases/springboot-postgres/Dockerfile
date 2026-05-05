# Multi-stage build for Spring Boot

# Stage 1: Build with Maven
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B
# Copy source and build
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Run with minimal JRE
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copy the built JAR from build stage
COPY --from=build /app/target/*.jar app.jar
# Expose application port
EXPOSE 8080
# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
