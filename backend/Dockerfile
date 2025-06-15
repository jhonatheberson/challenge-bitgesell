FROM node:18-alpine

WORKDIR /app

# Create data directory and set permissions
RUN mkdir -p /app/data && \
    chown -R node:node /app/data && \
    chmod 755 /app/data

COPY package*.json ./
RUN npm install

COPY . .

# Create items.json if it doesn't exist and set permissions
RUN echo "[]" > /app/data/items.json && \
    chown node:node /app/data/items.json && \
    chmod 644 /app/data/items.json

# Switch to non-root user
USER node

EXPOSE 3001

CMD ["npm", "start"]
