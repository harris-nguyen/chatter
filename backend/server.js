const express = require("express");
const socketio = require('socket.io')
const http = require('http')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to room ${user.room}.`,
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  })

   socket.on("sendMessage", (message, callback) => {
     const user = getUser(socket.id);

     io.to(user.room).emit("message", { user: user.name, text: message });
     io.to(user.room).emit("roomData", { room: user.room, users: getUsersInRoom(user.room) });

     callback();
   });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  })

})

app.get("/health-check", (req, res) => {
  console.log("Testing Home here");
  res.send(["server says hi"]);
});

server.listen(8005, console.log("Listening to port 8005!"));
