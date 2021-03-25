const argv = require('yargs/yargs')(process.argv.slice(2)).argv;
const express = require('express');
const app = express();
const http = require('http').Server(app);

const { LedHandler } = require("./ledhandler");

var port = 3000;
if (argv.port){
  port = argv.port;
}
http.listen(port, () => {
  console.log('listening on *:' + port);
});

app.use(express.static('public'));

var brightness = 0;
var maxbrightness = 0;
var pressure = 0;
var maxbrushsize = 0;
var brush = 1;
var hexcolor = '#000000';
var stampbrush = 'false';

var ledHandlerInstance = new LedHandler(argv.led);
ledHandlerInstance.run();

const io = require('socket.io')(http);

io.sockets.on('connection', (socket) => {
  console.log('Client has connected...');
  io.sockets.emit('brush', {value: brush});
  io.sockets.emit('brightness', {value: brightness});
  io.sockets.emit('maxbrightness', {value: maxbrightness});
  io.sockets.emit('pressure', {value: pressure});
  io.sockets.emit('maxbrushsize', {value: maxbrushsize});
  io.sockets.emit('hexcolor', {value: hexcolor});

  socket.on('brightness', (data) => {
    //Expected value range: 0-100
    var obj = getJsonObject(data);
    if(checkValue(obj.value)!=null){
      brightness = obj.value;
      ledHandlerInstance.setBrightness(brightness);
      io.sockets.emit('brightness', {value: brightness});
    }
  });
  
  socket.on('brush', (data) => {
    //Expected values: 1,2,...
    var obj = getJsonObject(data);
    if(checkValue(obj.value)!=null){
      brush = obj.value
      ledHandlerInstance.setBrush(brush);
      io.sockets.emit('brush', {value: brush});
    }
  });
 
  socket.on('errorhandling', () => {
    ledHandlerInstance.showError();
  });
  
  socket.on('hexcolor', (data) => {
    var obj = getJsonObject(data);
    if(checkValue(obj.value)!=null){
      hexcolor = obj.value;
      ledHandlerInstance.setHexColor(hexcolor);
      io.sockets.emit('hexcolor', {value: hexcolor});
    }
  });
  
  socket.on('maxbrightness', (data) => {
    //Expected value range: 0-100
    var obj = getJsonObject(data);
    if(checkValue(obj.value)!=null){
      maxbrightness = obj.value;
      ledHandlerInstance.setMaxBrightness(maxbrightness);
      io.sockets.emit('maxbrightness', {value: maxbrightness});
    }
  });  

  socket.on('maxbrushsize', (data) => {   
    //Expected value range: 0-1 (float)
    var obj = getJsonObject(data);
    if(checkValue(obj.value)!=null){
      maxbrushsize = obj.value;
      maxbrushsize = maxbrushsize.replace(/,/g, '.');
      ledHandlerInstance.setMaxBrushSize(maxbrushsize);
      io.sockets.emit('maxbrushsize', {value: maxbrushsize});
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
  
  socket.on('stampbrush', (data) => {  
    //Expected values: true, false
    var obj = getJsonObject(data);
    if(checkValue(obj.value)!=null){
      var stampbrush = obj.value;
      if (stampbrush == 'true'){
        stampbrush = true;
      } else {
        stampbrush = false;
      }
      ledHandlerInstance.setStampBrush(stampbrush);
      io.sockets.emit('stampbrush', {value: stampbrush});
    }
  }); 
  
  socket.on('gradient', (data) => {  
    //Expected values: true, false
    var obj = getJsonObject(data);
    if(checkValue(obj.value)!=null){
      var gradient = obj.value;
      if (gradient == 'true'){
        gradient = true;
      } else {
        gradient = false;
      }
      ledHandlerInstance.setGradient(gradient);
      io.sockets.emit('gradient', {value: gradient});
    }
  });   
  socket.on('glow', (data) => {  
    //Expected values: true, false
    var obj = getJsonObject(data);
    if(checkValue(obj.value)!=null){
      var glow = obj.value;
      if (glow == 'true'){
        glow = true;
      } else {
        glow = false;
      }
      ledHandlerInstance.setGlow(glow);
      io.sockets.emit('glow', {value: glow});
    }
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
