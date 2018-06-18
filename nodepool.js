function Nodepool(size){

    this._nodes = [];
    console.log(size || 150);
    for(var i = 0; i < 150; i++){
        this._nodes.push({time:0, x:0, y:0});
    }
    this.start = 0;
    this.stop = 0;
    this.length = 0;
}

Nodepool.prototype.add = function(currentTime, x, y){
    this._nodes[this.stop].time = currentTime;
    this._nodes[this.stop].x = x;
    this._nodes[this.stop].y = y;
    this.stop = (this.stop+1) % this._nodes.length;
    this.length++;
}

Nodepool.prototype.removeOld = function(currentTime){
    for(var i = this.start; i != this.stop; ){
        if(1000 < currentTime - this._nodes[i].time){
            this.start = (this.start+1) % this._nodes.length;
            this.length--;
        }
        i = (i+1) % this._nodes.length;
    }

}

Nodepool.prototype.get = function(i){
    return this._nodes[(
        this.start + i) % this._nodes.length];
}