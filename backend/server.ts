import express from "express";
import 'dotenv/config';
import cors from "cors";
import http from "http";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
// socket io
export const io = new Server(server,{
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5001"],
        methods: ["GET", "POST"],
        credentials: true
    },
});

// store online users
export const onlineUsersMap: Record<string, string> = {};
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log('user connected',userId);
    if (userId) {
        onlineUsersMap[userId as string] = socket.id;
    }
    // emit online users to all clients
    io.emit("onlineUsers", Object.keys(onlineUsersMap));

    socket.on("typing", (data) => {
        const { receiverId } = data;
        const receiverSocketId = onlineUsersMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing", { senderId: userId });
        }
    });

    socket.on("stopTyping", (data) => {
        const { receiverId } = data;
        const receiverSocketId = onlineUsersMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
        }
    });

    socket.on("disconnect", () => {
        console.log('user disconnected',userId);
        delete onlineUsersMap[userId as string];
        io.emit("onlineUsers", Object.keys(onlineUsersMap));
    });
});

// allow cors for frontend
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5001"], // Add your frontend URL/port here
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({limit:'5mb'}));

app.use('/api/status', (req, res) => {
    res.send('server is running')
    // res.json({status: 'ok'})
})

// Routes
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);

// For backward compatibility
app.get('/api/check-auth', (req, res) => {
  res.redirect('/api/auth/check-auth');
});

// connect to MongoDB
 await connectDB();

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
