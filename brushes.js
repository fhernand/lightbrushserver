class Brush {
  constructor(width, height, pressureRange){
    this.width = width;
    this.height = height;
    this.pressureRange = pressureRange;
    this.granularity = 50;
    this.megamap = [];
    bufferAllMaps();
  }

  bufferAllMaps(){
    for (var i = 0; i < this.pressureRange; i++) {
      setPressure(i);
    }
  }

  calculateMap(){
  }

  draw(n) {
  }

  getMapValue(i){
    if (this.megamap[this.pressure] != null ){
      return this.megamap[this.pressure][i];
    }
  }

  reset(){
  }

  setPressure(pressure){
    this.pressure = pressure;
    this.megamap[this.pressure] = new Float32Array(this.width * this.height);
    this.buffered = false;
    this.calculateMap();
  }
}

class Circle extends Brush {
  constructor(width, height){
    this.anteil = 0;
    this.mapCircleQuarter = new Float32Array(width * height / 4);
    super.constructor(width, height);
  }

  calculateMap(){
    if (this.buffered == false ){
      for (var i = 0; i < this.width*this.height/4; i++) {
        this.mapCircleQuarter[i] = this.draw(i);
      }

      for (var i = 0; i < this.width*this.height; i++) {
        var x = i % (this.width);
        var y = Math.floor(i / (this.height));

        if (x >= this.width/2 && y >= this.height/2){
          var index = (x-this.width/2) + (y-this.height/2)*this.height;

          this.megamap[this.pressure][i] = this.mapCircleQuarter[index]
        } else if (x < this.width/2 && y < this.height/2) {
          var index = (this.width/2-x-1) + (this.height/2-y-1)*this.height/2;
          this.megamap[this.pressure][i] = this.mapCircleQuarter[index];
        } else if (x >= this.width/2 && y < this.height/2) {
          var index = (x-this.width/2) + (this.height/2-y-1)*this.height/2;
          this.megamap[this.pressure][i] = this.mapCircleQuarter[index];
        } else if (x < this.width/2 && y >= this.height/2) {
          var index = (this.width/2-x-1) + (y-this.height/2)*this.height/2;
          this.megamap[this.pressure][i] = this.mapCircleQuarter[index];
        }
      }
      this.buffered = true;
    }
  }

  draw(n) {
    this.anteil = 0;
    const x = n % this.width/2;
    const y = Math.floor(n / this.height/2);

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
    this.mapCircleQuarter = new Float32Array(this.width * this.height);
  }

  setPressure(pressure){
    super.setPressure(pressure);
    this.convertedradius = this.granularity*(this.width/2)*pressure/100;
    this.calculateMap();
  }
}

module.exports = {
    Circle
};
