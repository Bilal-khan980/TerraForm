FROM node:18-alpine AS builder

WORKDIR /app

COPY app/package.json ./

# Install dependencies (including devDependencies if needed, but --production usually enough)
RUN npm install --production

# --- Stage 2: Runner ---
FROM node:18-alpine

WORKDIR /app

# Copy application source and node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY app/src ./src
COPY app/package.json ./

# Environment configuration
ENV PORT=3000
ENV NODE_ENV=production

# Security: Run as non-root user 'node'
USER node

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/main.js"]
