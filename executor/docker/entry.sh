#!/bin/bash

cd "/app"

if [ "$NODE_ENV" = "production" ]; then
    npm run build
    exec node dist/index.js
else
    npm install
    exec ./node_modules/.bin/ts-node-dev --respawn src/index.ts
fi
