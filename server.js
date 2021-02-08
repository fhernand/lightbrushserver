const express = require('express');
const app = express();
const http = require('http').Server(app);

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

const io = require('socket.io')(http);

io.sockets.on('connection', (socket) => {
  io.sockets.emit('brush', {value: brush});
  io.sockets.emit('thumbslider', {value: thumbslider});
  io.sockets.emit('pressure', {value: pressure});
  io.sockets.emit('hexcolor', {value: hexcolor});

  socket.on('brush', (data) => {
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
      io.sockets.volatile.emit('thumbslider', {value: thumbslider});
    }
  });

  socket.on('pressure', (data) => {
    if(checkValue(data.value)!=null){
      pressure = data.value;
      ledHandlerInstance.setPressure(pressure);
      io.sockets.volatile.emit('pressure', {value: pressure});
    }
  });

  socket.on('hexcolor', (data) => {
    if(checkValue(data.value)!=null){
      hexcolor = data.value;
      ledHandlerInstance.updateHexColor(hexcolor);
      io.sockets.volatile.emit('hexcolor', {value: hexcolor});
    }
  });

  socket.on('errorhandling', () => {
    ledHandlerInstance.updateHexColor('#ff0000');
    io.sockets.emit('hexcolor', {value: '#ff0000'});
    ledHandlerInstance.updateThumbSlider(255);
    io.sockets.emit('thumbslider', {value: 255});
    ledHandlerInstance.setPressure(100);
    io.sockets.emit('pressure', {value: 100});
    // for(i=0; i<= 100;i++){
    //   ledHandlerInstance.setPressure(i);
    //   sleep(5);
    //   console.log('tick');
    // }
    //for(i=0;i<=2;i++){
    //  blink(2);
    //}
    // ledHandlerInstance.updateHexColor(hexcolor);
    // io.sockets.emit('hexcolor', {value: hexcolor});
    // ledHandlerInstance.updateThumbSlider(thumbslider);
    // io.sockets.emit('thumbslider', {value: thumbslider});
    // ledHandlerInstance.setPressure(pressure);
    // io.sockets.emit('pressure', {value: pressure});
  });
});

function checkValue(value){
  if (value!=null){
    return value;
  } else {
    io.sockets.emit('error');
    return null;
  }
}

function blink(seconds){
  for(i=0; i<= 100;i++){
    ledHandlerInstance.setPressure(i);
    sleep(seconds*5);
    console.log('tick');
  }
  for(i=99; i>= 0;i--){
    ledHandlerInstance.setPressure(i);
    sleep(seconds*5);
    console.log('tick');
  }
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
