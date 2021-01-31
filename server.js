const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ws281x = require('rpi-ws281x');

const NUM_LEDS_WIDTH = 8;
const NUM_LEDS_HEIGHT = 8;

http.listen(3000, () => {
  console.log('listening on *:3000');
});

app.use(express.static('public'));

class Circle {

  constructor(width){

    this.width = width;
    this.map = new Float32Array(this.width * this.width);
    this.mapCircleQuarter = new Float32Array(this.width * this.width / 4);
    this.anteil = 0;
    this.granularity = 100;
  }
  reset(){
    this.map = new Float32Array(this.width * this.width * 4);
    this.mapCircleQuarter = new Float32Array(this.width * this.width);
  }
  setRadius(radius){
    this.reset();
    this.radius = this.granularity*this.width*radius;
    this.calculateMap();
  }
  calculateMap(){
    for (var i = 0; i < this.width*this.width; i++) {
      this.mapCircleQuarter[i] = this.draw(i);
      console.log(this.mapCircleQuarter[i]);
    }

    for (var i = 0; i < this.width*this.width*4; i++) {
      var x = i % (this.width*2);
      var y = Math.floor(i / (this.width*2));

      if (x > this.width && y > this.width){
        this.map[i] = this.mapCircleQuarter[(this.width - x) + (y-this.width)*this.width]
      }
    }
  }
  getMapValue(i){
    // const x = Math.floor(i / (this.width*2));
    // const y = i % (this.width*2);
    // if (x >= this.width && y >= this.width){
    //   return this.mapCircleQuarter[(x-this.width)*this.width - (y-this.width)];
    // }
    return this.map[i];

  }
  draw(n) {
    this.anteil = 0;
    const x = n % this.width;
    const y = Math.floor(n / this.width);

    const max_i = this.granularity*(x+1);
    const max_j = this.granularity*(y+1);

    for (var i = max_i; i > this.granularity * x; i-- ){
      for (var j = max_j; j > this.granularity * y; j-- ){
        var dist_ij = Math.sqrt( (i * i) + (j * j) );
        var value = dist_ij / this.radius;
        if (i == max_i && j == max_j && value <= 1){
          return 1;

        } else {
          if (value<=1){
            this.anteil++;
          }
        }
      }
    }
    console.log(this.anteil);
    return this.anteil / ( this.granularity * this.granularity );
  }
}

class LedHandler {

  constructor() {
    this.circleInstance = new Circle(NUM_LEDS_WIDTH/2);
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
    //this.config.map = 'alternating-matrix';


    // Configure ws281x
    ws281x.configure(this.config);

    for (var i = 0; i < (NUM_LEDS_WIDTH*NUM_LEDS_HEIGHT); i++) {
      this.blackpixelData[i] = rgb2Int(0,0,0);
    }
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
    this.circleInstance.setRadius(radius);
  }

  loop() {
    var leds = this.config.width * this.config.height;
    var pixels = new Uint32Array(leds);
    var colorRed = this.color.r * this.MaxBrightness / 255;
    var colorGreen = this.color.g * this.MaxBrightness / 255;
    var colorBlue = this.color.b * this.MaxBrightness / 255;

    for (var i = 0; i < leds; i++) {
      var value = this.circleInstance.getMapValue(i);
      var pixelColor = rgb2Int(value*colorRed,value*colorGreen,value*colorBlue);
      pixels[i] = pixelColor;
      // Set a specific pixel
      //pixels[this.offset] = pixelColor;

      // Move on to next
      //this.offset = (this.offset + 1) % leds;
    }
    // Render to strip
    ws281x.render(pixels);
  }

  run() {
    setInterval(this.loop.bind(this), 100);
  }
};

var ledHandlerInstance = new LedHandler();
ledHandlerInstance.setRadius(1);
var brightness = 50;
var color = { r:255, g:215, b:0 };

io.sockets.on('connection', (socket) => {
  socket.emit('brightness', {value: brightness});

  socket.on('brightness', function (data) { //makes the socket react to 'led' packets by calling this function
    brightness = data.value;  //updates brightness from the data object
    ledHandlerInstance.updateBrightness(brightness);
    io.sockets.emit('brightness', {value: brightness}); //sends the updated brightness to all connected clients
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


function clearLEDs(){
  ws281x.render(blackpixelData);
}

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}
