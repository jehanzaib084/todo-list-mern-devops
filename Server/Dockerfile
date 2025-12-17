# Backend Dockerfile - Node.js/Express API
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application source
COPY . .

# Expose backend port
EXPOSE 4000

# Start the backend server
CMD ["node", "server.js"]
