# ===== Etapa 1: compilar el .jar con Maven =====
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Primero solo el pom.xml para aprovechar la caché de dependencias
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

COPY src ./src
RUN mvn -q -B package -DskipTests

# ===== Etapa 2: imagen liviana solo con Java para ejecutar =====
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/biblioteca-backend-1.0.0.jar app.jar

# Ajustes para que Spring Boot quepa cómodo en 512 MB de RAM (plan gratis de Render)
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC -Xss512k -XX:TieredStopAtLevel=1 -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
