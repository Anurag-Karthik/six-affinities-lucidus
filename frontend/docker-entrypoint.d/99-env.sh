#!/bin/sh
set -eu

cat > /usr/share/nginx/html/env.js <<EOF
globalThis.__APP_ENV__ = {
  VITE_BACKEND_URL: "${VITE_BACKEND_URL:-http://host.docker.internal:3000}"
};
EOF