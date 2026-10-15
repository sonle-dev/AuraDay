# Stage 1: Build Spring Boot JAR
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon || true
COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# Stage 2: Production JRE
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN apk add --no-cache curl tzdata
ENV TZ=Asia/Ho_Chi_Minh

# Create dedicated non-root user
RUN addgroup -S auragroup && adduser -S aurauser -G auragroup
RUN mkdir -p /app/uploads/proofs /app/uploads/avatars && chown -R aurauser:auragroup /app

# Copy built JAR from builder
COPY --from=builder /app/build/libs/*.jar app.jar
USER aurauser

EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
