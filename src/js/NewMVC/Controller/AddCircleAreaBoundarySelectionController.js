function AddCircleAreaBoundarySelectionController(mainController,  circleArea,  mainSelectionModel) {
    this.mainSelectionModel = mainSelectionModel;
    this.mainController = mainController;

    this.lastSelectedCircleArea = circleArea;
    this.first = null;
    this.second = null;
}

AddCircleAreaBoundarySelectionController.prototype = {
    selectCircleAreaBoundary: function (circleAreaBoundary) {
        if(this.first == null && this.second == null) {
            this.first = circleAreaBoundary;
            circleAreaBoundary.setSelected(true);
            if(this.lastSelectedCircleArea.getBoundaryCount() == 1) {
                if(this.isCircleBoundarySelected()) {
                    var selectedTempCircleBoundaries = this.mainSelectionModel.getSelectedCircleBoundaries();
                    // TODO change to: this.mainController.addSimpleTempCircleBoundary(this.lastSelectedCircleArea, selectedTempCircleBoundaries[0]);
                    this.mainController.addSimpleTempCircleBoundary(this.lastSelectedCircleArea, selectedTempCircleBoundaries);
                }
            }
        }else if(this.first != null && this.second == null) {
            if(this.first != circleAreaBoundary) {
                this.second = circleAreaBoundary;
                circleAreaBoundary.setSelected(true);
                if(this.isCircleBoundarySelected()) {
                    var selectedTempCircleBoundaries = this.mainSelectionModel.getSelectedCircleBoundaries();
                    // TODO change to: this.mainController.addSimpleTempCircleBoundary(this.lastSelectedCircleArea, this.first, selectedTempCircleBoundaries[0], this.second);
                    this.mainController.addSimpleTempCircleBoundary(this.lastSelectedCircleArea, this.first, selectedTempCircleBoundaries, this.second);
                }
            }else { // this.first == circleAreaBoundary
                this.unselectCircleAreaBoundary(circleAreaBoundary);
            }
        }
    },
    unselectCircleAreaBoundary: function (circleAreaBoundary) {
        if(this.first == circleAreaBoundary || this.second == circleAreaBoundary) {
            if(this.first == circleAreaBoundary) {
                circleAreaBoundary.setSelected(false);
                this.first = this.second;
                this.second = null;
            }else if(this.second == circleAreaBoundary) {
                circleAreaBoundary.setSelected(false);
                this.second = null;
            }
        }
    },
    isCircleBoundarySelected:function () {
        var selections = this.mainSelectionModel.getSelectedCircleBoundaries();
        // TODO change to: return selections[0] != null;
        return selections != null;

    },
    resetCircleAreaBoundarySelections:function () {
        if(this.first != null) {
            this.first.setSelected(false);
            this.first = null;
        }
        if(this.second != null) {
            this.second.setSelected(false);
            this.second = null;
        }
    },
    getSelectedCircleAreaBoundaries: function () {
        return [this.first, this.second];
    }
};