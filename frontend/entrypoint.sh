#!/bin/sh

# Create env.js file with environment variables
cat > /usr/share/nginx/html/config/env.js << EOF
window.env = {
  REACT_APP_API_URL: "${REACT_APP_API_URL:-http://localhost:3000}",
  REACT_APP_APP_NAME: "${REACT_APP_APP_NAME:-Task Tracker}",
  REACT_APP_ENVIRONMENT: "${REACT_APP_ENVIRONMENT:-development}"
};
EOF

# Start nginx
nginx -g 'daemon off;'
