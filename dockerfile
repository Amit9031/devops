FROM openjdk:17-jdk-slim AS build

WORKDIR /app

COPY back.java .

RUN javac back.java

FROM openjdk:17-jre-slim

WORKDIR /app

COPY --from=build /app/back.class .

CMD ["java", "back"]
