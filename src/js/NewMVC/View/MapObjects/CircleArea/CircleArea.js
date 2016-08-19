function CircleArea(svgMap, APIarea, controller) {
    this.svgMap = svgMap;
    this.APIarea = APIarea;
    this.controller = controller;
    this.area = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    this.area.classList.add("circlearea");

    this.areapath = null;
    this.svgMap.appendChild(this.area);

    this.renderSVGOutline = false;
    this.renderSVGBoundaries = false;
    this.selecetable = true;

    this.x = 0;
    this.y = 0;

    this.outlineTempCircleBoundaries = [];
    this.outlineTempCircleArea = null;
}

CircleArea.prototype = {
    update: function (updatedObject, pushedObject) {
        if (updatedObject instanceof ModificationModel) {
            this.redraw();
            this.removeCircleAreaBoundariesFromMap();
            this.createAndSelectCircleAreaBoundaries();
        }
    },
    setController: function (controller) {
        this.controller = controller;
    },
    setSelectability: function (selectable) {
        this.selecetable = selectable;
    },
    redraw: function () {
        // remove all children
        while (this.area.firstChild) {
            this.area.removeChild(this.area.firstChild);
        }
        this.areapath = this.getSVGOutlinePath();
        if (this.selected) {
            this.areapath.classList.add("selected");
        }
        this.area.appendChild(this.areapath);
        if (this.renderSVGBoundaries) {
            this.area.appendChild(this.getSimpleTemCircleBoundaries());
        }
        if (this.renderSVGOutline) {
            this.area.appendChild(this.getSVGOutline());
        }
        this.area.appendChild(this.getSVGName());
    },
    getSVGName: function () {
      var nameElement = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        nameElement.classList.add("circleareaname");
        nameElement.innerHTML = this.APIarea.getName();
        nameElement.setAttribute("x", (this.x-400));
        nameElement.setAttribute("y", this.y);
        return nameElement;
    },
    getSimpleTemCircleBoundaries: function () {
        var el, boundary;
        var boundaries = [];

        for (i = 0; i < this.APIarea.getBoundaries().length; i++) {
            el = this.APIarea.getBoundaries()[i];
            boundary = new SimpleTempCircleBoundary(this.svgMap, el.getX(), el.getY(), el.getName(), new DummyController());
            boundary.setRadius(el.getR());
            boundary.removeFromMap();
            boundaries.push(boundary);
        }

        var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        for (i = 0; i < boundaries.length; i++) {
            g.appendChild(boundaries[i].area);
        }
        return g;

    },
    createCircleAreaBoundaries: function () {
        var el, boundary;
        var boundaries = [];

        for (i = 0; i < this.APIarea.getBoundaries().length; i++) {
            el = this.APIarea.getBoundaries()[i];
            // TODO exchange DummyController
            boundary = new CircleAreaBoundary(this.area, el, this.controller);
            boundaries.push(boundary);
        }
        return boundaries;

    },
    getGISBondary: function () {
        var circles = [];
        var el, boundary, svgEl;
        var i;
        var tmpMaxX = Number.MIN_VALUE;
        for (i = 0; i < this.APIarea.getBoundaries().length; i++) {
            boundary = this.APIarea.getBoundaries()[i];
            el = [boundary.getX(), boundary.getY(), boundary.getR()];
            if (boundary.getX() > tmpMaxX) {
                tmpMaxX = boundary.getX();
            }
            circles.push(el);
        }
        return {circles: circles, tmpMaxX: tmpMaxX};
    },
    getSVGOutline: function () {
        var __ret = this.getGISBondary();
        var circles = __ret.circles;
        var tmpMaxX = __ret.tmpMaxX;
        var i;
        var outline = GIS.createOutline(circles);

        //this.maxX = tmpMaxX;
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
                //  svgEl.style.stroke = "black";
                //  svgEl.style.strokeWidth = "10";
                //  svgEl.style.fill = "black";
                //  svgEl.style.fillOpacity = ((i * 0.25) % 1) + "";

                result.push(svgEl);
                svgEl = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
                svgEl.setAttribute('cx', el[1][0]);
                svgEl.setAttribute('cy', el[1][1]);
                svgEl.setAttribute('r', el[2]);
                //  svgEl.style.stroke = "black";
                //  svgEl.style.strokeWidth = "10";
                // svgEl.style.fill = "black";
                // svgEl.style.fillOpacity = ((i * 0.2) % 1) + "";
            } else {
                // error
                alert("error during creating the outline");
                return [];
            }
            result.push(svgEl);
        }

        var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        g.classList.add("circleareaoutline");
        for (i = 0; i < result.length; i++) {
            g.appendChild(result[i]);
        }

        return g;
    },
    getSVGOutlinePath: function () {
        var circles = this.APIarea.getGISBoundaries();
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
        for(i = 0 ; i < circles.length;i++) {
            el = circles[i];
            if(maxX < el[0]+el[2]){
                maxX = el[0]+el[2];
            }
            if(maxY < el[1]+el[2]){
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
    dispatchMouseClick: function () {
        if (this.selected) {
            this.controller.unselectedCircleArea(this);
        } else {
            this.controller.selectedCircleArea(this);
        }
    },
    setSelected: function (selection) {
        this.selected = selection;
        if (this.selected) {
            if (this.areapath != null) {
                if (!this.areapath.classList.contains("selected")) {
                    this.areapath.classList.add("selected");
                }
            }
        } else {
            if (this.areapath != null) {
                if (this.areapath.classList.contains("selected")) {
                    this.areapath.classList.remove("selected");
                }
            }
        }
    },
    showSVGOutlineAndBoundaries: function () {
        this.showSVGOutline();
        this.showSVGBoundaries();
    },
    hideSVGOutlineAndBoundaries: function () {
        this.hideSVGOutline();
        this.hideSVGBoundaries();
    },
    removeFromMap: function () {
        this.svgMap.removeChild(this.area);
        this.redraw();
    },
    showSVGOutline: function () {
        this.renderSVGOutline = true;
        this.redraw();
    },
    hideSVGOutline: function () {
        this.renderSVGOutline = false;
        this.redraw();
    },
    showSVGBoundaries: function () {
        this.renderSVGBoundaries = true;
        this.redraw();
    },
    hideSVGBoundaries: function () {
        this.renderSVGBoundaries = false;
        this.redraw();
    },
    getX: function () {
        return this.x;
    },
    getY: function () {
        return this.y;
    },
    getMaximumX: function () {
        return this.maxX;
    },
    getMaximumY: function () {
        return this.maxY;
    },
    getName: function () {
        return this.APIarea.getName();
    },
    createAndSelectCircleAreaBoundaries: function () {
        this.outlineTempCircleBoundaries = this.createCircleAreaBoundaries();
        var boundary;
        for (var i = 0; i < this.outlineTempCircleBoundaries.length; i++) {
            boundary = this.outlineTempCircleBoundaries[i];
            boundary.addObserver(this);
        }
    },
    selectAllBoundaries: function () {
        for (var i = 0; i < this.outlineTempCircleBoundaries.length; i++) {
            boundary = this.outlineTempCircleBoundaries[i];
            this.controller.selectCircleAreaBoundary(boundary);
        }
    },
    enableModifiationMode:function(){
        if (!this.modificationStatus) {
            this.modificationStatus = true;
            this.createAndSelectCircleAreaBoundaries();
        }
    },
    removeCircleAreaBoundariesFromMap: function () {
        var boundary;
        for (var i = 0; i < this.outlineTempCircleBoundaries.length; i++) {
            boundary = this.outlineTempCircleBoundaries[i];
            boundary.removeObserver(this);
            boundary.removeFromMap();
            //boundary.setAPIBoundary(null);
        }
    },
    disableModifiationMode:function(){
        if (this.modificationStatus) {
            this.modificationStatus = false;
            this.removeCircleAreaBoundariesFromMap();
        }
    },
    removeCircleAreaBoundary:function(circleAreaBoundary){
        if (this.modificationStatus) {
            // TODO
        }
    },
    getBoundaryCount: function () {
        return this.outlineTempCircleBoundaries.length;
    },
    getCircleAreaBoundaries:function () {
        return this.outlineTempCircleBoundaries;
    }
    /*
     addCircleAreaBoundary(circleAreaBoundary){
     if(this.modificationStatus) {
     // TODO
     }
     }*/

};