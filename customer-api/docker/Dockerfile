FROM node:20.12.0-alpine3.19

RUN apk add bash curl

COPY "./" "/app"
WORKDIR "/app"

ENTRYPOINT ["bash", "/app/docker/entry.sh"]
