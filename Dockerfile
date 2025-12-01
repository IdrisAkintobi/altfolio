# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with ignore-scripts for security
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build client and server
RUN npm run build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only with ignore-scripts
RUN npm ci --omit=dev --ignore-scripts

# Copy built files from builder (keep same structure as local)
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/shared ./shared

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Start the application directly with node
CMD ["node", "server/dist/server/index.js"]
