# Imagen para desplegar el backend en cualquier host de contenedores.
# Etapa 1: compilar el JAR con Gradle y JDK 17.
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY . .
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon

# Etapa 2: imagen ligera solo con el JAR.
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
# El contenedor respeta la variable PORT que inyecte el proveedor.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
