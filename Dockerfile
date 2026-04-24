FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --production=false

# Build (v3 - cache bust 2026-03-23)
FROM base AS builder
RUN echo "build-version-2026-03-23-1915" > /tmp/.build-id
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src/views ./dist/views
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/protocol ./dist/protocol
COPY --from=builder /app/src/db/migrations ./dist/db/migrations
COPY --from=builder /app/content ./content

EXPOSE 3000
CMD ["node", "dist/server.js"]
