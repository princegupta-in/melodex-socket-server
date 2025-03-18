// server.js (Approach 2: No Next.js)

const express = require("express");
const { createServer } = require("http");
const { Server: SocketIOServer } = require("socket.io");

const port = parseInt(process.env.PORT || "3000", 10);

// Create your Express app and HTTP server
const expressApp = express();
const httpServer = createServer(expressApp);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
    cors: {
        origin:
            process.env.NODE_ENV === "production"
                ? [
                    "https://melodex.tech",
                    "https://www.melodex.tech",
                    "https://melodex-two.vercel.app/",
                ]
                : "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("👻 New client connected:", socket.id);

    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`🚀 Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("participantJoined", (data) => {
        console.log("👋 participantJoined event received:", data);
        socket.broadcast.to(data.roomId).emit("participantJoined", data);
    });

    socket.on("newSong", (data) => {
        console.log(`🎵 New song in room ${data.roomId}:`, data.song);
        io.to(data.roomId).emit("songAdded", data);
    });

    socket.on("voteUpdate", (data) => {
        console.log(`🔄 Vote update in room ${data.roomId} for stream ${data.streamId}:`, data);
        io.to(data.roomId).emit("voteUpdated", data);
    });

    socket.on("disconnect", () => {
        console.log("💀 Client disconnected:", socket.id);
    });

    socket.on("playbackUpdate", (data) => {
        console.log("Received playbackUpdate from client:", data);
        io.to(data.roomId).emit("playbackUpdate", data);
    });

    socket.on("currentSongChanged", (data) => {
        console.log("Received currentSongChanged event from", socket.id, ":", data);
        io.to(data.roomId).emit("currentSongChanged", data);
    });

    socket.on("muteUpdate", (data) => {
        console.log("Received mute event from", socket.id, ":", data);
        io.to(data.roomId).emit("muteUpdate", data);
    });
});

// Optionally, handle any Express routes or a simple health check
expressApp.get("/", (req, res) => {
    res.send("Socket.IO server is running!");
});

// Start the server
httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Socket.IO server ready on http://localhost:${port}`);
});
