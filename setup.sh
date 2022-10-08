#!/bin/bash

# STDERR log function
err() {
    echo -e "\n[$(date +'%Y-%m-%dT%H:%M:%S%z')]: $@\n" >&2
    exit 1
}

# STDOUT log function
log() {
    echo -e "\n[$(date +'%Y-%m-%dT%H:%M:%S%z')]: $@\n"
}

# Check if Docker is installed
if ! type "docker" > /dev/null 2>&1; then
    err "⛔️ Docker not installed"
fi

# Check if Docker-compose is installed
if ! type "docker-compose" > /dev/null 2>&1; then
    err "⛔️ Docker-Compose not installed"
fi
log "🍀 docker and docker-compose are installed, everything looks good."

log "↪ Copying .env.example -> .env"
cp .env.example .env
if [ $? -ne 0 ]; then
    err "⛔️ Error while copying .env"
fi

log "🐋 Starting docker-compose stack if not already started.."
docker-compose up -d
if [ $? -ne 0 ]; then
    err "⛔️ Error while starting docker-compose stack."
fi

log "👐 Create schemas: npm run schema:sync"
docker exec -it app_server npm run schema:sync
if [ $? -ne 0 ]; then
    err "⛔️ Schemas failed."
fi

log "🐝 Run migrations: npm run apply:migration"
docker exec -it app_server npm run apply:migration
if [ $? -ne 0 ]; then
    err "⛔️ Migrations failed."
fi
