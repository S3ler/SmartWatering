function MapBackground(svgMap, mapheight, mapwidth, controller) {
    this.controller = controller;

    this.svgMap = svgMap;
    this.mapHeight = mapheight;
    this.mapWidth = mapwidth;

    this.background = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    this.background.setAttribute("cx", "" + 0);
    this.background.setAttribute("cy", "" + 0);
    this.background.setAttribute("height", this.mapHeight);
    this.background.setAttribute("width", this.mapWidth);
    this.background.setAttribute("id", "background");
    //this.background.style.fillOpacity = "0.2";
    //this.background.style.fill = "white";

    this.notLeft = false;
    this.lastLoc = null;
    this.isMouseClick = false;
    this.mousedownStartTime = null;
    this.mousedownEndTime = null;


    this.viewBoxZoomHeight = 50 * 100;// window.screen.availHeight ;
    this.viewBoxZoomWidth = 50 * 100;// window.screen.availWidth ;
    this.viewBoxX = this.mapHeight / 2 - 0.5 * this.viewBoxZoomHeight;
    this.viewBoxY = this.mapWidth / 2 - 0.5 * this.viewBoxZoomWidth;
    this.setViewBoxValues(this.viewBoxX, this.viewBoxY, this.viewBoxZoomWidth, this.viewBoxZoomHeight);

    this.addMouseListener();

    this.svgMap.appendChild(this.background);

}

MapBackground.prototype.setController = function (controller) {
    this.controller = controller
};

MapBackground.prototype.redrawViewBox = function (viewBoxX, viewBoxY, zoomHeight, zoomWidth) {
    this.svgMap.setAttribute('viewBox', viewBoxX + " " + viewBoxY + " " + zoomWidth + " " + zoomHeight);
};

MapBackground.prototype.getCursor = function (evt) {
    var pt = this.svgMap.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    return pt.matrixTransform(this.svgMap.getScreenCTM().inverse());
};

MapBackground.prototype.setViewBoxValues = function (viewBoxX, viewBoxY, zoomHeight, zoomWidth) {
    this.viewBoxZoomHeight = zoomHeight;
    this.viewBoxZoomWidth = zoomWidth;
    this.viewBoxX = viewBoxX;
    this.viewBoxY = viewBoxY;
    this.redrawViewBox(this.viewBoxX, this.viewBoxY, this.viewBoxZoomWidth, this.viewBoxZoomHeight);
};

MapBackground.prototype.startMouseDown = function (evt) {
    var target = evt.target || event.srcElement;
    var touchTarget = evt.targetTouches;

    if (target == this.background || touchTarget == this.background) {

        // Desktop
        this.background.onmousemove = this.moveViewBox.bind(this);
        // Tablet
        this.background.touchmove = this.moveViewBox.bind(this);

        this.notLeft = true;
        this.lastLoc = this.getCursor(evt);
        this.mousedownStartTime = +new Date();
        this.mousedownStartLoc = this.lastLoc;
    }
};

MapBackground.prototype.dispatchMouseClick = function (evt) {
    var loc;
    if (this.isMouseClick) {
        loc = this.getCursor(evt);
        this.controller.addTempBoundary(loc.x, loc.y);
    } else {
        this.isMouseClick = true;
    }
    if (this.isLongTab) {
        loc = this.getCursor(evt);
        this.controller.addAndWaterTempBoundary(loc.x, loc.y);
    } else {
        this.isLongTab = true;
    }
};

MapBackground.prototype.moveViewBox = function (evt) {
    if (this.notLeft && this.lastLoc != null) {
        var loc = this.getCursor(evt);
        var newX = this.viewBoxX - 0.3 * (loc.x - this.lastLoc.x);
        var newY = this.viewBoxY - 0.3 * (loc.y - this.lastLoc.y);
        this.setViewBoxValues(newX, newY, this.viewBoxZoomHeight, this.viewBoxZoomWidth);
        this.lastLoc = loc;
    }
};

MapBackground.prototype.dispatchMouseUp = function (evt) {
    // decide if it was a short enough for a click/tap
    this.mousedownEndTime = +new Date();
    var difference = this.mousedownEndTime - this.mousedownStartTime;
    if (difference <= 150) {
        this.isMouseClick = true;
    } else {
        this.isMouseClick = false;
    }

    if (difference > 800) {
        var loc = this.getCursor(evt);
        if (Math.abs(this.mousedownStartLoc.x - loc.x) < 0.5 &&
            Math.abs(this.mousedownStartLoc.y - loc.y) < 0.5) {
            this.isLongTab = true;
        } else {
            this.isLongTab = false;
        }
    } else {
        this.isLongTab = false;
    }

    this.notLeft = false;
    this.lastLoc = null;
    this.mousedownStartTime = null;
    this.mousedownEndTime = null;
    // Desktop
    this.background.onmousemove = null;
    // Tablet
    this.background.touchmove = null;
};

MapBackground.prototype.resetInternalStates = function (evt) {
    // this.isMouseClick = false;
    this.notLeft = false;
    this.lastLoc = null;
    this.mousedownStartTime = null;
    this.mousedownEndTime = null;

    // Desktop
    this.background.onmousemove = null;
    // Tablet
    this.background.touchmove = null;

};

MapBackground.prototype.scroll = function (e) {
    var e = window.event || e; // old IE support
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    var newZoomWidth = this.viewBoxZoomWidth - delta * 300;
    var newZoomHeight = this.viewBoxZoomHeight - delta * 300;

    //var newX = this.viewBoxY + delta;
    //var newY = this.viewBoxX + delta;

    var newX = this.viewBoxX;
    var newY = this.viewBoxY;
    this.setViewBoxValues(newX, newY, newZoomWidth, newZoomHeight);

    return false;
};

MapBackground.prototype.addMouseListener = function () {
    // desktop
    this.background.onmousedown = this.startMouseDown.bind(this);
    //this.background.onmousemove = this.moveViewBox.bind(this);
    this.background.onmouseup = this.dispatchMouseUp.bind(this);
    this.background.onclick = this.dispatchMouseClick.bind(this);

    this.background.onmouseout = this.resetInternalStates.bind(this);

    // Table
    this.background.touchstart = this.startMouseDown.bind(this);
    //this.background.onmousemove = this.moveViewBox.bind(this);
    this.background.touchend = this.dispatchMouseUp.bind(this);

    this.background.onmouseout = this.resetInternalStates.bind(this);


    // this.background.onscroll = this.scroll.bind(this);
    if (window.addEventListener) {
        // IE9, Chrome, Safari, Opera
        window.addEventListener("mousewheel", this.scroll.bind(this), false);
        // Firefox
        window.addEventListener("DOMMouseScroll", this.scroll.bind(this), false);
    }

};

