# Use the official Node.js image
FROM node:16-slim

# Set the working directory
WORKDIR /app

# Clear npm cache
RUN npm cache clean --force

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --verbose

# Copy the rest of the frontend code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the frontend app
CMD ["npm", "start"]
