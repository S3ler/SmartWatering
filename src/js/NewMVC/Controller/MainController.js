function MainController(mainModel) {
    this.model = mainModel;
    this.view = new MainView(this);

    this.model.addObserver(this.view);

    this.selectionController = new SingleSingleTempCircleBoundarySelectionController(this, this.model, this.view);

}

MainController.prototype = {
    start:function () {
        this.view.show();
    },
    createNewCircleArea: function (simpleCircleBoundary) {
        // TODO ich brauche beide selectoren
        //this.selectionController.unselecAllCircleAreas();
        this.selectionController.unselecAllCircleBoundaries();
        this.selectionController.unselectAllCircleAreas();
        this.selectionController = new MultipleSelectionController(this, this.model, this.view);
        this.view.createTempArea(simpleCircleBoundary);
        this.view.replaceTempCircleBoundaryInfoBoxByCurrentTempAreaInfoBox(this.currentSimpleCircleArea);
    },

    saveNewCircleArea: function (simpleCircleArea) {
        try {
            var circles = simpleCircleArea.getGISBondary().circles;
            this.model.saveNewArea(circles);
            this.view.removeCircleAreaAndBoundaries(simpleCircleArea);
            this.view.hideTempAreaInfoBox();
            this.selectionController.unselecAllCircleBoundaries();
            this.selectionController = new SingleSingleTempCircleBoundarySelectionController(this, this.model, this.view);
        } catch (e) {
            if (typeof e.getMessage !== 'undefined' && typeof e.getMessage === 'function') {
                alert(e.getMessage());
            } else {
                throw e;
            }
        }

    },
    abortNewCircleArea: function (simpleCircleBoundary) {
        // TODO in method where this method is called:
        // this.controller.unselecAllTempAreas();
        this.selectionController.unselecAllCircleBoundaries();
        this.view.removeCircleArea(simpleCircleBoundary);
        this.view.hideTempAreaInfoBox();
        this.selectionController = new SingleSingleTempCircleBoundarySelectionController(this, this.model, this.view);
    },
    addTempBoundary: function(x, y){
        this.view.createTempBoundary(x, y);
    },
    addTempBoundary:function(x, y, r){
        this.view.createTempBoundary(x, y, r);
    },
    addAndWaterTempBoundary:function(x, y){
        this.view.createAndWaterTempBoundary(x, y);
    },
    waterPosition:function(x, y){
        try{
            this.model.waterPosition(x, y);
        }catch (e) {
            if (typeof e.getMessage !== 'undefined' && typeof e.getMessage === 'function') {
                alert(e.getMessage());
            } else {
                throw e;
            }
        }
    },
    selectedTempArea: function (simpleCircleBoundary) {
        this.selectionController.selectCircleBoundary(simpleCircleBoundary);
    },
    unselectedTempArea: function (simpleCircleBoundary) {
        this.selectionController.unselectCircleBoundary(simpleCircleBoundary);
    },

    deleteCircleBoundary: function (simpleCircleBoundary) {
        this.view.removeCircleBoundary(simpleCircleBoundary);
    },
    unselecAllCircleBoundaries: function () {
        this.selectionController.unselecAllCircleBoundaries();

    },
    getNewTempCircleName: function () {
        return this.model.getNewTempCircleName();
    },
    getNewTempAreaName: function () {
        return this.model.getNewTempCircleName();
    },
    selectedCircleArea: function (circleArea) {
        this.selectionController.selectCircleArea(circleArea);
    },
    unselectedCircleArea: function (circleArea) {
        this.selectionController.unselectCircleArea(circleArea);
    },
    getSelectedCircleAreas:function () {
        this.selectionController.getSelectedCircleAreas()
    },
    selectCircleAreaBoundary: function (circleAreaBoundary) {
        this.selectionController.selectCircleAreaBoundary(circleAreaBoundary);
    },
    unselectCircleAreaBoundary: function (circleAreaBoundary) {
        this.selectionController.unselectCircleAreaBoundary(circleAreaBoundary);
    },
    unselectAllCircleAreas: function (circleArea) {
        this.selectionController.unselectAllCircleAreas(circleArea);
    },

    deleteArea: function(circleArea){
        try {
            this.model.deleteArea(circleArea);
            //this.view.hideCircleAreaInfoBox();
            var circleareaboundaries = circleArea.getCircleAreaBoundaries();
            this.unselectAllCircleAreas();

            var el;
            for(var i = 0; i < circleareaboundaries.length;i++) {
                el = circleareaboundaries[i];
                this.view.createTempBoundary( el.getX(), el.getY(),el.getRadius());
            }
            
        } catch (e) {
            if (typeof e.getMessage !== 'undefined' && typeof e.getMessage === 'function') {
                alert(e.getMessage());
            } else {
                throw e;
            }
        }
    },
    modifyCircleAreaBoundaries: function (circleArea) {
        var modificationModel = new ModificationModel(this.model);
        this.model.removeObserver(this.view);
        var modificationController = new ModificationController(this, modificationModel, this.view);
        this.view.setController(modificationController);
        modificationController.startCircleAreaModification(circleArea);
    },
    endCircleAreaModification:function () {
        this.model.addObserver(this.view);
    },
    removeCircleAreaBoundary: function (circleArea, before, toRemove, after) {
        try{
            this.model.removeCircleAreaBoundary(circleArea, before, toRemove, after);
            this.addTempBoundary(toRemove.getX(), toRemove.getY(), toRemove.getRadius());
        }catch (e) {
            if (typeof e.getMessage !== 'undefined' && typeof e.getMessage === 'function') {
                alert(e.getMessage());
            } else {
                throw e;
            }
        }
    },
    addSimpleTempCircleBoundary:function(circleArea, before, toAddSimpleTempCircleBoundary, after){
        try{
           this.model.addSimpleTempCircleBoundary(circleArea, before, toAddSimpleTempCircleBoundary, after);
            if(typeof toAddSimpleTempCircleBoundary === "undefined" && typeof after == "undefined"){
                before.removeFromMap();
                this.selectionController.unselectCircleBoundary(before);
            }else{
                toAddSimpleTempCircleBoundary.removeFromMap();
                this.selectionController.unselectCircleBoundary(toAddSimpleTempCircleBoundary);
            }
        }catch (e) {
            if (typeof e.getMessage !== 'undefined' && typeof e.getMessage === 'function') {
                alert(e.getMessage());
            } else {
                throw e;
            }
        }
    }
};