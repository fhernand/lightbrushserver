class Brush {

  constructor(width){

    this.width = width;
    this.map = new Float32Array(this.width * this.width * 4);
    this.mapCircleQuarter = new Float32Array(this.width * this.width);
    this.anteil = 0;
    this.granularity = 50;
    this.megamap = [];
  }
  reset(){
    this.map = new Float32Array(this.width * this.width * 4);
    this.mapCircleQuarter = new Float32Array(this.width * this.width);
  }
  setRadius(radius){
    this.reset();
    this.radius = radius;
    this.convertedradius = this.granularity*this.width*radius/100;
    this.megamap[this.radius] = new Float32Array(this.width * this.width * 4);
    this.buffered = false;
    this.calculateMap();
  }
  calculateMap(){
    if (this.buffered == false ){
      for (var i = 0; i < this.width*this.width; i++) {
        this.mapCircleQuarter[i] = this.draw(i);
      }

      for (var i = 0; i < this.width*this.width*4; i++) {
        var x = i % (this.width*2);
        var y = Math.floor(i / (this.width*2));

        if (x >= this.width && y >= this.width){
          var index = (x-this.width) + (y-this.width)*this.width;

          this.megamap[this.radius][i] = this.mapCircleQuarter[index]
        } else if (x < this.width && y < this.width) {
          var index = (this.width-x-1) + (this.width-y-1)*this.width;
          this.megamap[this.radius][i] = this.mapCircleQuarter[index];
        } else if (x >= this.width && y < this.width) {
          var index = (x-this.width) + (this.width-y-1)*this.width;
          this.megamap[this.radius][i] = this.mapCircleQuarter[index];
        } else if (x < this.width && y >= this.width) {
          var index = (this.width-x-1) + (y-this.width)*this.width;
          this.megamap[this.radius][i] = this.mapCircleQuarter[index];
        }
      }
      this.buffered = true;
    }
  }
  getMapValue(i){
    if (this.megamap[this.radius] != null ){
      return this.megamap[this.radius][i];
    }

  }
  draw(n) {
    this.anteil = 0;
    const x = n % this.width;
    const y = Math.floor(n / this.width);

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
}

module.exports = {
    Brush
};
