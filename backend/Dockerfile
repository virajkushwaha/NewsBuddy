FROM ubuntu:22.04

ENV NODE_VERSION=18.19.0
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    lsb-release \
    ca-certificates \
    build-essential \
    python3 \
    python3-pip \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

WORKDIR /app

RUN groupadd -r nodeuser && useradd -r -g nodeuser nodeuser

COPY package*.json ./

RUN npm install --production && npm cache clean --force

COPY . .

RUN mkdir -p logs && chown -R nodeuser:nodeuser /app

USER nodeuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

CMD ["npm", "start"]
