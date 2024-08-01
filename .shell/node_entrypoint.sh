#!/bin/bash

if [[ "$NODE_ENV" == "production" ]]; then
  echo "Running in production mode..."
  npm ci --only=production
  npm run build
  npm start
else
  echo "Running in development mode..."
  npm install
  npm run dev
fi

 
# Keep the container running
tail -f /dev/null
