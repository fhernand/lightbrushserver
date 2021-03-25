class Brush {
  constructor(width, height, pressureRange){
    this.width = width;
    this.height = height;
    this.pressureRange = pressureRange;
    this.granularity = 100;
    this.brightness = 0;
    this.adjustedBrightness = 0;
    this.adjustedPressure = 0;
    this.maxBrightness = 0;
    this.maxBrushSize = 0;
    this.megamap = [];
    this.gradient = false;
    this.glow = false;
    this.stampBrush = false;
    this.readyForStamp = false;
    this.stampArmCount = 0;
    this.maxStampArmCount = 1000;
    this.stampPressureChanged = true;
  }

  bufferAllMaps(){
    for (var i = 0; i < this.pressureRange; i++) {
      this.setPressure(i);
    }
    this.setPressure(0);
  }

  calculateMap(){
  }

  draw(n) {
  }

  isStampBrush(){
   return this.stampBrush; 
  }
  
  isGlowEnabled(){
    return this.glow;
  }
  
  isGradientEnabled(){
    return this.gradient;
  }
  
  isReadyForStamp(){
    if (this.getCurrentPressure() == this.pressureRange && this.readyForStamp == true && this.stampPressureChanged == true){ 
      return this.readyForStamp; 
    } else {      
      return false;
    }
  }
  
  setStampBrush(flag){
    this.stampBrush = flag;
    this.readyForStamp = flag;
    this.stampArmCount = this.maxStampArmCount;
  }
  
  armStamp(){
    if (this.stampArmCount > this.maxStampArmCount){
      this.readyForStamp = true;
      this.stampArmCount = this.maxStampArmCount
    } else {
      this.stampArmCount = this.stampArmCount + 50;
    }
    if (this.getCurrentPressure() < this.pressureRange){
      this.stampPressureChanged = true;
    }
  }
  
  disarmStamp(){
    if (this.stampArmCount < 0 || this.getCurrentPressure() != this.pressureRange){
      this.readyForStamp = false;
      this.stampArmCount = 0;
      this.stampPressureChanged = false;      
    } else {
      this.stampArmCount = this.stampArmCount - 50;
    }
  }  
  
  getMapValue(i){
    if (this.megamap[this.adjustedPressure] != null ){
      return this.megamap[this.adjustedPressure][i];
    }
  }

  getValue(i,j){  
  }
  
  getGlow(i,j){
  }
  
  getGradient(i,j){
  }
  
  setGlow(flag){
    this.glow = flag;
  }

  setGradient(flag){
    this.gradient = flag;
  }
  
  reset(){
  }

  refresh(){
    this.setPressure(this.getCurrentPressure());
    this.setBrightness(this.getCurrentBrightness());
  }  
  
  applyMaxBrightness(){
    this.adjustedBrightness = this.brightness * this.maxBrightness/100;
  }
  
  applyMaxBrushSize(){
    this.adjustedPressure = this.pressure * this.maxBrushSize;
  }  
  
  getCurrentPressure(){
    return this.pressure;
  }
  
  setPressure(pressure){
    this.pressure = pressure;
    this.applyMaxBrushSize();    
    if (this.megamap[this.adjustedPressure] == null ){
      this.megamap[this.adjustedPressure] = [];
      this.buffered = false;
    }
  }

  setMaxBrushSize(maxBrushSize){
    this.maxBrushSize = maxBrushSize;
  }

  setMaxBrightness(maxBrightness){
    this.maxBrightness = maxBrightness;
  } 
  
  setBrightness(brightness){
    this.brightness = brightness;
    this.applyMaxBrightness();
  }
  
  getCurrentMaxBrightness(){
    return this.maxBrightness;
  }  

  getCurrentMaxBrushSize(){
    return this.maxBrushSize;
  }
  
  getCurrentBrightness(){
    return this.brightness;
  }
  
  getCurrentAdjustedBrightness(){
    return this.adjustedBrightness;
  }
}

class Line extends Brush{
  constructor(width, height, pressureRange){
    super(width, height, pressureRange);
    this.maxBrushSize = 0;
    this.anteil = 0;
    this.mapLineHalf = new Float32Array(this.width/2);
    this.bufferAllMaps();
  }

  calculateMap(){
    if (this.buffered == false ){
      for (var i = 0; i < this.height/2; i++) {
        this.mapLineHalf[i] = this.draw(i);
      }

      for (var i = 0; i < this.height; i++) {

        var index = 0;
        if (i >= this.height/2){
          index = i-(this.height/2);
        } else if (i < this.height/2) {
          index = this.height/2 - 1 - i;
        }
         this.megamap[this.adjustedPressure][i+this.height*this.width/2] = this.mapLineHalf[index];
      }
      this.buffered = true;
    }
  }

  draw(n) {
    this.anteil = 0;

    const max_i = this.granularity*(n+1);

    for (var i = max_i; i >= this.granularity*n; i-- ){
        var value = this.getValue(i);
        if (i == max_i && value <= 1){
          return 1 * this.getGradient(i);

        } else {
          if (value<=1){
            this.anteil =+ 1 * this.getGradient(i);
          }
        }
    }
    return this.anteil / this.granularity;
  }

