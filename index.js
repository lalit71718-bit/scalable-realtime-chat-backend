const connectDB = require("./db");
const Message = require("./models/message");

const express = require("express");
const { createServer } = require("node:http");

const { join } = require('node:path');
const { Server } = require('socket.io');

const cluster = require("node:cluster");
const { availableParallelism } = require("node:os");

const {
    createAdapter,
    setupPrimary,
} = require("@socket.io/cluster-adapter");

if (cluster.isPrimary) {
    const numWorkers = 5;
    const workerPorts = new Map();

    function startWorker(port) {
        const worker = cluster.fork({
            PORT: String(port),
        });

        // Remember which port belongs to this worker
        workerPorts.set(worker.id, port);

        console.log(`Started worker for port ${port}`);
    }

    setupPrimary();

    // Restart a worker if it exits
    cluster.on("exit", (worker, code, signal) => {
        const port = workerPorts.get(worker.id);
        workerPorts.delete(worker.id);

        console.log(
            `Worker ${worker.process.pid} exited. Code: ${code}, Signal: ${signal}`
        );

        if (port !== undefined) {
            console.log(`Restarting worker on port ${port}...`);
            startWorker(port);
        }
    });

    // Start five workers
    for (let i = 0; i < numWorkers; i++) {
        startWorker(3000 + i);
    }
} else {
    main();
}



// if(cluster.isPrimary){
//     const numWorkers = 5;

//     for(let i=0; i<numWorkers; i++){
//         cluster.fork({
//             PORT: 3000 + i,
//         });
//     }
//     setupPrimary();

//     //Restart a worker if it exists
//     cluster.on("exit", (worker, code, signal) =>{
//         console.log(
//             `Worker ${worker.process.pid} exited. Code: ${ code}, signal:${signal}`
//         );
//         console.log("Starting a replacement worker...");

//         cluster.fork({
//             PORT : worker.process.env.PORT,
//         });     
//     });
// } else{
//     main();
// }

async function main(){
    //1. conncect this worker to MongoDB
    await connectDB();
    //2. Create express and HTTP servers

    const app = express();
    const httpserver = createServer(app);

    //3.configure soket.io for horizontal scalling 
    const io = new Server( httpserver, {
        connectionStateRecovery : {},
        adapter : createAdapter(),
    });

    //4. serve your chat page
    app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
    });

    //5.Temporary route to test worker crashes
    app.get('/crash-worker', (req, res) => {
    res.send('Worker is shutting down...');

    setTimeout(() => {
        process.exit(1);
    }, 100);
    });

    //5. handle connected client and load history 
    io.on("connection", async(socket) => {
        console.log("User connected:", socket.id);

        try{
        const history = await Message.find()
        .sort({ createdAt: -1})
        .limit(100)
        .lean();

        socket.emit('chat history', history.reverse());
        } catch (error){
        console.error('Error loading chat history:', error);
          }
          
    // 6. Receive, save, and broadcast messages
    socket.on("chat message", async(msg) =>{
        try{
            if(typeof msg !== "string" || !msg.trim()){
                return;
            }

            const savedMessage = await Message.create({
                message : msg.trim(),
            });
            io.emit("chat message", savedMessage.message);
        } catch (error){
            console.error("Error saving message:", error);
            }
    });    

    //7. Handle client disconnection
    socket.on("disconnect", () =>{
        console.log("User disconnected:", socket.id);
    });
    });
    // 8. start the worker on its assigned port
    const port = process.env.PORT;   
    
    httpserver.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}


