FROM postgres:16-alpine
WORKDIR /usr/src/app

ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=safar_pgsql
ENV POSTGRES_DB=safar_db

ENV DATABASE_HOST=database
ENV DATABASE_PORT=5432

COPY init.sql /docker-entrypoint-initdb.d/
