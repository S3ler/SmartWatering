PlantBoundaryFormEnum = {
    CIRCLE:     "circle",
    RECTANGLE:  "rect",
    ELLIPSE:    "ellipse",
    POLYGON:    "polygon",
    PATH:       "path"
};

Plant = function (x, y) {
    this.x = x;
    this.y = y;
    this.name = "none";
    this.plantTypeName = "defaultPlant";
    this.r = 5;
    this.boundaryType = PlantBoundaryFormEnum.CIRCLE;
};


Plant.prototype = {
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
    getPlantTypeName: function () {
        return this.plantTypeName;
    },
    getName: function () {
        return this.name;
    },
    setName: function (name) {
        this.name = name;
    },
    getBoundaryType: function () {
        return this.boundaryType;
    },
    getGISCircle: function () {
        return [this.x, this.y, this.r];
    },
    getSVG: function () {
        var p1 = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        p1.classList.add(this.plantTypeName);
        // p1.setAttribute("id", this);
        p1.setAttribute("cx", this.x);
        p1.setAttribute("cy", this.y);
        p1.setAttribute("r", this.r);
        p1.logicObject = this;

        return p1;
    }
};
