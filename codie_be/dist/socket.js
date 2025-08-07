import { Server, Socket } from "socket.io";
let code = "// Welcome!";
let users = [];
export function registerSocketHandlers(io) {
    io.on("connection", (socket) => {
        const username = `User-${socket.id.slice(0, 5)}`;
        const user = { id: socket.id, name: username };
        users.push(user);
        // Send current code to the new user
        socket.emit("code-change", code);
        // Send updated user count to all clients
        io.emit("user-count", users.length);
        // Optionally, send the full user list if needed elsewhere
        io.emit("users", users);
        // Listen for code changes
        socket.on("code-change", (newCode) => {
            code = newCode;
            // Broadcast updated code to all except sender
            socket.broadcast.emit("code-change", code);
        });
        // On disconnect
        socket.on("disconnect", () => {
            users = users.filter((u) => u.id !== socket.id);
            io.emit("user-count", users.length);
            io.emit("users", users);
        });
    });
}
//# sourceMappingURL=socket.js.map