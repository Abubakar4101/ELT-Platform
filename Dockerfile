# Use the latest Ubuntu image as the base image
FROM ubuntu:latest

# Set environment variables to non-interactive mode
ENV DEBIAN_FRONTEND=noninteractive

# Update and install essential packages
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    curl \
    git \
    sudo \
    vim \
    wget \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
    apt-get install -y nodejs

# Set the working directory
WORKDIR /app/elt-plateform

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
