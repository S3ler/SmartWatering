function Waterer() {
    this.areas = [];

    this.maximumRange = 10; // m
    this.minimumRange = 0.3; // m

    this.currentX = 0.0;
    this.currentY = 0.0;

    this.waterInProgress = false;
    this.toWaterX = 0.0;
    this.toWaterY = 0.0;
}

Waterer.prototype = {
    setCoordinates: function (x, y) {
        this.x = x;
        this.y = y;
    },
    setName: function (name) {
        this.name = name;
    },
    getName: function () {
        return this.name;
    },
    getAreas: function () {
        return this.areas;
    },
    getArea: function (area) {
        if (area == null) {
            throw new SmartWateringException(area + " is null");
        }
        for (var i = 0; i < this.areas.length; i++) {
            if (this.areas[i] === area) {
                return this.areas[i];
            }
        }
        throw new SmartWateringException(area + " does not exist in " + this);
    },
    addBoundary: function (area, predecessor, newBoundary, sucessor) {
        if (typeof newBoundary === "undefined" && typeof sucessor === "undefined") {
            this.getArea(area).addBoundary(predecessor);
            return;
        }
        if (newBoundary == null) {
            throw new SmartWateringException(area + " is null");
        }
        this.getArea(area).addBoundary(predecessor, newBoundary, sucessor);

        // TODO GIS check
        /*for (var i = 0; i < this.areas; i++) {
         if (this.areas[i] != a) {
         GIS.doesCircleIntersectPolygon(newBoundary, this.area[i])
         }
         }*/

    },
    addArea: function (area) {
        if (area == null) {
            throw new SmartWateringException(area + " is null");
        }
        if (this.areas.indexOf(area) != -1) {
            throw new SmartWateringException(area + " already exists in " + this);
        }
        // TODO GIS AREA GLOBAL CHECK
        this.areas.push(area);
    },
    addPlant: function (area, plant) {
        this.getArea(area).addPlant(plant);
    },
    getPlants: function (area) {
        return this.getArea(area).getPlants();
    },
    getBoundaries: function (area) {
        return this.getArea(area).getBoundaries();
    },
    removeBoundary: function (area, boundary) {
        this.getArea(area).removeBoundary(boundary);
    },
    removePlant: function (area, plant) {
        this.getArea(area).removePlant(plant);
    },
    removeArea: function (area) {
        var a = this.getArea(area);
        var index = this.areas.indexOf(a);
        this.areas.splice(index, 1);
    },
    waterPosition: function (x, y) {
        this.toWaterX = x;
        this.toWaterY = y;
        this.setWateringInProgress(true);
        var that = this;
        //var timeout = setTimeout(function () {that.setWateringInProgress(false), 5000 });
        var timeout = setTimeout(function(){that.setWateringInProgress(false)}, 5000);
    },
    setWateringInProgress: function (waterInProgress) {
        this.waterInProgress = waterInProgress;
    },
    isWateringInProgress: function () {
        return this.waterInProgress;
    },
    getSVG: function () {
        var resul = {
            selected: "asdf",
            normal: "asdf",


        }
    }


};