const unicorn = require('rpi-ws281x');
const unicornHD = require('unicornhat-hd');

//const { Circle, CircleSmall, CircleMedium, Line } = require("./brushes");

//const NUM_LEDS_WIDTH = 8;
//const NUM_LEDS_HEIGHT = 8;

class LEDDriver {

  constructor(width, height) {
  }
  
  setBrightness(brightness){
  }
  
  setPixel(offset, red, green, blue){
  }
  
  showPixels(){
  }
  
};

class UnicornDriver extends LEDDriver {
  constructor(width, height, brightness) {
    this.pixelData = new Uint32Array(NUM_LEDS_WIDTH*NUM_LEDS_HEIGHT);
    // Set Neopixel configuration
    this.config = {};

    // Set brightness, a value from 0 to 255 (default 255)
    this.config.brightness = setBrightness(brightness);

    this.config.strip = 'grb';

    // By setting width and height instead of number of leds
    // you may use named pixel mappings.
    // Currently "matrix" and "alternating-matrix" are
    // supported. You may also set the "map" property
    // to a custom Uint32Array to define your own map.
    this.config.width = width;
    this.config.height = height;
    this.config.map = 'alternating-matrix';

    // Configure ws281x
    ws281x.configure(this.config);    
  }

  setBrightness(brightness){
    return Math.floor(brightness*255);
  }
  
  setPixel(offset, red, green, blue){
    var value = this.brushInstance.getMapValue(this.offset);
    var pixelColor = rgb2Int(value*red,value*green,value*blue);
    this.pixelData[offset] = pixelColor;
  }  
  
  showPixels(){
    ws281x.render(this.pixelData);
  }  
  
};

class UnicornHDDriver extends LEDDriver {
  
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
