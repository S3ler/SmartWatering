function SimpleTempCircleArea(svgMap, newTempAreaName, controller) {
    this.svgMap = svgMap;
    this.boundaries = [];
    this.name = name;
    this.controller = controller;
    this.area = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    this.area.classList.add("createnewcirclearearea");
    this.x = 0;
    this.y = 0;
    this.maxX = 0;

    if (this.svgMap.childNodes.length > 2) {
        this.svgMap.insertBefore(this.area, this.svgMap.childNodes[1]);
    } else {
        this.svgMap.appendChild(this.area);
    }
}
SimpleTempCircleArea.prototype = {
    // Observable
    update: function () {
        // TODO instead of redrawing the whole outline, we also can redraw only the changed SimpleCircleBoundary
        this.redraw();
    },
    redraw: function () {
        // remove all children
        while (this.area.firstChild) {
            this.area.removeChild(this.area.firstChild);
        }
        if (this.boundaries.length > 0) {
            // redraw ouline
            var areapath = this.getSVGOutlinePath();
            this.area.appendChild(areapath);
        }
    },
    getSVGOutlinePath: function () {
        var __ret = this.getGISBondary();

        var circles = __ret.circles;
        if (circles.length <= 0) {
            this.x = 0;
            this.y = 0;
            this.maxX = 0;
            this.maxY = 0;
            return [];
        }

        var zeroMomenum = GIS.getZeroMomentum(circles);
        this.x = zeroMomenum[0];
        this.y = zeroMomenum[1];


        var el;
        var i;
        var maxX = Number.MIN_VALUE;
        var maxY = Number.MIN_VALUE;
        for (i = 0; i < circles.length; i++) {
            el = circles[i];
            if (maxX < el[0] + el[2]) {
                maxX = el[0] + el[2];
            }
            if (maxY < el[1] + el[2]) {
                maxY = el[1] + el[2];
            }
        }
        this.maxX = maxX;
        this.maxY = maxY;


        var outline = GIS.createOutline(circles);

        //var zeroMomenum = GIS.getZeroMomentum(boundary);
        //this.x = zeroMomenum[0];
        //this.y = zeroMomenum[1];
        //this.maxX = tmpMaxX;
        var strings = [];
        var tmpString;
        var svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        svgElement.classList.add("outline");
        if (outline.length == 1) {
            svgElement.setAttribute('d', outline[0][3]);
            // svgElement.onmouseover = this.showSVGOutlineAndBoundaries.bind(this);
            // svgElement.onmouseout = this.hideSVGOutlineAndBoundaries.bind(this);
            if (this.selecetable) {
                svgElement.onclick = this.dispatchMouseClick.bind(this);
            }
            return svgElement;
        }
        el = outline[0];
        tmpString = "M" + el[0][0] + "," + el[0][1] + " " + "L" + el[1][0] + "," + el[1][1] + " ";
        strings.push(tmpString);

        for (i = 1; i < outline.length; i++) {
            el = outline[i];
            if (el.length == 2) { // line_segment
                tmpString = "L" + el[0][0] + "," + el[0][1] + " " + "L" + el[1][0] + "," + el[1][1] + " ";
            } else if (el.length == 4) { // bezier_circle
                tmpString = el[3].replace("M", "L");
            } else {
                // error
                alert("error during creating the ouline");
                return [];
            }
            strings.push(tmpString);
        }
        strings.push(" Z");
        svgElement.setAttribute('d', strings.join(""));
        if (this.selecetable) {
            svgElement.onclick = this.dispatchMouseClick.bind(this);
        }
        return svgElement;
    },
    getGISBondary: function () {
        var circles = [];
        var el, boundary, svgEl;
        var i;
        var tmpMaxX = Number.MIN_VALUE;
        for (i = 0; i < this.boundaries.length; i++) {
            boundary = this.boundaries[i];
            el = [boundary.getX(), boundary.getY(), boundary.getRadius(), boundary.getName()];
            if (boundary.getX() > tmpMaxX) {
                tmpMaxX = boundary.getX();
            }
            circles.push(el);
        }
        return {circles: circles, el: el, boundary: boundary, i: i, tmpMaxX: tmpMaxX};
    },
    getSVGOutline: function () {
        var __ret = this.getGISBondary();
        var circles = __ret.circles;
        var el = __ret.el;
        var boundary = __ret.boundary;
        var i = __ret.i;
        var tmpMaxX = __ret.tmpMaxX;
        var outline = GIS.createOutline(circles);

        var zeroMomenum = GIS.getZeroMomentum(boundary);
        this.x = zeroMomenum[0];
        this.y = zeroMomenum[1];
        this.maxX = tmpMaxX;
        var result = [];
        for (i = 0; i < outline.length; i++) {
            el = outline[i];
            if (el.length == 2) { // line_segment
                if (isNaN(el[0][0])) {
                    i++;
                    continue;
                }
                svgEl = document.createElementNS("http://www.w3.org/2000/svg", 'line');
                svgEl.setAttribute('x1', el[0][0]);
                svgEl.setAttribute('y1', el[0][1]);
                svgEl.setAttribute('x2', el[1][0]);
                svgEl.setAttribute('y2', el[1][1]);

            } else if (el.length == 4) { // bezier_circle
                svgEl = document.createElementNS("http://www.w3.org/2000/svg", 'path');
                svgEl.setAttribute('d', el[3]);

            } else if (el.length == 3) { // bezier_circle
                svgEl = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
                svgEl.setAttribute('cx', el[0]);
                svgEl.setAttribute('cy', el[1]);
                svgEl.setAttribute('r', el[2]);
                // svgEl.style.stroke = "black";
                // svgEl.style.strokeWidth = "10";
                //svgEl.style.fill = "black";
                // svgEl.style.fillOpacity = ((i*0.25)%1)+"";

                result.push(svgEl);
                svgEl = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
                svgEl.setAttribute('cx', el[1][0]);
                svgEl.setAttribute('cy', el[1][1]);
                svgEl.setAttribute('r', el[2]);
                // svgEl.style.stroke = "black";
                //svgEl.style.strokeWidth = "10";
                //svgEl.style.fill = "black";
                //svgEl.style.fillOpacity = ((i*0.2)%1)+"";
            } else {
                // error
                alert("error during creating the ouline");
                return [];
            }
            result.push(svgEl);
        }
        return result;
    },
    addCircleBoundary: function (simpleCircleBoundary) {
        this.boundaries.push(simpleCircleBoundary);
        simpleCircleBoundary.addObserver(this);
        this.redraw();
        simpleCircleBoundary.hide();
        simpleCircleBoundary.show();
    },
    removeCircleBoundary: function (simpleCircleBoundary) {
        var index = this.boundaries.indexOf(simpleCircleBoundary);
        if (index > -1) {
            this.boundaries.splice(index, 1);
            simpleCircleBoundary.removeObserver(this);
        }
        this.redraw();
    },
    removeFromMap: function () {
        this.svgMap.removeChild(this.area);
        var boundary;
        for (var i = 0; i < this.boundaries.length; i++) {
            boundary = this.boundaries[i];
            boundary.removeObserver(this);
            boundary.removeFromMap();
        }
    },
    getName: function () {
        return this.name;
    },
    setName: function (name) {
        this.name = name;
    },
    getX: function () {
        return this.x;
    },
    getY: function () {
        return this.y;
    },
    getMaximumX: function () {
        return this.maxX;
    }
};