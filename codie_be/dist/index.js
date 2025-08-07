import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./socket.js";
const app = express();
// Start Express server
const server = app.listen(8080, () => {
    console.log("⚡ Server running at http://localhost:8080");
});
// Initialize Socket.IO on the same server
const io = new Server(server, {
    cors: {
        origin: "*", // Replace with frontend URL in production
    },
});
// Middleware
app.use(cors());
app.use(express.json());
// Health check or future API routes
app.get("/", (_req, res) => {
    res.send("Realtime Collaborative Editor API is running.");
});
// Register Socket.IO handlers
registerSocketHandlers(io);
//# sourceMappingURL=index.js.map