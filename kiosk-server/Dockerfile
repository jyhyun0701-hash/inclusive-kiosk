FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app
COPY . .
RUN ls -la /app/
RUN ls -la /app/src/ 2>/dev/null || echo "NO SRC DIRECTORY FOUND"
RUN chmod +x gradlew
RUN ./gradlew bootJar -x test

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]