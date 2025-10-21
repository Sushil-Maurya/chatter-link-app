import express from "express";
import 'dotenv/config';
import cors from "cors";
import http from "http";
import connectDB from "./lib/db.ts";
import userRouter from "./routes/userRoutes.ts";
import messageRouter from "./routes/messageRoutes.ts";
import {Server} from "socket.io";

const app = express();
const server = http.createServer(app);
// socket io
export const io = new Server(server,{
    cors: {
        origin: "*",
    },
});

// store online users
export const onlineUsersMap = {};
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log('user connected',userId);
    if (userId) {
        onlineUsersMap[userId as string] = socket.id;
    }
    // emit online users to all clients
    io.emit("onlineUsers", Object.keys(onlineUsersMap));
    socket.on("disconnect", () => {
        console.log('user disconnected',userId);
        delete onlineUsersMap[userId as string];
        io.emit("onlineUsers", Object.keys(onlineUsersMap));
    });
});

app.use(cors());
app.use(express.json({limit:'5mb'}));

app.use('/api/status', (req, res) => {
    res.send('server is running')
    // res.json({status: 'ok'})
})

// Routes
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);

// connect to MongoDB
 await connectDB();

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
