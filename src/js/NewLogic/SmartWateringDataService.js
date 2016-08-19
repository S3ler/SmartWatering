function SmartWateringDataService() {
    this.garden = null;
    this.plantDatabase = new PlantDatabase();
}


SmartWateringDataService.prototype = {
    loadGarden: function (key) {
        if (typeof(Storage) !== "undefined") {
            var el = localStorage.getItem(key);
            if (el != null) {
                this.garden = el;
                return true;
            }
            return false;
        } else {
            alert("Sorry! No Web Storage support..");
        }
    },
    saveGarden: function () {
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem(this.garden.getKey(), this.garden);
            return this.garden.getKey();
        } else {
            alert("Sorry! No Web Storage support..");
        }
    },
    createGarden: function () {
        if (typeof(Storage) !== "undefined") {
            var el;
            var g = "garden";
            for (var i = 0; i < 100; i++) {
                el = localStorage.getItem(g + i);
                if (el == null) {
                    this.garden = new Garden();
                    this.garden.setKey(g + i);
                    return (g + i);
                }
            }
            return null;
        } else {
            alert("Sorry! No Web Storage support..");
        }
    },
    listGardenKeys: function () {
        if (typeof(Storage) !== "undefined") {
            var result = new Array();
            var el;
            var g = "garden";
            for (var i = 0; i < 100; i++) {
                el = localStorage.getItem(g + i);
                if (el != null) {
                    result.push(el.getKey());
                }
            }
            return result;
        } else {
            alert("Sorry! No Web Storage support..");
        }
    },

    getPlantTypes: function () {
        return this.plantDatabase.getPlantTypes();
    },
    getInstanceOfPlant: function (plant) {
        return this.plantDatabase.getInstancesOf(plant);
    },
    
    waterPosition: function (waterer, x, y) {
        return this.garden.waterPosition(waterer, x, y);
    },

    addBoundary: function (waterer, area, predecessor, newBoundary, sucessor) {
        if (typeof newBoundary === "undefined" && typeof sucessor === "undefined") {
            this.garden.addBoundary(waterer, area, predecessor);
            return;
        }
        this.garden.addBoundary(waterer, area,predecessor, newBoundary,sucessor);
    },
    addArea: function (waterer, area) {
        this.garden.addArea(waterer, area);
    },
    addPlant: function (waterer, area, plant) {
        this.garden.addPlant(waterer, area, plant);
    },

    getWaterers: function () {
        return this.garden.getWaterers();
    },
    getAreas: function (waterer) {
        return this.garden.getAreas(waterer)
    },
    getPlants: function (waterer, area) {
        this.garden.getPlants(waterer, area);
    },
    getBoundaries: function (waterer, area) {
        this.garden.getBoundaries(waterer, area);
    },

    removeArea: function (waterer, area) {
        this.garden.removeArea(waterer, area);
    },
    removeBoundary: function (waterer, area, boundary) {
        this.garden.removeBoundary(waterer, area, boundary);
    },
    removePlant: function (waterer, area, plant) {
        this.garden.removePlant(waterer, area, plant);
    },

    changePosition: function (waterer, area, boundary, newX, newY) {
        this.garden.changePosition(waterer, area, boundary, newx, newY);
    },
    changeRadius: function (waterer, area, boundary, newRadius) {
        this.garden.changePosition(waterer, area, boundary, newRadius);
    }
};