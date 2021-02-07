const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const { LedHandler } = require("./ledhandler");

http.listen(3000, () => {
  console.log('listening on *:3000');
});

app.use(express.static('public'));

var thumbslider = 0;
var pressure = 0;
var brush = 1;
var hexcolor = '#000000';

var ledHandlerInstance = new LedHandler();
ledHandlerInstance.run();

io.sockets.on('connection', (socket) => {
  socket.emit('brush', {value: brush});
  socket.emit('thumbslider', {value: thumbslider});
  socket.emit('pressure', {value: pressure});
  socket.emit('hexcolor', {value: hexcolor});

  socket.on('brush', function (data) {
    if(checkValue(data.value)!=null){
      brush = data.value
      ledHandlerInstance.setBrush(brush);
        io.sockets.emit('brush', {value: brush});
      }
    });

    socket.on('thumbslider', (data) => {
      if(checkValue(data.value)!=null){
        thumbslider = data.value;
        ledHandlerInstance.updateThumbSlider(thumbslider);
        io.sockets.emit('thumbslider', {value: thumbslider});
      }
    });

    socket.on('pressure', function (data) {
      if(checkValue(data.value)!=null){
        pressure = data.value;
        ledHandlerInstance.setPressure(pressure);
        io.sockets.emit('pressure', {value: pressure});
      }
    });

    socket.on('hexcolor', function (data) {
      if(checkValue(data.value)!=null){
        hexcolor = data.value;
        ledHandlerInstance.updateHexColor(hexcolor);
        io.sockets.emit('hexcolor', {value: hexcolor});
      }
    });

    socket.on('error', function () {
      io.sockets.emit('hexcolor', {value: '#ff0000'});
      io.sockets.emit('thumbslider', {value: 255});
      for (var i = 0; i < 3; i++)
        blink();
    });
  });

  function checkValue(value){
    if (value!=null){
      return value;
    } else {
      socket.emit('error');
      return null;
    }
  }

  function blink(){
    for(i=0; i<= 100;i++){
      o.sockets.emit('pressure', {value: i});
    }
    for(i=99; i>= 0;i--){
      o.sockets.emit('pressure', {value: i});
    }
  }
