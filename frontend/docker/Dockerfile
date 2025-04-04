FROM node:20.12.0-alpine3.19

RUN apk update
RUN apk add nginx gettext git openssh openssl

RUN mkdir -p /run/nginx

COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/entry.sh /usr/local/bin/entry.sh
RUN chmod 0777 /usr/local/bin/entry.sh

COPY ./ /app
WORKDIR /app
RUN rm -rf /app/build

COPY ./docker/build.sh /app/build.sh
RUN chmod 0777 /app/build.sh
RUN sh /app/build.sh
RUN rm /app/build.sh


ENTRYPOINT ["sh", "/usr/local/bin/entry.sh"]
