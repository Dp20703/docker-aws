import express from "express";
import { createServer } from 'http';
import { Server } from "socket.io";
import { YSocketIO } from 'y-socket.io/dist/server'

const app = express();
const httpServer = createServer(app)

const io = new Server(httpServer,
    {
        cors: {
            origin: "*",
            method: ["GET", "POST"]
        }
    }
)
const ySocketIO = new YSocketIO(io);
ySocketIO.initialize();

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello from server",
        status: true
    })
})
app.get("/health", (req, res) => {
    res.status(200).json({
        message: "Ok",
        status: true
    })
})

httpServer.listen(3000, () => {
    console.log("Server is listening on PORT http://localhost:3000");
})

