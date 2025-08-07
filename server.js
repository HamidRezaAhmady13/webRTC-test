//
const fs = require("fs");
const https = require("https");

const os = require("os");
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

// const options = {
//   key: fs.readFileSync("key.pem"),
//   cert: fs.readFileSync("cert.pem"),
// };
const app = express();
const server = http.createServer(app);
// const server = https.createServer(options, app);
const io = socketIO(server);
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("offer", (data, ack) => {
    socket.broadcast.emit("offer", data);
    ack("Offer relayed");
  });

  socket.on("answer", (data, ack) => {
    socket.broadcast.emit("answer", data);
    ack("Answer relayed");
  });

  socket.on("ice-candidate", (data, ack) => {
    socket.broadcast.emit("ice-candidate", data);
    ack("Candidate relayed");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const interfaces = os.networkInterfaces();
Object.values(interfaces).forEach((ifaceList) => {
  ifaceList.forEach((iface) => {
    if (iface.family === "IPv4" && !iface.internal) {
      console.log(`Accessible at http://${iface.address}:3000`);
    }
  });
});

server.listen(
  3000,
  // "0.0.0.0",
  () => {
    console.log("Server listening on http://0.0.0.0:3000");
  }
);
