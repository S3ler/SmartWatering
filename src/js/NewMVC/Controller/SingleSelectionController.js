function SingleSingleTempCircleBoundarySelectionController(mainController, model, view) {
    this.mainController = mainController;
    this.model = model;
    this.view = view;
    this.lastSelectedBoundaries = null;

    this.addCircleAreaBoundaryMode = false;


    this.circleAreaBoundarySelectionController = null;
    this.circleAreaSelectionController = new SingleCircleAreaSelectionController(this.mainController, this, this.view);

}
SingleSingleTempCircleBoundarySelectionController.prototype = {

    selectCircleBoundary: function (simpleCircleTempArea) {
        if (this.lastSelectedBoundaries != null) {
            this.unselectCircleBoundary(this.lastSelectedBoundaries);
            this.view.replaceTempCircleBoundaryInfoBox(simpleCircleTempArea);
            if(!this.addCircleAreaBoundaryMode){
                this.addCircleAreaBoundaries();
            }
        } else {
            this.view.showTempCircleBoundaryInfoBox(simpleCircleTempArea);
            if(!this.addCircleAreaBoundaryMode){
                this.addCircleAreaBoundaries();
            }
        }
        this.lastSelectedBoundaries = simpleCircleTempArea;
        this.lastSelectedBoundaries.setSelected(true);
        if (this.circleAreaSelectionController.getSelectedCircleAreas()[0] != null && this.addCircleAreaBoundaryMode) {
            if(this.areTwoCircleAreaBoundariesSelected()) {
                var circleArea = this.circleAreaSelectionController.getSelectedCircleAreas()[0];
                var selectedCircleAreaBoundaries = this.circleAreaBoundarySelectionController.getSelectedCircleAreaBoundaries();
                var beforeCircleAreaBoundary = selectedCircleAreaBoundaries[0];
                var afterCircleAreaBoundary = selectedCircleAreaBoundaries[1];
                var toAddCircleBoundary = this.lastSelectedBoundaries;
                this.mainController.addSimpleTempCircleBoundary(circleArea, beforeCircleAreaBoundary, toAddCircleBoundary, afterCircleAreaBoundary);
            }
        }
    },
    unselectCircleBoundary: function (simpleCircleTempArea) {
        if (this.lastSelectedBoundaries != null) {
            if (this.lastSelectedBoundaries == simpleCircleTempArea) {
                this.lastSelectedBoundaries = null;
                simpleCircleTempArea.setSelected(false);
            }
        }
        this.view.hideTempCircleBoundaryInfoBox();
        if(this.lastSelectedBoundaries == null && this.addCircleAreaBoundaryMode) {
            this.removeCircleAreaBoundaries();
        }
    },
    unselecAllCircleBoundaries: function () {
        this.unselectCircleBoundary(this.lastSelectedBoundaries);
    },
    getSelectedCircleBoundaries: function () {
        return this.lastSelectedBoundaries;
    },

    // circle area
    selectCircleArea: function (circleArea) {
        this.circleAreaSelectionController.selectCircleArea(circleArea);
    },
    unselectCircleArea: function (circleArea) {
        this.circleAreaSelectionController.unselectCircleArea(circleArea);
    },
    getSelectedCircleAreas  : function () {
        this.circleAreaSelectionController.getSelectedCircleAreas();
    },
    unselectAllCircleAreas: function () {
        this.circleAreaSelectionController.unselectAllCircleAreas();
    },

    // circle area boundary
    selectCircleAreaBoundary: function (circleAreaBoundary) {
        this.circleAreaBoundarySelectionController.selectCircleAreaBoundary(circleAreaBoundary);
    },
    unselectCircleAreaBoundary: function (circleAreaBoundary) {
        this.circleAreaBoundarySelectionController.unselectCircleAreaBoundary(circleAreaBoundary);
    },
    resetCircleAreaBoundarySelections: function () { // unselects but dont remove
        this.circleAreaBoundarySelectionController.resetCircleAreaBoundarySelections();
    },

    // switch selection strategies
    removeCircleAreaBoundaries: function () {
        if (this.circleAreaSelectionController.getSelectedCircleAreas()[0] != null) {
            if (this.circleAreaBoundarySelectionController != null) {
                this.circleAreaBoundarySelectionController.resetCircleAreaBoundarySelections();
            }
            this.circleAreaBoundarySelectionController = new RemoveCircleAreaBoundarySelectionController(this.mainController, this.model, this.view, this.circleAreaSelectionController.getSelectedCircleAreas()[0]);

            // disable + enable currentCircleArea to force reselection of elements
            var currentCircleArea = this.circleAreaSelectionController.getSelectedCircleAreas()[0];
            currentCircleArea.selectAllBoundaries();

            this.addCircleAreaBoundaryMode = false;
            return true;
        }
        return false;
    },
    addCircleAreaBoundaries: function () {
        if (this.circleAreaSelectionController.getSelectedCircleAreas()[0] != null) {
            if (this.circleAreaBoundarySelectionController != null) {
                this.circleAreaBoundarySelectionController.resetCircleAreaBoundarySelections();
            }
            this.circleAreaBoundarySelectionController =
                new AddCircleAreaBoundarySelectionController(this.mainController,this.circleAreaSelectionController.getSelectedCircleAreas()[0], this);
            this.addCircleAreaBoundaryMode = true;
            return true;
        }
        return false;
    },
    areTwoCircleAreaBoundariesSelected: function () {
        var selectedCircleAreaBoundaries = this.circleAreaBoundarySelectionController.getSelectedCircleAreaBoundaries();
        return (selectedCircleAreaBoundaries[0] != null && selectedCircleAreaBoundaries[1] != null);
    }
};