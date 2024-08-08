#!/bin/sh

if [[ "$NODE_ENV" == "production" ]]; then
  echo "Running in production mode..."
  npm ci --only=production
  npm run build
  npm run start
else
  echo "Running node in development mode..."
  npm install
  npm run dev
fi
exec "$@"
# Keep the container running
# tail -f /dev/null
