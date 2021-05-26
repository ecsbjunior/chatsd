const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const socketiop2pserver = require('socket.io-p2p-server');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const p2p = socketiop2pserver.Server;

const state = {
  users: []
};

app.use(express.static('public'));

io.use(p2p);

io.on('connection', (socket) => {
  const user = {
    id: socket.id,
    username: socket.handshake.query.username,
    address: socket.request.connection._peername
  };
  
  socket.emit('self-setup', user);

  state.users.push(user);

  io.emit('add-user', user);

  socket.emit('setup', state.users);
  
  socket.on('disconnect', () => {
    state.users = state.users.filter(item => item.id !== user.id);
    io.emit('remove-user', user);
  });
});

server.listen(3333, () => {
  console.log('server is listening on port 3333');
});
