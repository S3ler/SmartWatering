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

    if (target == this.background && evt instanceof MouseEvent) {

        // Desktop
        this.background.onmousemove = this.moveViewBox.bind(this);


        this.notLeft = true;
        this.lastLoc = this.getCursor(evt);

        this.mousedownStartTime = +new Date();
        this.mousedownStartLoc = this.lastLoc;

        evt.preventDefault();
    }
    if (target == this.background && window.TouchEvent && evt.originalEvent instanceof TouchEvent) {
        this.background.addEventListener('touchmove', this.moveViewBox.bind(this), false);

        this.notLeft = true;
        this.lastLoc = this.getCursor(evt.targetTouches[0]);
        this.mousedownStartTime = +new Date();
        this.mousedownStartLoc = this.lastLoc;
        //points = evt.targetTouches;
        evt.preventDefault();
    }
    evt.preventDefault();

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
    if (this.notLeft && this.lastLoc != null && evt instanceof MouseEvent) {
        var loc = this.getCursor(evt);
        var newX = this.viewBoxX - 0.3 * (loc.x - this.lastLoc.x);
        var newY = this.viewBoxY - 0.3 * (loc.y - this.lastLoc.y);
        this.setViewBoxValues(newX, newY, this.viewBoxZoomHeight, this.viewBoxZoomWidth);
        this.lastLoc = loc;
        evt.preventDefault();
    }

    if (this.notLeft && this.lastLoc != null && window.TouchEvent && evt.originalEvent instanceof TouchEvent) {
        var loc = this.getCursor(evt.targetTouches[0]);
        var newX = this.viewBoxX - 0.3 * (loc.x - this.lastLoc.x);
        var newY = this.viewBoxY - 0.3 * (loc.y - this.lastLoc.y);
        this.setViewBoxValues(newX, newY, this.viewBoxZoomHeight, this.viewBoxZoomWidth);
        this.lastLoc = loc;
        evt.preventDefault();
    }
    evt.preventDefault();
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
        var loc
        if (evt instanceof MouseEvent) {
            loc = this.getCursor(evt);
        } else if (evt instanceof TouchEvent ) {
            if(evt === "undefined"){
                // TODO only a workaround
                this.notLeft = false;
                this.lastLoc = null;
                this.mousedownStartTime = null;
                this.mousedownEndTime = null;
                // Desktop
                this.background.onmousemove = null;
                // Tablet
                this.background.touchmove = null;
                evt.preventDefault();
                return;
            }
            if(evt.type = "touchend"){
                loc = this.getCursor(evt.changedTouches[0]);
            }else{
                loc = this.getCursor(evt.targetTouches[0]);
            }
        }
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
    evt.preventDefault();
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

MapBackground.prototype.addMouseListener = function () {
    // desktop
    this.background.onmousedown = this.startMouseDown.bind(this);
    //this.background.onmousemove = this.moveViewBox.bind(this);
    this.background.onmouseup = this.dispatchMouseUp.bind(this);
    this.background.onclick = this.dispatchMouseClick.bind(this);

    this.background.onmouseout = this.resetInternalStates.bind(this);

    // tablet
    this.background.addEventListener('touchstart', this.startMouseDown.bind(this), false); //  this.background.touchstart = this.startMouseDown.bind(this);

    //this.background.onmousemove = this.moveViewBox.bind(this);
    this.background.addEventListener('touchend', this.dispatchMouseUp.bind(this), false); //      this.background.touchend = this.dispatchMouseUp.bind(this);

};

