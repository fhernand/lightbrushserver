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


var NUM_LEDS = 32;
var ws281x = require('rpi-ws281x-native');
pixelData = new Uint32Array(NUM_LEDS);
blackpixelData = new Uint32Array(NUM_LEDS);
for (var i = 0; i < NUM_LEDS; i++) {
			blackpixelData[i] = rgb2Int(0,0,0);
}
ws281x.init(NUM_LEDS);
ws281x.setBrightness(brightness);

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});



// ---- animation-loop
setInterval(function () {
	if (brightness > 0){

    var currentColor = rgb2Int(2*brightness,2*brightness,2*brightness);
		for (var i = 0; i < NUM_LEDS; i++) {
					pixelData[NUM_LEDS - 1 - i] = currentColor;
			}
		ws281x.render(pixelData);

	} else {
		clearLEDs();
	}
}, 1000 / 30);

function clearLEDs(){
		ws281x.render(blackpixelData);
	}

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}
