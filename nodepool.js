/**
 * This Nodepool is used to hold the "nodes", i.e. the points
 * of the mouse. Each node has the following properties:
 *  - time: the time it was recorded
 *  - x,y : the coordinates of the point
 * The size and opacity of each point decreases over time, until
 * it is discarded.
 * 
 * In the implementation, we use a circular buffer of fixed size
 * to avoid creating too many JS objects (at 60 FPS, the creation rate
 * can be quite high !)
 */

 /**
  * Create a nodepool of capacity size.
  */
function Nodepool(size){

    this._nodes = [];
    var max_cap = size || 150;
    console.log("max", max_cap);
    for(var i = 0; i < max_cap; i++){
        this._nodes.push({time:0, x:0, y:0});
    }
    this.start = 0;
    this.stop = 0;
    this.length = 0;
}

/**
 * Add a node.
 * @param {Date} currentTime 
 * @param {number} x 
 * @param {number} y 
 */
Nodepool.prototype.add = function(currentTime, x, y){
    this._nodes[this.stop].time = currentTime;
    this._nodes[this.stop].x = x;
    this._nodes[this.stop].y = y;
    this.stop = (this.stop+1) % this._nodes.length;
    
    if(this.length + 1 == this._nodes.length){
        // max capacity reached
        this.start = (this.start+1) % this._nodes.length;
    }else{
        this.length++;
    }
    console.assert(this.start != this.stop);
}

/**
 * Remove all nodes that are older than 1 second.
 * @param {Date} currentTime 
 */
Nodepool.prototype.removeOld = function(currentTime){
    for(var i = this.start; i != this.stop; ){
        if(1000 < currentTime - this._nodes[i].time){
            this.start = (this.start+1) % this._nodes.length;
            this.length--;
        }
        i = (i+1) % this._nodes.length;
    }

}

/**
 * Get node at index i.
 * @param {number} i 
 */
Nodepool.prototype.get = function(i){
    return this._nodes[(
        this.start + i) % this._nodes.length];
}