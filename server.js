const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

http.listen(3000, () => {
  console.log('listening on *:3000');
});

app.use(express.static('public'));

var brightness = 0;

io.sockets.on('connection', (socket) => {
    socket.emit('led', {value: brightness});

    socket.on('led', function (data) { //makes the socket react to 'led' packets by calling this function
        brightness = data.value;  //updates brightness from the data object

        io.sockets.emit('led', {value: brightness}); //sends the updated brightness to all connected clients
    });
});


var ws281x = require('rpi-ws281x');

  var NUM_LEDS_WIDTH = 8;
  var NUM_LEDS_HEIGHT = 8;

class ledHandler {
  pixelData = new Uint32Array(NUM_LEDS_WIDTH*NUM_LEDS_HEIGHT);
  blackpixelData = new Uint32Array(NUM_LEDS_WIDTH*NUM_LEDS_HEIGHT);
    constructor() {
        // Current pixel position
        this.offset = 0;

        // Set my Neopixel configuration
        this.config = {};

        // Set full brightness, a value from 0 to 255 (default 255)
               this.config.brightness = 255;

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

        for (var i = 0; i < (NUM_LEDS_WIDTH*NUM_LEDS_HEIGHT); i++) {
        			blackpixelData[i] = rgb2Int(0,0,0);
        }
    }

    loop() {
        var leds = this.config.width * this.config.height;
        var pixels = new Uint32Array(leds);

        // Set a specific pixel
        pixels[this.offset] = 0xFF0000;

        // Move on to next
        this.offset = (this.offset + 1) % leds;

        // Render to strip
        ws281x.render(pixels);
    }

    run() {
        // Loop every 100 ms
        setInterval(this.loop.bind(this), 100);
    }
};


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
