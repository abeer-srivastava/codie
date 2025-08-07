import { Server, Socket } from "socket.io";
import type { User } from "./types/user.js";

let code: string = "// Welcome!";
let users: User[] = [];

export function registerSocketHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    const username = `User-${socket.id.slice(0, 5)}`;
    const user: User = { id: socket.id, name: username };
    users.push(user);

    // Send current code to the new user
    socket.emit("code-change", code);

    // Send updated user count to all clients
    io.emit("user-count", users.length);

    // Optionally, send the full user list if needed elsewhere
    io.emit("users", users);

    // Listen for code changes
    socket.on("code-change", (newCode: string) => {
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