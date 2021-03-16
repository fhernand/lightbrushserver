class Brush {
  constructor(width, height, pressureRange){
    this.width = width;
    this.height = height;
    this.pressureRange = pressureRange;
    this.granularity = 100;
    this.brightness = 100;
    this.adjustedBrightness = 100;
    this.adjustedPressure = 100;
    this.maxBrightness = 1.0;
    this.maxBrushSize = 1.0;
    this.megamap = [];
    this.isStampBrush = false;
    this.readyForStamp = false;
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
   return this.isStampBrush; 
  }
  
  isReadyForStamp(){
   return this.readyForStamp; 
  }
  
  setStampBrush(active){
    this.isStampBrush = active;
  }
  
  armStamp(){
    if (this.stampArmCount >= 10 && this.pressure == this.pressureRange){
      this.readyForStamp = true;
    } else {
      this.stampArmCount++;
    }
  }
  
  disarmStamp(){
    if (this.stampArmCount <= 0 || this.pressure == 0){
      this.readyForStamp = true;
    } else {
      this.stampArmCount--;
    }
  }  
  
  getMapValue(i){
    if (this.megamap[this.adjustedPressure] != null ){
      return this.megamap[this.adjustedPressure][i];
    }
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
    this.maxBrushSize = 1.0;
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
        var value = i / this.convertedradius;
        if (i == max_i && value <= 1){
          return 1;

        } else {
          if (value<=1){
            this.anteil++;
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
}

class Circle extends Brush {
  constructor(width, height, pressureRange){
    super(width, height, pressureRange);
    this.maxBrushSize = 1.0;
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
        var dist_ij = Math.sqrt( (i * i) + (j * j) );
        var value = dist_ij / this.convertedradius;
        if (i == max_i && j == max_j && value <= 1){
          return 1;

        } else {
          if (value<=1){
            this.anteil++;
          }
        }
      }
    }
    return this.anteil / ( this.granularity * this.granularity );
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
    super.setPressure(this.pressureRange);
    this.convertedradius = this.granularity*(this.width/2);
    super.setBrightness(pressure);
    this.calculateMap();
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
  Line
};
