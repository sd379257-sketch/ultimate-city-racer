
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static("public"));

const players = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("join", (data) => {
    players[socket.id] = {
      name: String(data?.name || "Driver").slice(0, 16),
      x: 0,
      y: 0,
      angle: 0
    };

    socket.emit("players", players);
    socket.broadcast.emit("players", players);
  });

  socket.on("move", (data) => {
    if (!players[socket.id]) return;

    const x = Number(data?.x);
    const y = Number(data?.y);
    const angle = Number(data?.angle);

    if (![x, y, angle].every(Number.isFinite)) return;

    players[socket.id].x = Math.max(-100000, Math.min(100000, x));
    players[socket.id].y = Math.max(-100000, Math.min(100000, y));
    players[socket.id].angle = angle;

    socket.broadcast.emit("players", players);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("players", players);
    console.log("Player disconnected:", socket.id);
  });
});

app.get("/health", (req, res) => {
  res.send("Ultimate City Racer server is running!");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Racing server running on port " + PORT);
});
