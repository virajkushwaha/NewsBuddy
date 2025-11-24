# Use Ubuntu as base image
FROM ubuntu:22.04

# Set environment variables
ENV NODE_VERSION=18.19.0
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    lsb-release \
    ca-certificates \
    build-essential \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Fix broken packages and install Node.js 20
RUN apt --fix-broken install -y \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Create app directory
WORKDIR /app

# Create non-root user
RUN groupadd -r nodeuser && useradd -r -g nodeuser nodeuser

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production \
    && npm cache clean --force

# Copy application code (excluding node_modules)
COPY --chown=nodeuser:nodeuser . .

# Remove any existing node_modules and do fresh install
RUN rm -rf node_modules package-lock.json \
    && npm install --only=production \
    && npm rebuild sqlite3 --build-from-source \
    && npm cache clean --force

# Create logs directory
RUN mkdir -p logs && chown -R nodeuser:nodeuser /app

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]