const { Circle, CircleBrightness, Dot, Line, Square, SquareBrightness } = require("./brushes");
const { UnicornDriver, UnicornHDDriver } = require("./leddriver");

class LedHandler {
  constructor(module) {
    this.granularity = 0;
    this.num_leds_width = 0;
    this.num_leds_height = 0;
    if (module == "hd"){
      this.num_leds_width = 16;
      this.num_leds_height = 16;
      this.ledDriverInstance = new UnicornHDDriver(this.num_leds_width,this.num_leds_height,1);
      this.granularity = 10;
      console.log("Unicorn Hat HD selected.");
    } else {
      this.num_leds_width = 8;
      this.num_leds_height = 8;      
      this.ledDriverInstance = new UnicornDriver(this.num_leds_width, this.num_leds_height, 1);
      this.granularity = 100;      
      console.log("Unicorn Hat selected.");
    }

    this.pressureRange = 100;
    this.color = { r:0, g:0, b:0 };
    this.offset = 0;
    this.setBrush();
  }
  
  getCurrentColor(){
    return this.color;
  }

  getCurrentPressure(){
    return this.brushInstance.getCurrentPressure();
  }

  getCurrentBrightness(){
    return this.brushInstance.getCurrentBrightness();
  }

  getCurrentAdjustedBrightness(){
    return this.brushInstance.getCurrentAdjustedBrightness();
  }

  getCurrentMaxBrightness(){
    return this.brushInstance.getCurrentMaxBrightness();
  }

  getCurrentMaxBrushSize(){
    return this.brushInstance.getCurrentMaxBrushSize();
  }

  setBrightness(brightness) {
    this.brushInstance.setBrightness(brightness);
  }
  
  setMaxBrightness(maxBrightness) {
    this.brushInstance.setMaxBrightness(maxBrightness);
  }  

  setColor(color) {
    this.color = color;
  }

  setHexColor(hexcolor) {
    this.setColor(hexToRgb(hexcolor));
  }
  
  setStampBrush(flag){
   this.brushInstance.setStampBrush(flag); 
  }
  
  setGradient(flag){
   this.brushInstance.setGradient(flag); 
  }
  
  setGlow(flag){
   this.brushInstance.setGlow(flag); 
  }  

  setBrush(brush){
      var tempMaxBrightness = 100;
      var tempBrightness = 100;
      var tempMaxBrushSize = 100;    
    if (this.brushInstance != null){
      tempMaxBrightness = this.getCurrentMaxBrightness();
      tempBrightness = this.getCurrentBrightness();
      tempMaxBrushSize = this.getCurrentMaxBrushSize();
    } 
    this.brushInstance = null;
    switch(brush) {
      case "1":
        this.brushInstance = new Circle(this.ledDriverInstance.width, this.ledDriverInstance.height, this.pressureRange, this.granularity);
        break;
      case "2":
        this.brushInstance = new Line(this.ledDriverInstance.width, this.ledDriverInstance.height, this.pressureRange, this.granularity);
        break;
      case "3":
        this.brushInstance = new CircleBrightness(this.ledDriverInstance.width, this.ledDriverInstance.height, this.pressureRange, this.granularity);
        break;
      case "4":
        this.brushInstance = new Dot(this.ledDriverInstance.width, this.ledDriverInstance.height, this.pressureRange, this.granularity);
        break;
      case "5":
        this.brushInstance = new Square(this.ledDriverInstance.width, this.ledDriverInstance.height, this.pressureRange, this.granularity);
        break;  
      case "6":
        this.brushInstance = new SquareBrightness(this.ledDriverInstance.width, this.ledDriverInstance.height, this.pressureRange, this.granularity);
        break;         
      default:
      this.brushInstance = new Circle(this.ledDriverInstance.width, this.ledDriverInstance.height, this.pressureRange, this.granularity);
    }     
    this.setMaxBrushSize(tempMaxBrushSize);
    if(brush != "3" && brush != "6") {
      this.setMaxBrightness(tempMaxBrightness);
      this.setBrightness(tempBrightness);    
    }
    this.brushInstance.refresh();    
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
    var tempBrightness = this.getCurrentBrightness();

    this.setHexColor('#ff0000');
    this.setPressure(100);
    this.setBrightness(60);

    for(var i=0;i<=4;i++){
      this.blink();
    }

    this.setColor(tempColor);
    this.setPressure(tempPressure);
    this.setBrightness(tempBrightness);
  }

  loop() {
    if (this.ledDriverInstance != undefined){
      var leds = this.ledDriverInstance.width * this.ledDriverInstance.height;
      var brightness = this.getCurrentAdjustedBrightness();
      var colorRed = this.color.r * brightness / 100;
      var colorGreen = this.color.g * brightness / 100;
      var colorBlue = this.color.b * brightness / 100;

      for (var i = 0; i < leds; i++) {
        var value = this.brushInstance.getMapValue(this.offset);
        this.ledDriverInstance.setPixel(this.offset, value*colorRed, value*colorGreen, value*colorBlue);

        // Move on to next
        this.offset = (this.offset + 1) % leds;
      }

      if (!this.brushInstance.isStampBrush()){
        this.ledDriverInstance.showPixels();
      } else {
        if (this.brushInstance.isReadyForStamp() == true){
          this.ledDriverInstance.showPixels();
          this.brushInstance.disarmStamp();  
        } else {
          this.ledDriverInstance.clearPixels();
          this.brushInstance.armStamp(); 
        }   
      }
    }
  }

  run() {
    setInterval(this.loop.bind(this), 10);
  }

  blink(){
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
