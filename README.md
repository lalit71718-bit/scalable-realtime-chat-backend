# Backend: Scalable Real-Time Chat Application

A real-time chat application backend built using Node.js, Express, Socket.IO, and MongoDB. The application supports persistent messaging, communication across multiple worker processes, and automatic worker recovery.

## Features

- **Real-time messaging:** Send and receive messages using Socket.IO.
- **MongoDB persistence:** Store messages in MongoDB using Mongoose.
- **Chat history:** Load the latest 100 messages when a client connects.
- **Horizontal scaling:** Run five Node.js worker processes on ports `3000`–`3004`.
- **Cross-worker communication:** Use the Socket.IO cluster adapter to broadcast messages between workers.
- **Automatic worker recovery:** Restart a worker if its process exits.
- **Multi-client support:** Exchange messages across browser tabs connected to different workers.

## Tech Stack

- Node.js
- Express.js
- Socket.IO
- MongoDB
- Mongoose
- Node.js Cluster
- `@socket.io/cluster-adapter`
- HTML, CSS, and JavaScript

## How It Works

1. A client connects to the application through one of the worker ports.
2. When a user sends a message, the worker receives the Socket.IO event.
3. The message is saved in MongoDB.
4. The server broadcasts the message using Socket.IO.
5. The cluster adapter distributes the broadcast across worker processes, allowing clients connected to different workers to receive it.
6. When a worker exits, the primary process starts a replacement worker on the same port.

MongoDB provides persistent storage, while the Socket.IO cluster adapter enables communication between worker processes.

## Project Structure

```text
CHAT-APP/
├── models/
│   └── message.js
├── .gitignore
├── db.js
├── index.html
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

## Prerequisites

- Node.js and npm
- MongoDB running locally or an accessible MongoDB instance
- Git

## Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/lalit71718-bit/scalable-realtime-chat-backend.git
   ```

2. Open the project directory:

   ```bash
   cd scalable-realtime-chat-backend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Ensure MongoDB is running and configure the connection URI in `db.js` if necessary.

5. Start the application:

   ```bash
   npm start
   ```

6. Open the application in your browser:

   - http://localhost:3000
   - http://localhost:3001
   - http://localhost:3002
   - http://localhost:3003
   - http://localhost:3004

Open multiple tabs on different ports to test cross-worker messaging.

## Worker Crash Simulation and Recovery

The project includes a `/crash-worker` endpoint for testing worker recovery during local development.

1. Start the application.
2. Open `http://localhost:3000/crash-worker`.
3. Check the terminal for the worker exit and restart logs.
4. Reopen `http://localhost:3000/` and verify that the chat works again.

**Security note:** This endpoint intentionally terminates a worker. Keep it restricted to local development and never expose it in a public or production deployment.

## Key Learnings

- Building real-time communication with Socket.IO.
- Persisting application data with MongoDB and Mongoose.
- Understanding Node.js Cluster and worker processes.
- Sharing Socket.IO events across workers using a cluster adapter.
- Implementing automatic worker recovery.
- Testing message persistence and communication across multiple clients.
- Managing a Node.js project with npm and Git.

## Future Improvements

- User authentication and authorization.
- Private and group conversations.
- Message pagination and delivery/read receipts.
- Automated tests and CI/CD.
- Docker-based deployment.
- Production-ready monitoring and controlled restart backoff.
- A Redis-backed Socket.IO adapter for communication across separate server instances.

## Author

**Lalit Kumar Singh**

- GitHub: [lalit71718-bit](https://github.com/lalit71718-bit)

---

*Built as a learning project to explore real-time communication, persistence, and scaling with Node.js.*