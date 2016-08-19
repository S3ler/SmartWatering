function MainView(mainController) {
    this.controller = mainController;


    this.mapHeight = 100 * 1000; // in mm
    this.mapWidth = 100 * 1000; // in mm
    this.unitToMeter = 1000; // 1000mm => 1m
    this.meterToUnit = 0.0001; // 1m => 1000mm

    this.tempCircleBoundaries = [];
    this.boundaryInfoBox = null;
    this.areaInfoBox = null;
    this.currentSimpleCircleArea = null;
    this.circleAreaInfoBox = null;
    this.circleAreas = [];
    this.waterer = null;
    this.simpleTempCircleBoundaryModificationInfoBox = null;
}

MainView.prototype = {
    setController: function (controller) {
        this.controller = controller;
        this.mapBackground.setController(this.controller);
        for (var i = 0; i < this.tempCircleBoundaries.length; i++) {
            this.tempCircleBoundaries[i].setController(this.controller);
        }
        for (var i = 0; i < this.circleAreas.length; i++) {
            this.circleAreas[i].setController(this.controller);
        }
    },
    show: function (svgMap) {
        // TODO check
        this.svgMapContainer = document.getElementById("svg_map_container");
        this.svgMapContainer.style.height = "98vh";

        if (typeof svgMap === "undefined") {
            this.svgMap = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
            this.svgMap.setAttribute("id", "map");
            this.svgMap.setAttribute("width", "100%");
            this.svgMap.setAttribute("height", "100%");
            this.svgMap.style.margin = "1px";
            this.svgMap.style.border = "1px";
            this.svgMap.style.borderStyle = "solid";
            this.svgMap.style.borderColor = "black";

            this.svgMapContainer.appendChild(this.svgMap);

            this.mapBackground = new MapBackground(this.svgMap, this.mapHeight, this.mapWidth, this.controller);

            this.waterer = new SVGWaterer(this.svgMap, this.controller);

        }

        confirm("Der Regner wird Anfangs immer nach Norden ausgerichtet. \n" +
            "Sollten Sie eine Positionen bewässern achten Sie darauf nicht zwischen Regner und der Position zu stehen.\n" +
            "Sonst werden Sie nass!");

    },
    /*resetMapBackground: function () {
     this.mapBackground = new MapBackground(this.svgMap, this.mapHeight, this.mapWidth, this.controller);
     },*/
    update:function(updatedObject, pushedObject){
        if (typeof updatedObject.getAreas !== 'undefined' && typeof updatedObject.getAreas === 'function') {

            var areas = updatedObject.getAreas();
            for (var i = this.circleAreas.length - 1; i >= 0; i--) {
                this.circleAreas[i].removeFromMap();
            }
            var circleArea;
            this.circleAreas = [];
            for (var i = 0; i < areas.length; i++) {
                circleArea = new CircleArea(this.svgMap, areas[i], this.controller);
                circleArea.redraw();
                this.circleAreas.push(circleArea);
            }
            if (this.boundaryInfoBox != null && this.boundaryInfoBox.isShown()) {
                this.boundaryInfoBox.hide();
                this.boundaryInfoBox.show();
            }
            if (this.areaInfoBox != null && this.areaInfoBox.isShown()) {
                this.areaInfoBox.hide();
                this.areaInfoBox.show();
            }
            if (this.circleAreaInfoBox != null && this.circleAreaInfoBox.isShown()) {
                this.circleAreaInfoBox.hide();
                this.circleAreaInfoBox.show();
            }
        }
        if(updatedObject instanceof MainModel) {
            if(updatedObject.isWateringInProgress()) {
                var toWaterPosition = updatedObject.getToWaterPosition();
                this.waterer.startWatering(toWaterPosition.toWaterX, toWaterPosition.toWaterY, 200);
            }
        }
    },
    createAndWaterTempBoundary: function (x, y) {
        this.tempCircleBoundaries.push(new SimpleTempCircleBoundary(this.svgMap, x, y, this.controller));
        this.controller.waterPosition(x, y);
    },
    createTempBoundary: function (x, y, r) {
        var newTempCirle = new SimpleTempCircleBoundary(this.svgMap, x, y, this.controller.getNewTempCircleName(), this.controller);
        if (typeof r !== "undefined") {
            newTempCirle.setRadius(r);
        }
        this.tempCircleBoundaries.push(newTempCirle);
    },
    createTempArea: function (firstAreaBoundaries, circleAreaName) {
        if (typeof circleAreaName !== "undefined") {
            if (typeof firstAreaBoundaries === 'string' || firstAreaBoundaries instanceof String) {
                this.currentSimpleCircleArea = new SimpleTempCircleArea(this.svgMap, firstAreaBoundaries, this.controller);
            }
            this.currentSimpleCircleArea = new SimpleTempCircleArea(this.svgMap, this.controller.getNewTempAreaName(), this.controller);
        } else {
            this.currentSimpleCircleArea = new SimpleTempCircleArea(this.svgMap, circleAreaName, this.controller);
        }
        if (firstAreaBoundaries !== null && firstAreaBoundaries.constructor !== Array) {
            this.controller.selectedTempArea(firstAreaBoundaries);
        } else if (firstAreaBoundaries !== null && firstAreaBoundaries.constructor === Array) {
            for (var i = 0; i < firstAreaBoundaries.length; i++) {
                this.controller.selectedTempArea(firstAreaBoundaries[i]);
            }
        }
    },
    addToCurrentSimpleCircleArea: function (simpleCircleArea) {
        this.currentSimpleCircleArea.addCircleBoundary(simpleCircleArea);
    },
    removeFromCurrentSimpleCircleArea: function (simpleCircleArea) {
        this.currentSimpleCircleArea.removeCircleBoundary(simpleCircleArea);
    },
    deselectAllObjects: function () {
        var selectedObjects = this.svgMap.getElementsByClassName("selected");
        for (var i = 0; i < selectedObjects.length; i++) {
            selectedObjects[i].classList.remove("selected");
        }
    },
    removeCircleBoundary: function (simpleCircleBoundary) {
        this.controller.unselectedTempArea(simpleCircleBoundary);
        simpleCircleBoundary.removeFromMap();
    },
    removeCircleArea: function (simpleCircleArea) {
        simpleCircleArea.removeFromMap();
        //this.hideTempAreaInfoBox();
    },
    removeCircleAreaAndBoundaries: function (simpleCircleArea) {
        simpleCircleArea.removeFromMap();
    },
    showTempCircleBoundaryInfoBox: function (simpleCircleBoundary) {
        // this.boundaryInfoBox = new TempCircleInfoBox(this.svgMap, simpleCircleBoundary.getX() + simpleCircleBoundary.getRadius() + 200, simpleCircleBoundary.getY(), this.controller);
        this.boundaryInfoBox = new InfoBox(this.svgMap, simpleCircleBoundary.getX() + simpleCircleBoundary.getRadius() + 200, simpleCircleBoundary.getY(), this.controller);
        this.boundaryInfoBox.setCircleBoundary(simpleCircleBoundary);
    },
    replaceTempCircleBoundaryInfoBox: function (simpleCircleBoundary) {
        // this.boundaryInfoBox = new TempCircleInfoBox(this.svgMap, this.boundaryInfoBox.getX(), this.boundaryInfoBox.getY(), this.controller);
        this.boundaryInfoBox = new InfoBox(this.svgMap, this.boundaryInfoBox.getX(), this.boundaryInfoBox.getY(), this.controller);
        this.boundaryInfoBox.setCircleBoundary(simpleCircleBoundary);
    },
    hideTempCircleBoundaryInfoBox: function () {
        // CLEAR what happens if we remove it twice?
        if (this.boundaryInfoBox != null) {
            this.boundaryInfoBox.hide();
        }
    },
    replaceTempCircleBoundaryInfoBoxByCurrentTempAreaInfoBox: function () {
        this.areaInfoBox = new CreateNewCircleAreaAreaDialog(this.svgMap, this.boundaryInfoBox.getX(), this.boundaryInfoBox.getY(), this.controller);
        this.areaInfoBox.setArea(this.currentSimpleCircleArea);
    },
    showTempAreaInfoBox: function (simpleCircleArea) {
        this.areaInfoBox = new CreateNewCircleAreaAreaDialog(this.svgMap, simpleCircleArea.getMaximumX() + 200, simpleCircleArea.getY(), this.controller);
        this.areaInfoBox.setArea(simpleCircleArea);
    },
    replaceTempAreaInfoBox: function (simpleCircleArea) {
        this.areaInfoBox = new CreateNewCircleAreaAreaDialog(this.svgMap, this.areaInfoBox.getX(), this.areaInfoBox.getY(), this.controller);
        this.areaInfoBox.setArea(simpleCircleArea);
    },
    hideTempAreaInfoBox: function () {
        if (this.areaInfoBox != null) {
            this.areaInfoBox.hide();
        }
    },
    replaceCircleAreaInfoBox: function (circleArea) {
        this.circleAreaInfoBox = new CircleAreaDialog(this.svgMap, this.circleAreaInfoBox.getX(), this.circleAreaInfoBox.getY(), this.controller);
        this.circleAreaInfoBox.setCircleArea(circleArea);
    },
    showCircleAreaInfoBox: function (circleArea) {
        this.circleAreaInfoBox = new CircleAreaDialog(this.svgMap, circleArea.getMaximumX(), circleArea.getY(), this.controller);
        this.circleAreaInfoBox.setCircleArea(circleArea);
    },
    hideCircleAreaInfoBox: function () {
        if (this.circleAreaInfoBox != null) {
            this.circleAreaInfoBox.hide();
        }
    },
    hideAndRemoveCircleAreaModificationInfoBox: function () {
        if (this.circleAreaModificationInfoBox !== null) {
            this.circleAreaModificationInfoBox.hide();
            this.circleAreaModificationInfoBox = null;
        }
    },
    showCircleAreaModificationInfoBoxAtCircleAreaInfoBoxPosition: function (circleArea, modificationController) {
        this.circleAreaModificationInfoBox = new CircleAreaModifiationBox(this.svgMap, this.circleAreaInfoBox.getX(), this.circleAreaInfoBox.getY(), modificationController);
        this.circleAreaModificationInfoBox.setTitel(circleArea.getName());
        this.circleAreaModificationInfoBox.setCircleArea(circleArea);
        //this.circleAreaModificationInfoBox.createSimpleTempCircleAreaAndBoundaries();
    },
    showCircleAreaInfoBoxAtCircleAreaModficationInfoBoxPosition: function (circleArea) {
        this.circleAreaInfoBox = new CircleAreaDialog(this.svgMap, this.circleAreaModificationInfoBox.getX(), this.circleAreaModificationInfoBox.getY(), this.controller);
        this.circleAreaInfoBox.setCircleArea(circleArea);
    },
    createTempAreaOfCircleArea: function (circleArea) {
        circleArea.enableModifiationMode();
    },
    showSimpleTempCircleBoundaryModificationInfoBox: function (simpleCircleTempArea) {
        this.simpleTempCircleBoundaryModificationInfoBox = new SimpleTempCircleBoundaryModificationInfoBox(this.svgMap, simpleCircleTempArea.getX() + simpleCircleTempArea.getRadius() + 200, simpleCircleTempArea.getY(), this.controller);
        this.simpleTempCircleBoundaryModificationInfoBox.setTitel(simpleCircleTempArea.getName());
        this.simpleTempCircleBoundaryModificationInfoBox.setRadiusValue(simpleCircleTempArea.getRadius());
        this.simpleTempCircleBoundaryModificationInfoBox.setCircleBoundary(simpleCircleTempArea);

    },
    replaceSimpleTempCircleBoundaryModificationInfoBox: function (simpleCircleTempArea) {
        if (this.simpleTempCircleBoundaryModificationInfoBox != null) {
            this.simpleTempCircleBoundaryModificationInfoBox = new SimpleTempCircleBoundaryModificationInfoBox(this.svgMap, this.simpleTempCircleBoundaryModificationInfoBox.getX(), this.simpleTempCircleBoundaryModificationInfoBox.getY(), this.controller);
            this.simpleTempCircleBoundaryModificationInfoBox.setTitel(simpleCircleTempArea.getName());
            this.simpleTempCircleBoundaryModificationInfoBox.setRadiusValue(simpleCircleTempArea.getRadius());
            this.simpleTempCircleBoundaryModificationInfoBox.setCircleBoundary(simpleCircleTempArea);
        } else {
            this.showSimpleTempCircleBoundaryModificationInfoBox(simpleCircleTempArea);
        }
    },
    hideSimpleTempCircleBoundaryModificationInfoBox: function () {
        if (this.simpleTempCircleBoundaryModificationInfoBox != null) {
            this.simpleTempCircleBoundaryModificationInfoBox.hide();
        }
    }
};