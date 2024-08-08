# Use the latest Ubuntu image as the base image
FROM ubuntu:latest

# Set environment variables to non-interactive mode to avoid prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update package list and install essential packages
RUN apt-get update && \
    apt-get install -y \
    build-essential \        
    curl \                   
    git \                   
    sudo \                   
    vim \                   
    wget \                   
    redis-server \           
    redis \               
    software-properties-common \  
    && rm -rf /var/lib/apt/lists/*  

# Install Node.js 20 from NodeSource
RUN curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
    apt-get install -y nodejs

# Set the working directory inside the container
WORKDIR /elt-platform

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose the necessary ports: application, Redis, and RedisInsight
EXPOSE 3000 6379 8001

# Start the application using npm
CMD ["npm", "start"]