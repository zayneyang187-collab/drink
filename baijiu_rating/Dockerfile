FROM node:20-bullseye

WORKDIR /app

# Install server dependencies first for better build cache hit rate
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy application source
COPY server ./server
COPY db ./db

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/db/baijiu.sqlite

WORKDIR /app/server

# Initialize schema + seed data during image build
RUN node scripts/initDb.js

EXPOSE 3000

CMD ["node", "index.js"]
