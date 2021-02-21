const ws281x = require('rpi-ws281x');

const { Circle } = require("./brushes");

const NUM_LEDS_WIDTH = 8;
const NUM_LEDS_HEIGHT = 8;

class LedHandler {

  constructor() {
    this.pixelData = new Uint32Array(NUM_LEDS_WIDTH*NUM_LEDS_HEIGHT);

    this.MaxThumbSlider = 0;
    this.pressureRange = 100;

    this.color = { r:0, g:0, b:0 };
    // Current pixel position
    this.offset = 0;

    // Set my Neopixel configuration
    this.config = {};

    // Set full thumbslider, a value from 0 to 255 (default 255)
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

  updateThumbSlider(thumbslider) {
    this.MaxThumbSlider = thumbslider;
  }

  getCurrentColor(){
    return this.color;
  }

  getCurrentPressure(){
    return this.brushInstance.getCurrentPressure();
  }
  
  updateColor(color) {
    this.color = color;
  }

  updateHexColor(hexcolor) {
    this.updateColor(hexToRgb(hexcolor));
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

  setMaxBrushSizeScale(maxSizeScale){
    this.brushInstance.setMaxBrushSizeScale(maxSizeScale);
  }
  
  showError(){
    var tempColor = this.color;
    var tempPressure = this.getCurrentPressure();
    var tempThumbSlider = this.MaxThumbSlider;

    this.updateHexColor('#ff0000');
    this.setPressure(100);
    this.updateThumbSlider(60);

    for(var i=0;i<=4;i++){
      this.blink();
    }

    this.updateColor(tempColor);
    this.setPressure(tempPressure);
    this.updateThumbSlider(tempThumbSlider);
  }

  loop() {
    var leds = this.config.width * this.config.height;
    var pixels = new Uint32Array(leds);
    var colorRed = this.color.r * this.MaxThumbSlider / 255;
    var colorGreen = this.color.g * this.MaxThumbSlider / 255;
    var colorBlue = this.color.b * this.MaxThumbSlider / 255;

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

  blink(){
    //ledHandlerInstance.setPressure(50);
    for(var i=0; i<= 10;i++){
      this.setPressure(i*10);
      this.loop();
    }
    for(var i=10; i>= 0;i--){
      this.setPressure(i*10);
      this.loop();
    }
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

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

module.exports = {
  LedHandler
};
