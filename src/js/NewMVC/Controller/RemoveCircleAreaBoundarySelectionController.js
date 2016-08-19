function RemoveCircleAreaBoundarySelectionController(mainController, model, view, circleArea) {
    this.mainController = mainController;
    this.model = model;
    this.view = view;

    this.lastSelectedCircleArea = circleArea;
    this.lastSelectedCircleAreaBoundaries = [];

}

RemoveCircleAreaBoundarySelectionController.prototype = {
    selectCircleAreaBoundary: function (circleAreaBoundary) {
        var index = this.lastSelectedCircleAreaBoundaries.indexOf(circleAreaBoundary);
        if (index != -1) {
            this.unselectCircleAreaBoundary(circleAreaBoundary);
        } else {
            this.lastSelectedCircleAreaBoundaries.push(circleAreaBoundary);
            circleAreaBoundary.setSelected(true);
        }
    },
    unselectCircleAreaBoundary: function (circleAreaBoundary) {
        var index = this.lastSelectedCircleAreaBoundaries.indexOf(circleAreaBoundary);
        if (index != -1) {
            var beforeIndex = (index - 1 >= 0) ? (index - 1) : (this.lastSelectedCircleAreaBoundaries.length-1);
            var afterIndex = (index + 1 % (this.lastSelectedCircleAreaBoundaries.length-1));
            this.mainController.removeCircleAreaBoundary(this.lastSelectedCircleArea, this.lastSelectedCircleAreaBoundaries[beforeIndex], circleAreaBoundary, this.lastSelectedCircleAreaBoundaries[afterIndex]);

            this.lastSelectedCircleAreaBoundaries.splice(index, 1);
        }
        circleAreaBoundary.setSelected(false);
    },
    resetCircleAreaBoundarySelections:function () {
        var boundary, index;
        for (var i = this.lastSelectedCircleAreaBoundaries.length - 1; i >= 0; i--) {
            boundary = this.lastSelectedCircleAreaBoundaries[i];
            index = this.lastSelectedCircleAreaBoundaries.indexOf(boundary);
            this.lastSelectedCircleAreaBoundaries.splice(index, 1);
            boundary.setSelected(false);
        }
    }
};