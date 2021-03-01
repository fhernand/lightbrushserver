class LEDDriver {

  constructor(width, height) {
    this.width = width;
    this.height = height;
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

    super(width, height, brightness);
    const unicorn = require('rpi-ws281x');
    this.pixelData = new Uint32Array(this.width*this.height);
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
    try{
      this.unicorn.configure(this.config);    
    } catch(error) {
      return undefined;
    }
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
    this.unicorn.render(this.pixelData);
  }  
};

class UnicornHDDriver extends LEDDriver {
  constructor(width, height, brightness) {
    super(16,16,brightness);
    const unicornHD = require('unicornhat-hd');  
    
    try{
      setBrightness(brightness);
    } catch(error){
      return undefined;
    }
  }

  setBrightness(brightness){
    this.unicornHD.setBrightness(brightness);
  }
  
  setPixel(offset, red, green, blue){
    var x = ( offset - 1) % 9;
    var y = ( offset - 1) / 9;
    this.unicornHD.setPixel(x,y,red,green,blue)
  }  
  
  showPixels(){
    this.unicornHD.show(false,false);
  }   
  
};

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}

// ---- trap the SIGINT and reset before exit
//process.on('SIGINT', function () {
//  ws281x.reset();
//  process.nextTick(function () { process.exit(0); });
//});  

module.exports = {
  UnicornDriver, UnicornHDDriver
};
