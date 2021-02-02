const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ws281x = require('rpi-ws281x');

const { Brush } = require("Brush");

const NUM_LEDS_WIDTH = 8;
const NUM_LEDS_HEIGHT = 8;

http.listen(3000, () => {
  console.log('listening on *:3000');
});

app.use(express.static('public'));

class LedHandler {

  constructor() {
    this.brushInstance = new Brush(NUM_LEDS_WIDTH/2);
    this.pixelData = new Uint32Array(NUM_LEDS_WIDTH*NUM_LEDS_HEIGHT);
    this.blackpixelData = new Uint32Array(NUM_LEDS_WIDTH*NUM_LEDS_HEIGHT);

    this.MaxBrightness = 255;

    this.color = { r:0, g:0, b:0 };
    // Current pixel position
    this.offset = 0;

    // Set my Neopixel configuration
    this.config = {};

    // Set full brightness, a value from 0 to 255 (default 255)
    this.config.brightness = 255;

    this.config.strip = 'grb';

    // By setting width and height instead of number of leds
    // you may use named pixel mappings.
    // Currently "matrix" and "alternating-matrix" are
    // supported. You may also set the "map" property
    // to a custom Uint32Array to define your own map.
    this.config.width = NUM_LEDS_WIDTH;
    this.config.height = NUM_LEDS_HEIGHT;
    this.config.map = 'alternating-matrix';

    // Configure ws281x
    ws281x.configure(this.config);
  }

  updateBrightness(brightness) {
    // Set full brightness, a value from 0 to 255 (default 255)
    this.MaxBrightness = brightness;
  }

  updateColor(color) {
    // Set full brightness, a value from 0 to 255 (default 255)
    this.color = color;
  }

  setRadius(radius){
    this.brushInstance.setRadius(radius);
  }

  loop() {
    var leds = this.config.width * this.config.height;
    var pixels = new Uint32Array(leds);
    var colorRed = this.color.r * this.MaxBrightness / 255;
    var colorGreen = this.color.g * this.MaxBrightness / 255;
    var colorBlue = this.color.b * this.MaxBrightness / 255;

    for (var i = 0; i < leds; i++) {
      var value = this.brushInstance.getMapValue(this.offset);
      var pixelColor = rgb2Int(value*colorRed,value*colorGreen,value*colorBlue);
      //pixels[i] = pixelColor;
      // Set a specific pixel
      pixels[this.offset] = pixelColor;

      // Move on to next
      this.offset = (this.offset + 1) % leds;
    }
    // Render to strip
    ws281x.render(pixels);
  }

  run() {
    setInterval(this.loop.bind(this), 10);
  }
};

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

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});


function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}
