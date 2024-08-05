# ETL/ELT Platform Notification System

## Overview

This project implements a real-time notification system for an ETL/ELT platform using Node.js, Socket.io, Redis, and MongoDB's Change Streams. The system notifies users about changes to sources in their workplace, including creation, deletion, and updates.

## Features

- **Real-time Notifications**: Users receive immediate updates on source changes in their workspace.
- **Modular Design**: Organized and maintainable code structure.
- **Efficient Data Handling**: Utilizes MongoDB for data storage and Redis for session management.
- **Scalable**: Supports multiple users and workplaces with robust notification handling.

## Technologies Used

- **Node.js**: Backend runtime environment
- **Socket.io**: Real-time communication
- **MongoDB**: NoSQL database with Change Streams
- **Redis**: In-memory data store
- **Docker**: Containerization for development and deployment

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Abubakar4101/ELT-Platform.git
   cd elt-platform

2. **Configure environment variables: Create a .env file and set the following variables:**

    ```bash
    PORT=3000
    REDIS_URL=redis://redis:6379
    MONGO_URL=mongodb://host.docker.internal:27017/EltHub

3. **Start the application:**

    ```bash
    docker-compose up --build

### Usage
 - Real-time notifications: Clients connect to the server via Socket.io to receive real-time updates.
 - Notification management: Notifications are stored in MongoDB and can be marked as read or unread.