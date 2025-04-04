#!/bin/bash
set -e

if [ "${BUILD_ENV}" = "development" ]; then
  echo "-> Skip npm install"
else
  echo "-> Run npm install"
  cd /app
  npm install --verbose
  npm run build
fi
