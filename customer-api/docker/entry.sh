#!/bin/bash

cd "/app"

if [ "$NODE_ENV" = "production" ]; then
    npm run build
    npm run start
else
    npm install
    npm run start:dev
fi
