FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app
COPY . .
RUN chmod +x gradlew
RUN ./gradlew bootJar -x test
RUN jar xf /app/build/libs/kiosk-server-0.0.1-SNAPSHOT.jar META-INF/MANIFEST.MF && cat META-INF/MANIFEST.MF

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]