const { Circle, CircleSmall, CircleMedium, Line } = require("./brushes");
const { UnicornDriver, UnicornHDDriver } = require("./leddriver");

const NUM_LEDS_WIDTH = 8;
const NUM_LEDS_HEIGHT = 8;

class LedHandler {

  constructor(module) {
    if (module == "hd"){
      this.ledDriverInstance = new UnicornHDDriver(16,16,1);
      console.log("Unicorn Hat HD selected.");
    } else {
      this.ledDriverInstance = new UnicornDriver(NUM_LEDS_WIDTH, NUM_LEDS_HEIGHT, 1);
      console.log("Unicorn Hat selected.");
    }
    
    this.MaxThumbSlider = 0;
    this.pressureRange = 100;
    this.color = { r:0, g:0, b:0 };
    this.offset = 0;
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
      case "2":
        this.brushInstance = new CircleSmall(NUM_LEDS_WIDTH, NUM_LEDS_HEIGHT, this.pressureRange);
        break;
      case "3":
        this.brushInstance = new CircleMedium(NUM_LEDS_WIDTH, NUM_LEDS_HEIGHT, this.pressureRange);
        break; 
      case "4":
        this.brushInstance = new Line(NUM_LEDS_WIDTH, NUM_LEDS_HEIGHT, this.pressureRange);
        break;         
      default:
      this.brushInstance = new Circle(NUM_LEDS_WIDTH, NUM_LEDS_HEIGHT, this.pressureRange);
    }
  }

  setPressure(pressure){
    this.brushInstance.setPressure(pressure);
  }

  setMaxBrushSize(brushMaxSize){
    this.brushInstance.setMaxBrushSize(brushMaxSize);
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
    if(this.ledDriverInstance != undefined){
      var leds = this.ledDriverInstance.width * this.ledDriverInstance.height;

      var colorRed = this.color.r * this.MaxThumbSlider / 255;
      var colorGreen = this.color.g * this.MaxThumbSlider / 255;
      var colorBlue = this.color.b * this.MaxThumbSlider / 255;

      for (var i = 0; i < leds; i++) {    
        var value = this.brushInstance.getMapValue(this.offset);
        if (value != undefined){
          console.log(value);

          this.ledDriverInstance.setPixel(value[1], value[0]*colorRed, value[0]*colorGreen, value[0]*colorBlue);

          // Move on to next
          this.offset = (this.offset + 1) % leds;
        }
      }

      this.ledDriverInstance.showPixels();
    }
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
