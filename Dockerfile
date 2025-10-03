# Multi-stage build for SolarGroup Investment Platform
FROM node:20.18.0-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
RUN npm ci
COPY . .

# Build frontend assets
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=build --chown=nextjs:nodejs /app/server ./server
COPY --from=build --chown=nextjs:nodejs /app/dist ./dist
COPY --from=build --chown=nextjs:nodejs /app/*.html ./
COPY --from=build --chown=nextjs:nodejs /app/manifest.json ./
COPY --from=build --chown=nextjs:nodejs /app/style.css ./
COPY --from=build --chown=nextjs:nodejs /app/app.js ./

# Copy package files
COPY --from=build --chown=nextjs:nodejs /app/package*.json ./
COPY --from=build --chown=nextjs:nodejs /app/server/package*.json ./server/

# Install production dependencies
RUN cd server && npm ci --only=production && npm cache clean --force

# Create necessary directories
RUN mkdir -p /app/logs /app/backups /app/tmp && \
    chown -R nextjs:nodejs /app/logs /app/backups /app/tmp

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/server.js"]
