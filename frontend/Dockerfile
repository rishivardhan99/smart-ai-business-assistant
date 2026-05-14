# frontend/Dockerfile
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# Start the Vite development server (host ensures it's accessible outside the container)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]