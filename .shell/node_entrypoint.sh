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
  npm run dev -- -p 3000 &
  dev_pid=$!

  # Next compiles each route on its first request, which takes 2-4s per page in dev.
  # Request every app route once in the background so clicks land on compiled pages.
  (
    until wget -q -O /dev/null http://localhost:3000/ 2>/dev/null; do sleep 1; done
    echo "Warming up routes..."
    find src/app -name page.tsx \
      | sed -e 's#^src/app##' -e 's#/page\.tsx$##' -e 's#/([^/]*)##g' -e 's#\[[^]]*\]#warmup#g' \
      | while read -r route; do
          route=${route:-/}
          # Protected routes redirect to sign-in without a cookie (see src/middleware.ts);
          # any value gets past that check, which is all compiling the page needs
          case "$route" in
            /dashboard*|/identity/user*|/events*|/workspace*|/onboarding*)
              cookie="bearer_token=warmup" ;;
            *) cookie="" ;;
          esac
          wget -q -O /dev/null --header "Cookie: $cookie" "http://localhost:3000$route" 2>/dev/null
        done
    echo "Route warm-up finished"
  ) &

  wait $dev_pid
fi
exec "$@"
# Keep the container running
# tail -f /dev/null
