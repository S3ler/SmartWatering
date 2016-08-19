Garden = function () {
    this.waterers = new Array();
    addDummyWaterers(this.waterers);
};

function addDummyWaterers(watererArray) {
    for (var i = 1; i < 6; i++) {
        var waterer = new Waterer();
        waterer.setCoordinates(i * 5, i * 5);
        waterer.setName("waterer" + i);
        watererArray.push(waterer);
    }
}

Garden.prototype = {
    setKey: function (key) {
        this.key = key;
    },
    getKey: function () {
        return this.key;
    },
    getWaterer:function(waterer){
        if (waterer == null) {
            throw new SmartWateringException(waterer + " is null");
        }
        for(var i = 0; i < this.waterers.length; i++) {
            if (this.waterers[i] === waterer) {
                return this.waterers[i];
            }
        }
        throw new SmartWateringException(waterer + " does not exist in " + this);
    },
    addBoundary: function (waterer, area, predecessor, newBoundary, sucessor) {
        if (typeof newBoundary === "undefined" && typeof sucessor === "undefined") {
            this.getWaterer(waterer).addBoundary(area, predecessor);
            return;
        }
        this.getWaterer(waterer).addBoundary(area, predecessor, newBoundary, sucessor);
    },
    addArea: function (waterer, area) {
        this.getWaterer(waterer).addArea(area);
    },
    addPlant: function (waterer, area, plant) {
        this.getWaterer(waterer).addArea(area, plant);
    },
    getWaterers: function () {
        return this.waterers;
    },
    getAreas: function (waterer) {
        return this.getWaterer(waterer).getAreas();
    },
    getPlants: function (waterer, area) {
        return this.getWaterer(waterer).getPlants(area);
    },
    getBoundaries: function (waterer, area) {
        return this.getWaterer(waterer).getBoundaries(area);
    },

    removeArea: function (waterer, area) {
        this.getWaterer(waterer).removeArea(area);
    },
    removeBoundary: function (waterer, area, boundary) {
        this.getWaterer(waterer).removeBoundary(area, boundary);
    },
    removePlant: function (waterer, area, plant) {
        this.getWaterer(waterer).removePlant(area, plant)
    },
    waterPosition:function (waterer, x, y) {
        this.getWaterer(waterer).waterPosition(x, y);
    }
};