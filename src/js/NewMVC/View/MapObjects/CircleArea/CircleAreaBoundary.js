function CircleAreaBoundary(parentGroup, APIboundary, controller) {

    this.parentGroup = parentGroup;
    this.APIboundary = APIboundary;
    this.controller = controller;

    this.x = APIboundary.getX();
    this.y = APIboundary.getY();
    this.r = APIboundary.getR();
    this.name = APIboundary.getName();

    this.area = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    this.area.setAttribute("cx", this.x);
    this.area.setAttribute("cy", this.y);
    this.area.setAttribute("r", this.r);
    this.area.classList.add("circleareaboundary");
    //this.area.style.fillOpacity = " 0.1";

    this.area.onclick = this.dispatchMouserClick.bind(this);
    this.setSelected(false);
    this.parentGroup.appendChild(this.area);

    this.observers = [];

    this.selected = false;

}

CircleAreaBoundary.prototype = {
    addObserver: function (observer) {
        this.observers.push(observer);
    },
    removeObserver: function (observer) {
        var index = this.observers.indexOf(observer);
        if (index != -1) {
            this.observers.splice(index, 1);
        }
    },
    removeAllObserver: function (observer) {
        this.observers = [];
    },
    notify: function () {
        for (var i = 0; i > this.observers; i++) {
            this.observers[i].update();
        }
    },
    setAPIBoundary:function (APIboundary) {
        this.APIboundary = APIboundary;
    },
    setSelected: function (selected) {
        this.selected = selected;
        if (this.selected) {
            if (!this.area.classList.contains("selected")) {
                this.area.classList.add("selected");
            }
        } else {
            if (this.area.classList.contains("selected")) {
                this.area.classList.remove("selected");
            }
        }
    },
    removeFromMap: function () {
        if(this.parentGroup.contains(this.area)){
            this.parentGroup.removeChild(this.area);
            this.notify();
        }
    },

    dispatchMouserClick: function () {
        if (this.selected) {
            this.controller.unselectCircleAreaBoundary(this);
        } else {
            this.controller.selectCircleAreaBoundary(this);
        }
    },
    getX:function () {
        return parseFloat(this.area.getAttribute("cx"));
    },
    getY:function () {
        return parseFloat(this.area.getAttribute("cy"));
    },
    getRadius:function () {
        return parseFloat(this.area.getAttribute("r"));

    }
};