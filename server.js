const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const { Brush } = require("./brushes");
const { LedHandler } = require("./ledhandler");

const NUM_LEDS_WIDTH = 8;
const NUM_LEDS_HEIGHT = 8;

http.listen(3000, () => {
  console.log('listening on *:3000');
});

app.use(express.static('public'));

var ledHandlerInstance = new LedHandler();
var brightness = 50;
var radius = 50;
var color = { r:255, g:215, b:0 };

io.sockets.on('connection', (socket) => {
  socket.emit('brightness', {value: brightness});

  socket.on('brightness', function (data) { //makes the socket react to 'led' packets by calling this function
    brightness = data.value;  //updates brightness from the data object
    ledHandlerInstance.updateBrightness(brightness);
    io.sockets.emit('brightness', {value: brightness}); //sends the updated brightness to all connected clients
  });

  socket.emit('radius', {value: radius});

  socket.on('radius', function (data) { //makes the socket react to 'led' packets by calling this function
    radius = data.value;
    ledHandlerInstance.setRadius(radius);
    io.sockets.emit('radius', {value: radius});
  });

  socket.emit('red', {value: color.r});

  socket.on('red', function (data) {
    color.r = data.value;
    ledHandlerInstance.updateColor(color);
    io.sockets.emit('red', {value: color.r});
  });

  socket.emit('green', {value: color.g});

  socket.on('green', function (data) {
    color.g = data.value;
    ledHandlerInstance.updateColor(color);
    io.sockets.emit('green', {value: color.g});
  });

  socket.emit('blue', {value: color.b});

  socket.on('blue', function (data) {
    color.b = data.value;
    ledHandlerInstance.updateColor(color);
    io.sockets.emit('blue', {value: color.b});
  });

});

ledHandlerInstance.run();
