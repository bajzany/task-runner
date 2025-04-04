#!/bin/bash
set -e

if [ "${NODE_ENV}" = "development" ]; then
  if [ ! -d "/app/node_modules" ]; then
    npm install --verbose
  fi
  npm start
else
  nginx -g 'daemon off;'
fi
