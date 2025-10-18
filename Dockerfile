# Dockerfile (multi-stage, Railway-ready)

# ---- Build stage ----
FROM node:18-alpine AS build
WORKDIR /app

# Install deps with cache-friendly layers
COPY package*.json ./
RUN npm ci

# Copy source and build client + server
COPY . .
ARG BUILD_TIME
ENV BUILD_TIME=${BUILD_TIME}
RUN npm run build

# ---- Runtime stage ----
FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Only production deps for the server runtime
COPY package*.json ./
RUN npm ci --omit=dev

# Bring built artifacts
COPY --from=build /app/server-dist ./server-dist
COPY --from=build /app/client-dist ./client-dist

# Railway injects $PORT; do not hardcode. EXPOSE is informational.
EXPOSE 8080

# Start the server bundle (must bind process.env.PORT internally)
CMD ["node", "server-dist/index.js"]
