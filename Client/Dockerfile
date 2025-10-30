# Simple React build and serve
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Serve the built application using vite preview
CMD ["npx", "vite", "preview", "--port", "3000", "--host", "0.0.0.0"]