  reset(){
    super.reset();
    this.mapLineHalf = new Float32Array(this.width/2);
  }

  setPressure(pressure){
    super.setPressure(pressure);
    this.convertedradius = this.granularity*(this.height/2)*(this.adjustedPressure/this.pressureRange);
    this.calculateMap();
  }

  setMaxBrushSize(maxBrushSize){
    super.setMaxBrushSize(maxBrushSize);
  }
  
  getValue(i){
    return i / this.convertedradius;
  }
  
  getGradient(i){
    if (this.isGradientEnabled()){
      return 1 / i;
    }
  }
}

class Circle extends Brush {
  constructor(width, height, pressureRange){
    super(width, height, pressureRange);
    this.maxBrushSize = 0;
    this.anteil = 0;
    this.mapCircleQuarter = new Float32Array(this.width * this.height / 4);
    this.bufferAllMaps();
  }

  calculateMap(){
    if (this.buffered == false ){
      for (var i = 0; i < this.width*this.height/4; i++) {
        this.mapCircleQuarter[i] = this.draw(i);
      }

      for (var i = 0; i < this.width*this.height; i++) {
        var x = i % (this.width);
        var y = Math.floor(i / (this.height));
        var index = 0;
        if (x >= this.width/2 && y >= this.height/2){
          index = (x-(this.width/2)) + (y-(this.height/2))*this.height/2;
        } else if (x < this.width/2 && y < this.height/2) {
          index = ((this.width/2)-x-1) + ((this.height/2)-y-1)*this.height/2;
        } else if (x >= this.width/2 && y < this.height/2) {
          index = (x-(this.width/2)) + ((this.height/2)-y-1)*this.height/2;
        } else if (x < this.width/2 && y >= this.height/2) {
          index = ((this.width/2)-x-1) + (y-(this.height/2))*this.height/2;
        }
        this.megamap[this.adjustedPressure][i] = this.mapCircleQuarter[index];
      }
      this.buffered = true;
    }
  }

  draw(n) {
    this.anteil = 0;
    const x = n % (this.width/2);
    const y = Math.floor(n / (this.height/2));

    const max_i = this.granularity*(x+1)-1;
    const max_j = this.granularity*(y+1)-1;

    for (var i = max_i; i >= this.granularity * x; i-- ){
      for (var j = max_j; j >= this.granularity * y; j-- ){
        var value = this.getValue(i,j);
        if (i == max_i && j == max_j && value <= 1){
          return 1 * this.getGradient(i,j);

        } else {
          if (value<=1){
            this.anteil =+ 1 * this.getGradient(i,j);
          }
        }
      }
    }
    return this.anteil / ( this.granularity * this.granularity );
  }

  getValue(i,j){
    var dist_ij = Math.sqrt( (i * i) + (j * j) );
    return (dist_ij / this.convertedradius);
  }
  
  getGradient(i,j){
   if (this.isGradientEnabled()){
    var dist_ij = Math.sqrt( (i * i) + (j * j) );
    return 1 / dist_ij;
   }
  }
  
  reset(){
    super.reset();
    this.mapCircleQuarter = new Float32Array(this.width * this.height / 4);
  }

  setPressure(pressure){
    super.setPressure(pressure);
    this.convertedradius = this.granularity*(this.width/2)*(this.adjustedPressure/this.pressureRange);
    this.calculateMap();
  }

  setMaxBrushSize(maxBrushSize){
    super.setMaxBrushSize(maxBrushSize);
  }

}

class CircleSmall extends Circle {
 constructor(width, height, pressureRange){
    super(width, height, pressureRange);
    this.maxBrushSize = 0.25;
  }
}

class CircleMedium extends Circle {
 constructor(width, height, pressureRange){
    super(width, height, pressureRange);
    this.maxBrushSize = 0.5;
  }
}

class CircleBrightness extends Circle {
  setPressure(pressure){
    if (this.isStampBrush() == false){
      super.setPressure(this.pressureRange);
    } else {
      super.setPressure(pressure);
    }
    this.convertedradius = this.granularity*(this.width/2);
    super.setBrightness(pressure);
    this.calculateMap();
  }
}

class Square extends Circle{
  getValue(i,j){
    if (i <= this.convertedradius && j <= this.convertedradius){
      return 1;
    } else {
      return 2;
    }
  }
}

class Dot extends CircleBrightness {
  calculateMap(){
    if (this.buffered == false ){
        this.megamap[this.adjustedPressure][(this.width*this.height/2) + (this.width/2)] = this.adjustedPressure/this.pressureRange;
      }
      this.buffered = true;
    }

  getMapValue(i) {
    if (this.megamap[this.adjustedPressure] != null){
      return this.megamap[this.adjustedPressure][i];
    }
  }
}

module.exports = {
  Circle,
  CircleSmall,
  CircleMedium,
  CircleBrightness,
  Dot,
  Line,
  Square
};
