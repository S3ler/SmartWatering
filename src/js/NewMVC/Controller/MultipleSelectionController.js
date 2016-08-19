function MultipleSelectionController(mainController, model, view) {
    this.mainController = mainController;
    this.model = model;
    this.view = view;
    this.lastSelectedBoundaries = [];
}
MultipleSelectionController.prototype = {
    selectCircleBoundary: function (simpleCircleTempArea) {
        var index = this.lastSelectedBoundaries.indexOf(simpleCircleTempArea);
        if (index != -1) {
            this.unselectTempArea(simpleCircleTempArea);
        } else {
            this.lastSelectedBoundaries.push(simpleCircleTempArea);
            simpleCircleTempArea.setSelected(true);
            this.view.addToCurrentSimpleCircleArea(simpleCircleTempArea);
        }
    },
    unselectCircleBoundary: function (simpleCircleTempArea) {
        var index = this.lastSelectedBoundaries.indexOf(simpleCircleTempArea);
        if (index != -1) {
            this.lastSelectedBoundaries.splice(index, 1);
        }
        simpleCircleTempArea.setSelected(false);
        this.view.removeFromCurrentSimpleCircleArea(simpleCircleTempArea);
    },
    unselecAllCircleBoundaries: function () {
        for (var i = this.lastSelectedBoundaries.length-1; i >=0; i--) {
            this.unselectCircleBoundary(this.lastSelectedBoundaries[i]);
        }
    },
    getSelected:function () {
        return this.lastSelectedBoundaries;
    },
    selectCircleArea: function(circleArea){

    }
};