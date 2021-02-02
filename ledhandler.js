const ws281x = require('rpi-ws281x');

const { Circle } = require("./brushes");

const NUM_LEDS_WIDTH = 8;
const NUM_LEDS_HEIGHT = 8;

class LedHandler {

  constructor() {
    this.pixelData = new Uint32Array(NUM_LEDS_WIDTH*NUM_LEDS_HEIGHT);
    this.blackpixelData = new Uint32Array(NUM_LEDS_WIDTH*NUM_LEDS_HEIGHT);

    this.MaxBrightness = 255;
    this.pressureRange = 1000;

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

    this.setBrush();
  }

  updateBrightness(brightness) {
    // Set full brightness, a value from 0 to 255 (default 255)
    this.MaxBrightness = brightness;
  }

  updateColor(color) {
    // Set full brightness, a value from 0 to 255 (default 255)
    this.color = color;
  }

  setBrush(brush){
    this.brushInstance = null;
    switch(brush) {
      case "1":
      this.brushInstance = new Circle(NUM_LEDS_WIDTH, NUM_LEDS_HEIGHT, this.pressureRange);
      break;
      //case "2":
      // other brush
      //break;
      default:
      this.brushInstance = new Circle(NUM_LEDS_WIDTH, NUM_LEDS_HEIGHT, this.pressureRange);
    }
  }

  setPressure(pressure){
    this.brushInstance.setPressure(pressure);
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

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}

module.exports = {
  LedHandler
};
