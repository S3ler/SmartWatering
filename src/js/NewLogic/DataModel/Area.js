function Area() {
    this.boundaries = [];
    this.plants = [];

    this.waterAmountPerWatering = 10;   // 10 l / m^2
    this.waterFrequency = 3;            // all 3 days

    this.name = "name undefined";
}

Area.prototype = {
    getName: function () {
        return this.name;
    },
    setName: function (name) {
        this.name = name;
    },
    getBoundaries: function () {
        return this.boundaries;
    },
    getBoundary: function (boundary) {
        if (boundary == null) {
            throw new SmartWateringException(boundary + " is null");
        }
        for (var i = 0; i < this.boundaries.length; i++) {
            if (this.boundaries[i] === boundary) {
                return this.boundaries[i];
            }
        }
        throw new SmartWateringException(boundary + " does not exist in " + this);
    },

    checkBoundaryIntersection: function (newBoundary) {
        for (var b in this.boundaries) {
            if (GIS.doesCircleIntersectCircle(b, newBoundary)) {
                throw new GeometricInconsistencyException(b + " and " + newBoundary + " are overlapping.");
            }
        }
        return b;
    },
    addBoundary: function (predecessor, newBoundary, sucessor) {
        if (typeof predecessor !== "undefined" && typeof newBoundary === "undefined" && typeof sucessor === "undefined") {
            if (predecessor == null) {
                throw new SmartWateringException(predecessor + " is null");
            }
            //this.checkBoundaryIntersection(newBoundary);
            if (this.boundaries.indexOf(predecessor) != -1) {
                throw new SmartWateringException(newBoundary + " already exists in " + this);
            }
            this.boundaries.push(predecessor);
            return;
        }
        // untested:
        else if (typeof predecessor !== "undefined" && typeof newBoundary !== "undefined" && typeof sucessor !== "undefined") {
            if (predecessor == null) {
                throw new SmartWateringException(predecessor + " is null");
            }
            if (sucessor == null) {
                throw new SmartWateringException(sucessor + " is null");
            }
            if (newBoundary == null) {
                throw new SmartWateringException(newBoundary + " is null");
            }
            this.getBoundary(predecessor);
            this.getBoundary(sucessor);

            var preIndex = this.boundaries.indexOf(predecessor);
            var sucIndex = this.boundaries.indexOf(sucessor);

            if (preIndex == -1) {
                throw new GeometricInconsistencyException(predecessor + " does not exist in " + this);
            }
            if (sucIndex == -1) {
                throw new GeometricInconsistencyException(sucessor + " does not exist in " + this);
            }
            if (!(Math.abs(preIndex - sucIndex) == 1
                || (preIndex == 0 && sucIndex == (this.boundaries.length - 1))
                || (preIndex == (this.boundaries.length - 1) && sucIndex == 0))) {
                throw new GeometricInconsistencyException(sucessor + " is not next to " + predecessor);
            }

            var toInsertIndex;
            if ((preIndex == 0 || sucIndex == 0)
                && ((sucIndex == (this.boundaries.length - 1)) || (preIndex == (this.boundaries.length - 1))
                && this.boundaries.length != 2)) {
                toInsertIndex = preIndex;
                if (sucIndex < preIndex) {
                    toInsertIndex = sucIndex;
                }
            } else {
                toInsertIndex = preIndex;
                if (sucIndex > preIndex) {
                    toInsertIndex = sucIndex;
                }
            }

            // TODO GIS check
            // this.checkBoundaryIntersection(newBoundary);

            this.boundaries.splice(toInsertIndex, 0, newBoundary);
        } else {
            throw new SmartWateringException("No Valid Method Signature");
        }
    },

    removeBoundary: function (boundary) {
        var b = this.getBoundary(boundary);
        var index = this.boundaries.indexOf(b);
        if (this.boundaries.length > 1) {
            this.boundaries.splice(index, 1);
        }else{
            throw new SmartWateringException(boundary + " is last boundary of " + this);
        }
    },
    removePlant: function (plant) {
        var p = this.getPlant(plant);
        var index = this.boundaries.indexOf(p);
        this.boundaries.splice(index, 1);

    },

    getPlants: function () {
        return this.plants;
    },
    isPlantInArea: function (plant) {
        return GIS.doesCircleIntersectOutline(plant.getGISCircle(), this.getGISOutline());
    },
    checkPlantIntersection: function (plant) {
        for (var p in this.plants) {
            if (!GIS.doesCircleIntersectCircle(p, plant)) {
                throw new GeometricInconsistencyException(p + " and " + plant + " are overlapping.");
            }
        }
    },
    checkPlantInArea: function (plant) {
        if (!this.isPlantInArea(plant)) {
            throw new GeometricInconsistencyException(plant + " is not in " + this);
        }
    },
    addPlant: function (plant) {
        if (plant == null) {
            throw new SmartWateringException(plant + " is null");
        }
        this.checkPlantInArea(plant);
        this.checkPlantIntersection(plant, this.plants);
        this.plants.push(plant);
    },
    getPlant: function (plant) {
        if (plant == null) {
            throw new SmartWateringException(plant + " is null");
        }
        for (var p in this.plants) {
            if (plant == p) {
                return p;
            }
        }
        throw new SmartWateringException(plant + " does not exist in " + this);
    },

    getWaterAmount: function () {
        return this.waterAmountPerWatering;
    },
    setWaterAmount: function (amount) {
        this.waterAmountPerWatering = amount;
    },
    getWaterFrequency: function () {
        return this.waterFrequency;
    },
    setWaterFrequency: function (frequency) {
        return this.waterFrequency = frequency;
    },
    getGISOutline: function () {
        return GIS.createOutline(this.getGISBoundaries());
    },
    getGISBoundaries: function () {
        var GISBoundaries = [];
        for (var i = 0; i < this.boundaries.length; i++) {
            GISBoundaries.push(this.boundaries[i].getGISCircle());
        }
        return GISBoundaries;
    },
    getSVGRepresentations: function () {
        // momentum
        // return a value with outline, inline areas
        // selected representation
        // deleselcted
    }
};