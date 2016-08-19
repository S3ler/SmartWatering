Boundary = function (x, y) {
    this.x = x;
    this.y = y;
    this.name = "name undefined";
    this.r = 2;
};


Boundary.prototype = {
    getX: function () {
        return this.x;
    },
    setX: function (x) {
        this.x = x;
    },
    getY: function () {
        return this.y;
    },
    setY: function (y) {
        this.y = y;
    },
    getR: function () {
        return this.r;
    },
    setR: function (r) {
        this.r = r;
    },
    getName: function () {
        return this.name;
    },
    setName: function (name) {
        this.name = name;
    },
    getGISCircle: function () {
      return [this.x, this.y, this.r];
    },
    getSVGRepresentation: function () {
        var p1 = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        p1.setAttribute("id", this.hashCode());
        p1.setAttribute("cx", this.x);
        p1.setAttribute("cy", this.y);
        p1.setAttribute("r", this.r);
        p1.boundary = this;
        return p1;
    }
};
