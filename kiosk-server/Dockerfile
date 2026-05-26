FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app
COPY . .
RUN chmod +x gradlew
RUN ./gradlew bootJar -x test
ENTRYPOINT ["java", "-jar", "build/libs/kiosk-server-0.0.1-SNAPSHOT.jar"]