function PlantDatabase() {
    this.plants = new Array();
    this.plants.push(new Plant(-1, -1));
}

PlantDatabase.prototype = {
    getPlantTypes: function () {
        return this.plants;
    },
    getHasCode: function () {
        var hashCode = "";
        var i = 0;
        var plantType;
        for (i = 0; i < this.plants.length; i++) {
            plantType = this.plants[i];
            hashCode += plantType.hashCode()+plantType.getPlantTypes();

        }
        return hashCode;
    },
    getInstancesOf: function (toInstanciate, x, y, name) {
        // see: http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
        if(toInstanciate == null) {
            // TODO
        }
        if(name == null) {
            // TODO
        }
        for (var plant in this.plants) {
            if (toInstanciate == plant) {
                var copy = plant.constructor();
                for (var attr in plant) {
                    if (plant.hasOwnProperty(attr)) copy[attr] = plant[attr];
                }
                copy.setName(name);
                copy.setX(x);
                copy.setY(y);
                return copy;
            }
        }
        throw new PlantDatabaseException(toInstanciate + " does not as plant in " + this);
    }
};