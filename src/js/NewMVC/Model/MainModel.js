function MainModel(smartWateringService) {
    this.service = smartWateringService;
    this.gardenKey = this.service.createGarden();
    if (this.gardenKey != null) {
        // alert("garden with key: "+this.gardenKey+ " was created.")
    }
    this.currentWaterer = this.service.getWaterers()[0];
    if (this.currentWaterer != null) {
        // alert("garden with key: "+this.currentWaterer.getName()+ " was chosen.")
    }
    this.observers = [];
    this.tempCircleCounter = 1;
    this.tempAreaCounter = 1;
    this.circleAreaCounter = 1;
}
MainModel.prototype = {
    addObserver: function (observer) {
        this.observers.push(observer);
    },
    removeObserver: function (observer) {
        var index = this.observers.indexOf(observer);
        if (index != -1) {
            this.observers.splice(index, 1);
        }
    },
    waterPosition: function (x, y) {
        this.service.waterPosition(this.currentWaterer, x, y);
        this.notifyObserver();
    },
    isWateringInProgress:function () {
        return this.currentWaterer.isWateringInProgress();
    },
    getToWaterPosition:function () {
        return {toWaterX: this.currentWaterer.toWaterX, toWaterY: this.currentWaterer.toWaterY};
    },
    getNewTempCircleName: function () {
        return "Markierung #" + this.tempCircleCounter++;
    },
    getNewTempAreaName: function () {
        return "Fläche #" + this.tempAreaCounter++;
    },
    getNewCircleAreaName: function () {
        return "Fläche #" + this.circleAreaCounter++;
    },
    notifyObserver: function (updatedObject) {
        var i;
        if (typeof updatedObject !== "undefined") {
            for (i = 0; i < this.observers.length; i++) {
                this.observers[i].update(this, updatedObject);
            }
        } else {
            for (i = 0; i < this.observers.length; i++) {
                this.observers[i].update(this, null);
            }
        }
    },
    getAreas: function () {
        return this.service.getAreas(this.currentWaterer);
    },
    saveNewArea: function (circles) {
        var newArea = new Area();
        newArea.setName(this.getNewCircleAreaName());
        var boundary;
        for (var i = 0; i < circles.length; i++) {
            boundary = new Boundary(circles[i][0], circles[i][1]);
            boundary.setR(circles[i][2]);
            boundary.setName(circles[i][3]);
            newArea.addBoundary(boundary);
        }
        this.service.addArea(this.currentWaterer, newArea);
        this.notifyObserver();
    },
    deleteArea: function(circleArea){
        this.service.removeArea(this.currentWaterer, circleArea.APIarea);
        this.notifyObserver();
    },
    removeCircleAreaBoundary: function (circleArea, beforeCircleAreaBoundary, toRemoveCircleAreaBoundary, afterCircleAreaBoundary) {
        var toRemoveBoundary = toRemoveCircleAreaBoundary.APIboundary;
        var area = circleArea.APIarea;

        this.service.removeBoundary(this.currentWaterer, area, toRemoveBoundary);

        this.notifyObserver();
    },
    addSimpleTempCircleBoundary: function (circleArea, beforeCircleAreaBoundary, toAddSimpleTempCircleBoundary, afterCircleAreaBoundary) {
        var x, y, r, name, newBoundary, area;
        if (typeof toAddSimpleTempCircleBoundary == "undefined" && typeof afterCircleAreaBoundary == "undefined") {
            x = beforeCircleAreaBoundary.getX();
            y = beforeCircleAreaBoundary.getY();
            r = beforeCircleAreaBoundary.getRadius();
            name = beforeCircleAreaBoundary.getName();
            newBoundary = new Boundary(x, y);
            newBoundary.setR(r);
            newBoundary.setName(name);
            area = circleArea.APIarea;

            this.service.addBoundary(this.currentWaterer, area, newBoundary);
        } else {
            x = toAddSimpleTempCircleBoundary.getX();
            y = toAddSimpleTempCircleBoundary.getY();
            r = toAddSimpleTempCircleBoundary.getRadius();
            name = toAddSimpleTempCircleBoundary.getName();
            newBoundary = new Boundary(x, y);
            newBoundary.setR(r);
            newBoundary.setName(name);

            area = circleArea.APIarea;
            var predecessor = beforeCircleAreaBoundary.APIboundary;
            var sucessor = afterCircleAreaBoundary.APIboundary;

            this.service.addBoundary(this.currentWaterer, area, predecessor, newBoundary, sucessor);
        }




        this.notifyObserver();
    }
};
