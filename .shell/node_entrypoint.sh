#!/bin/sh

if [[ "$NODE_ENV" == "production" ]]; then
  echo "Running in production mode..."
  npm ci --only=production
  npm run build
  npm run start
else
  echo "Running node in development mode..."
  npm install
  # nginx proxies to node:3000; package.json's dev script defaults to 4000 for host use
  npm run dev -- -p 3000
fi
exec "$@"
# Keep the container running
# tail -f /dev/null
