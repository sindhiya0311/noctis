const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const requestRoutes = require("./routes/requestRoutes");

// Routes
const userRoutes = require("./routes/userRoutes");
const locationRoutes = require("./routes/locationRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.set("io", io);

const workers = {};

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/requests", requestRoutes);

app.get("/", (req, res) => {
  res.send("NOCTIS Backend Running 🚀");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("worker:update", async (data) => {
    workers[data.userId] = {
      ...workers[data.userId],
      ...data,
      socketId: socket.id,
    };

    // broadcast all workers
    io.emit("workers:update", workers);

    // emergency alert (risk based)
    if ((workers[data.userId].risk || 0) >= 80) {
      io.emit("worker:alert", workers[data.userId]);
    }
  });

  // 🚨 instant SOS alert (no delay)
  socket.on("worker:sos", (data) => {
    if (workers[data.userId]) {
      io.emit("worker:alert", workers[data.userId]);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (let id in workers) {
      if (workers[id].socketId === socket.id) {
        delete workers[id];
      }
    }

    io.emit("workers:update", workers);
  });
});

// MongoDB Atlas Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error:", err));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
