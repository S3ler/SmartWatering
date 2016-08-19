function SimpleTempCircleBoundary(svgMap, x, y, name, controller) {
    this.name = name;
    this.controller = controller;
    this.svgMap = svgMap;

    this.area = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    this.area.setAttribute("cx", x);
    this.area.setAttribute("cy", y);
    this.area.setAttribute("r", 200); // 20 cm
    this.area.setAttribute("class", "TemporaryWaterPosition");


    this.mouseDownTimePoint = null;
    this.mouseDownStartLoc = null;
    this.isMouseClick = true;

    this.x = function () {
        return this.getX();
    };
    this.y = function () {
        return this.getX();
    };

    this.area.onclick = this.dispatchMouseClick.bind(this);
    this.area.onmousedown = this.dispatchMouseDown.bind(this);
    this.area.onmouseup = this.dispatchMouseUp.bind(this);

    this.area.onmouseout = this.dispatchOnMouseOut.bind(this);

    this.selected = false;
    this.svgMap.appendChild(this.area);

    // Observable
    this.observers = [];
}

SimpleTempCircleBoundary.prototype.setController = function (controller) {
    this.controller = controller;
};
SimpleTempCircleBoundary.prototype.notify = function () {
    for (var i = 0; i > this.observers; i++) {
        this.observers[i].update();
    }
};
SimpleTempCircleBoundary.prototype.addObserver = function (observer) {
    this.observers.push(observer);
};
SimpleTempCircleBoundary.prototype.removeObserver = function (observer) {
    var index = this.observers.indexOf(observer);
    if (index > -1) {
        this.observers.splice(index, 1);
    }
};
SimpleTempCircleBoundary.prototype.removeAllObserver = function () {
    this.observers = [];
};
SimpleTempCircleBoundary.prototype.setSelected = function (selected) {
    this.selected = selected;
    if (this.selected) {

        if (!this.area.classList.contains("selected")) {
            this.area.classList.add("selected");
            this.svgMap.appendChild(this.area);
        }
    } else {

        if (this.area.classList.contains("selected")) {
            this.area.classList.remove("selected");
        }
    }
};

SimpleTempCircleBoundary.prototype.dispatchOnMouseOut = function (evt) {
    var loc = this.getCursor(evt);

    if (this.lastLoc != null && Math.abs(loc.x - this.lastLoc.x) < 5 && Math.abs(loc.y - this.lastLoc.y) < 5) {
        this.area.setAttribute("cx", loc.x);
        this.area.setAttribute("cy", loc.y);

        this.lastLoc = loc;
    } else {
        this.notLeft = false;
        this.lastLoc = null;
        this.mouseDownTimePoint = null;
        this.mousedownEndTime = null;
        this.mousedownStartLoc = null;
        this.area.onmousemove = null;
        this.notify();
    }
};

SimpleTempCircleBoundary.prototype.dispatchMouseClick = function (evt) {
    if (this.isMouseClick) {
        if (this.selected) {
            this.controller.unselectedTempArea(this);
        } else {
            this.controller.selectedTempArea(this);
        }
    } else {
        this.isMouseClick = true;
    }
    if (this.isLongTab) {
        this.controller.selectedTempArea(this);
        this.controller.waterPosition(this.getX(), this.getY());
    } else {
        this.isLongTab = true;
    }

};

SimpleTempCircleBoundary.prototype.dispatchMouseUp = function (evt) {

    this.mousedownEndTime = +new Date();
    var difference = this.mousedownEndTime - this.mouseDownTimePoint;
    if (difference <= 150) {
        this.isMouseClick = true;
    } else {
        this.isMouseClick = false;
    }

    if (difference > 1000) {
        var loc = this.getCursor(evt);
        if (Math.abs(this.mouseDownStartLoc.x - loc.x) < 0.5 &&
            Math.abs(this.mouseDownStartLoc.y - loc.y) < 0.5) {
            this.isLongTab = true;
        } else {
            this.isLongTab = false;
        }
    } else {
        this.isLongTab = false;
    }

    this.notLeft = false;
    this.lastLoc = null;
    this.mouseDownTimePoint = null;
    this.mousedownEndTime = null;
    this.mousedownStartLoc = null;
    this.area.onmousemove = null;

    this.notify();
};

SimpleTempCircleBoundary.prototype.dispatchMouseMove = function (evt) {
    if (this.notLeft && this.lastLoc != null) {
        var loc = this.getCursor(evt);
        var newX = this.getX() + 1.0 * (loc.x - this.lastLoc.x);
        var newY = this.getY() + 1.0 * (loc.y - this.lastLoc.y);
        this.area.setAttribute("cx", newX);
        this.area.setAttribute("cy", newY);

        this.lastLoc = loc;
    }

};

SimpleTempCircleBoundary.prototype.dispatchMouseDown = function (evt) {
    var target = evt.target || event.srcElement;
    if (target == this.area) {
        var loc = this.getCursor(evt);
        this.area.onmousemove = this.dispatchMouseMove.bind(this);

        this.notLeft = true;
        this.lastLoc = loc;
        this.mouseDownTimePoint = +new Date();
        this.mouseDownStartLoc = loc;
    }
};

SimpleTempCircleBoundary.prototype.hide = function () {
    if(this.svgMap.contains(this.area)){
        this.svgMap.removeChild(this.area);
    }
};
SimpleTempCircleBoundary.prototype.show = function () {
    if(!this.svgMap.contains(this.area)){
        this.svgMap.appendChild(this.area);
    }
};


SimpleTempCircleBoundary.prototype.getX = function () {
    return parseFloat(this.area.getAttribute("cx"));
};

SimpleTempCircleBoundary.prototype.getY = function () {
    return parseFloat(this.area.getAttribute("cy"));
};

SimpleTempCircleBoundary.prototype.getRadius = function () {
    return parseFloat(this.area.getAttribute("r"));
};
SimpleTempCircleBoundary.prototype.setRadius = function (radius) {
    this.area.setAttribute("r", radius);
};
SimpleTempCircleBoundary.prototype.setName = function (name) {
    this.name = name;
};
SimpleTempCircleBoundary.prototype.getName = function () {
    return this.name;
};

SimpleTempCircleBoundary.prototype.getType = function () {
    return this.area.tagName.toLowerCase();
};

SimpleTempCircleBoundary.prototype.getCursor = function (evt) {
    var svg = document.getElementById("map");
    var pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
};

SimpleTempCircleBoundary.prototype.removeFromMap = function () {
    this.svgMap.removeChild(this.area);
};
