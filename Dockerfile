FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --production=false

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG CACHEBUST=1
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

EXPOSE 3000
CMD ["node", "dist/server.js"]
