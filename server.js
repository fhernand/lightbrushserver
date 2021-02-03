const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const { LedHandler } = require("./ledhandler");

http.listen(3000, () => {
  console.log('listening on *:3000');
});

app.use(express.static('public'));

var brightness = 50;
var pressure = 50;
var color = { r:255, g:215, b:0 };
var brush = 1;

var ledHandlerInstance = new LedHandler();
ledHandlerInstance.run();

io.sockets.on('connection', (socket) => {
  socket.emit('brightness', {value: brightness});

  socket.on('brightness', function (data) {
    brightness = data.value;
    ledHandlerInstance.updateBrightness(brightness);
    io.sockets.emit('brightness', {value: brightness});
  });

  socket.emit('pressure', {value: pressure});

  socket.on('pressure', function (data) {
    pressure = data.value;
    ledHandlerInstance.setPressure(pressure);
    io.sockets.emit('pressure', {value: pressure});
  });

  socket.emit('brush', {value: brush});

  socket.on('brush', function (data) {
    brush = data.value;
    ledHandlerInstance.setBrush(brush);
    io.sockets.emit('brush', {value: brush});
  });

  socket.emit('red', {value: color.r});

  socket.on('red', function (data) {
    color = ledHandlerInstance.getCurrentColor();
    color.r = data.value;
    ledHandlerInstance.updateColor(color);
    io.sockets.emit('red', {value: color.r});
  });

  socket.emit('green', {value: color.g});

  socket.on('green', function (data) {
    color = ledHandlerInstance.getCurrentColor();
    color.g = data.value;
    ledHandlerInstance.updateColor(color);
    io.sockets.emit('green', {value: color.g});
  });

  socket.emit('blue', {value: color.b});

  socket.on('blue', function (data) {
    color = ledHandlerInstance.getCurrentColor();
    color.b = data.value;
    ledHandlerInstance.updateColor(color);
    io.sockets.emit('blue', {value: color.b});
  });
});
