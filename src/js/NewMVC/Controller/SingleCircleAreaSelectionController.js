function SingleCircleAreaSelectionController(mainController, mainSelectionModel, view){

    this.mainSelectionModel = mainSelectionModel;
    this.view = view;
    this.lastSelectedCircleArea= null;
}

SingleCircleAreaSelectionController.prototype = {
    selectCircleArea: function (circleArea) {
        if (this.lastSelectedCircleArea != null) {
            this.unselectCircleArea(this.lastSelectedCircleArea);
            this.view.replaceCircleAreaInfoBox(circleArea);
        } else {
            this.view.showCircleAreaInfoBox(circleArea);
        }
        this.lastSelectedCircleArea = circleArea;
        this.lastSelectedCircleArea.setSelected(true);
        this.lastSelectedCircleArea.enableModifiationMode();
        if(this.isCircleBoundarySelected()) {
            var selectedTempCircleBoundaries = this.mainSelectionModel.getSelectedCircleBoundaries();
            // TODO change to: return selections[0] != null;
            this.mainSelectionModel.unselecAllCircleBoundaries();
            this.mainSelectionModel.selectCircleBoundary(selectedTempCircleBoundaries);
            this.mainSelectionModel.addCircleAreaBoundaries();
        }else{
            this.mainSelectionModel.removeCircleAreaBoundaries();// TODO change name to MODE
        }

    },
    unselectCircleArea: function (circleArea) {
        if (this.lastSelectedCircleArea != null) {
            if (this.lastSelectedCircleArea == circleArea) {
                this.lastSelectedCircleArea = null;
                circleArea.setSelected(false);
                circleArea.disableModifiationMode();
            }
        }
        this.view.hideCircleAreaInfoBox();
    },
    getSelectedCircleAreas: function () {
        return [this.lastSelectedCircleArea];
    },
    unselectAllCircleAreas: function () {
        this.unselectCircleArea(this.lastSelectedCircleArea);
    },
    isCircleBoundarySelected:function () {
        var selections = this.mainSelectionModel.getSelectedCircleBoundaries();
        // TODO change to: return selections[0] != null;
        return selections != null;

    },
};