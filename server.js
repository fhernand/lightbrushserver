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
var maxbrushsizescale = 1;
var brush = 1;
var hexcolor = '#000000';

var ledHandlerInstance = new LedHandler();
ledHandlerInstance.run();

const io = require('socket.io')(http);

io.sockets.on('connection', (socket) => {
  console.log('Client has connected...');
  io.sockets.emit('brush', {value: brush});
  io.sockets.emit('thumbslider', {value: thumbslider});
  io.sockets.emit('pressure', {value: pressure});
  io.sockets.emit('maxbrushsizescale', {value: maxbrushsizescale});
  io.sockets.emit('hexcolor', {value: hexcolor});

  socket.on('brush', (data) => {
    //Expected values: 1,2,...
    var obj = getJsonObject(data);
    if(checkValue(obj.value)!=null){
      brush = obj.value
      ledHandlerInstance.setBrush(brush);
      io.sockets.emit('brush', {value: brush});
    }
  });

  socket.on('thumbslider', (data) => {
    //Expected value range: 0-100
    var obj = getJsonObject(data);
    if(checkValue(obj.value)!=null){
      thumbslider = obj.value;
      ledHandlerInstance.updateThumbSlider(thumbslider);
      io.sockets.emit('thumbslider', {value: thumbslider});
    }
  });

  socket.on('pressure', (data) => {  
    //Expected value range: 0-100
    var obj = getJsonObject(data);
    if(checkValue(obj.value)!=null){
      pressure = obj.value;
      ledHandlerInstance.setPressure(pressure);
      io.sockets.emit('pressure', {value: pressure});
    }
  });

  socket.on('maxbrushsize', (data) => {   
    //Expected value range: 0-1 (float)
    var obj = getJsonObject(data);
    if(checkValue(obj.value)!=null){
      maxbrushsize = obj.value;
      ledHandlerInstance.setMaxBrushSize(maxbrushsize);
      io.sockets.emit('maxbrushsize', {value: maxbrushsize});
    }
  });
  
  socket.on('hexcolor', (data) => {
    var obj = getJsonObject(data);
    if(checkValue(obj.value)!=null){
      hexcolor = obj.value;
      ledHandlerInstance.updateHexColor(hexcolor);
      io.sockets.emit('hexcolor', {value: hexcolor});
    }
  });

  socket.on('errorhandling', () => {
    ledHandlerInstance.showError();
  });
});

function checkValue(value){
  if (value!=null){
    return value;
  } else {
    io.sockets.emit('errorhandling');
    return null;
  }
}

function blink(seconds){
  //ledHandlerInstance.setPressure(50);
  for(i=0; i<= 100;i++){
    ledHandlerInstance.setPressure(i);
    sleep(seconds*50);
    console.log('tick');
  }
}

function getJsonObject(data){
    if (typeof data == 'string'){
      var obj = JSON.parse(data);
    } else {
      obj = data;
    }
    return obj;
}
