function CreateNewCircleAreaAreaDialog(svgMap, x, y, controller) {

    this.simpleCircleArea=null;

    this.titel = "Neue Fläche erstellen";
    this.svgMap = svgMap;
    this.controller = controller;
    this.x = x;
    this.y = y;
    this.infoBoxHeight = (27 * 100);
    this.infoBoxWidth = (20 * 100);
    this.sliders = {};
    this.svgMap.appendChild(this.createInfoBox());


}

CreateNewCircleAreaAreaDialog.prototype={
    // create InfoBox
    createInfoBox: function () {
        this.boxForeignObject = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
        this.boxForeignObject.setAttribute("id", "createnewcircleareaareinfobox");
        this.boxForeignObject.setAttribute("x", this.x);
        this.boxForeignObject.setAttribute("y", this.y);
        this.boxForeignObject.setAttribute("height", this.infoBoxHeight + "");
        this.boxForeignObject.setAttribute("width", this.infoBoxWidth + "");

        this.boxForeignObject.appendChild(this.createContent());

        return this.boxForeignObject;
    },
    createContent: function () {
        var boxContent = document.createElement("div");
        boxContent.setAttribute("class", "InfoBox");
        boxContent.appendChild(this.createDivTitel());
        boxContent.appendChild(this.createDivTop());
        boxContent.appendChild(this.createDivBottom());

        return boxContent;
    },
    createDivTitel: function () {
        var divTitel = document.createElement("div");
        divTitel.classList.add("InfoBoxTitleDiv");
        divTitel.innerHTML = this.titel;
        this.divTitel = divTitel;
        return divTitel;
    },
    createDivTop: function () {
        var divTop = document.createElement("div");
        divTop.classList.add("InfoBoxTopDiv");
        // append here for top
        divTop.appendChild(this.createEmptyDiv());
        divTop.appendChild(this.createButtonDiv("Fläche speichern", this.dispatchSaveAreaButtonMouseClick));
        divTop.appendChild(this.createButtonDiv("Fläche bewässern", this.dispatchWaterOutlineButtonMouseClick));
        return divTop;
    },
    createDivBottom: function () {
        var divBottom = document.createElement("div");
        divBottom.classList.add("InfoBoxBottomDiv");
        divBottom.appendChild(this.createLeftDiv());
        divBottom.appendChild(this.createMoveDiv());
        return divBottom;
    },
    createButtonDiv: function (name, onclickMethod) {
        var buttonDiv = document.createElement("div");
        var button = document.createElement("button");
        button.innerHTML = name;
        button.onclick = onclickMethod.bind(this);
        buttonDiv.appendChild(button);

        return buttonDiv;
    },
    createEmptyDiv: function () {
        var buttonDiv = document.createElement("div");
        var button = document.createElement("button");
        buttonDiv.appendChild(button);

        return buttonDiv;
    },
    createSliderDiv: function(min, max, step, startValue, setter, getter, name, unit){
        var divSlider = document.createElement("div");
        divSlider.classList.add("InfoBoxSliderDiv");
        divSlider.appendChild(this.createSliderNameDiv(name));
        divSlider.appendChild(this.createSliderAndInputDiv(min, max, step, startValue, setter, getter, name, unit));
        return divSlider;
    },
    createSliderNameDiv: function (name) {
        var sliderNameDiv = document.createElement("div");
        sliderNameDiv.classList.add("SliderName");
        sliderNameDiv.innerHTML = name;
        this.sliders[name] = {};
        return sliderNameDiv;
    },
    createSliderAndInputDiv: function (min, max, step, startValue, setter, getter, name, unit) {
        var sliderAndInputDiv = document.createElement("div");
        sliderAndInputDiv.appendChild(this.createSlider(min, max, step, startValue, setter, getter, name));
        sliderAndInputDiv.appendChild(this.createInputDIv(min, max, step, startValue, setter, getter, name, unit));
        return sliderAndInputDiv;
    },
    createSlider: function (min, max, step, startValue, setter, getter, name) {
        var slider = document.createElement("input");
        slider.setAttribute("min", min + "");
        slider.setAttribute("max", max + "");
        slider.setAttribute("step", step + "");
        slider.setAttribute("type", "range");
        slider.setAttribute("value", startValue + "");
        var radiusSliderOnInput = function (el) {
            var newNumber = parseFloat(el.target.value);
            if (isNaN(newNumber)) {
                return;
            }
            var min = el.target.min;
            var max = el.target.max;
            if (newNumber >= min && newNumber <= max) {
                setter(newNumber);
            }
        };
        slider.oninput = radiusSliderOnInput.bind(this);
        this.sliders[name]["Slider"] = slider;
        return slider;
    },
    createInputDIv: function (min, max, step, startValue, setter, getter, name, unit) {
        var radiusInputDiv = document.createElement("div");
        radiusInputDiv.classList.add("InfoBoxSliderInputDiv");
        radiusInputDiv.appendChild(this.createNumberInput(min, max, step, startValue, setter, getter, name));
        radiusInputDiv.appendChild(this.createInputDescription(unit));
        return radiusInputDiv;
    },
    createNumberInput: function (min, max, step, startValue, setter, getter, name) {
        var numberInput = document.createElement("input");
        numberInput.setAttribute("min", min + "");
        numberInput.setAttribute("max", max + "");
        numberInput.setAttribute("step", step + "");
        numberInput.setAttribute("value", startValue + "");
        numberInput.setAttribute("type", "number");
        var numberInputOnInput = function (el) {
            var newNumber = parseFloat(el.target.value);
            if (isNaN(newNumber)) {
                return;
            }
            var min = el.target.min;
            var max = el.target.max;
            if (newNumber >= min && newNumber <= max) {
                setter(newNumber);
            }
        };
        numberInput.oninput = numberInputOnInput.bind(this);
        this.sliders[name]["NumberInput"] = numberInput;

        return numberInput;
    },
    createInputDescription: function (unit) {
        var radiusInputDescription = document.createElement("div");
        radiusInputDescription.classList.add("InfoBoxSliderUnit");
        radiusInputDescription.innerHTML = unit;
        return radiusInputDescription;
    },
    createLeftDiv: function () {
        var leftDiv = document.createElement("div");
        // append here for left bottom
        leftDiv.appendChild(this.createEmptyDiv());
        leftDiv.appendChild(this.createButtonDiv("abbrechen", this.dispatchAbortButtonMouseClick));
        leftDiv.appendChild(this.createClearDiv());
        return leftDiv;
    },
    createClearDiv: function () {
        var divClear = document.createElement("div");
        divClear.classList.add("ClearDiv");
        return divClear;
    },
    createMoveDiv: function () {
        var divMove = document.createElement("div");
        divMove.classList.add("MoveDiv");

        var svgMove = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svgMove.classList.add("moveinfoboxsvg");
        svgMove.setAttribute("width", "100%");
        svgMove.setAttribute("height", "100%");

        svgMove.onmousedown = this.dispatchMouseDown.bind(this);
        svgMove.onmouseup = this.dispatchMouseUp.bind(this);
        svgMove.onmouseout = this.dispatchOnMouseOut.bind(this);

        svgMove.onclick = this.dispatchMouseClick.bind(this);
        divMove.appendChild(svgMove);

        this.svgMove = svgMove;
        return divMove;
    },
    // functions for svgMove
    dispatchOnMouseOut: function (evt) {
        var loc = this.getCursor(evt);

        if (this.lastLoc != null && Math.abs(loc.x - this.lastLoc.x) < 5 && Math.abs(loc.y - this.lastLoc.y) < 5) {
            // this.area.setAttribute("cx", loc.x);
            // this.area.setAttribute("cy", loc.y);

            this.lastLoc = loc;
        } else {
            this.notLeft = false;
            this.lastLoc = null;
            this.mouseDownTimePoint = null;
            this.mousedownEndTime = null;
            this.mousedownStartLoc = null;
            this.svgMove.onmousemove = null;
        }
    },
    dispatchMouseClick: function (evt) {
        if (this.isMouseClick) {
            if (this.selected) {
                //this.controller
            } else {
                //this.controller
            }
        } else {
            this.isMouseClick = true;
        }
        if (this.isLongTab) {
            // this.controller
            // this.controller
        } else {
            this.isLongTab = true;
        }

    },
    dispatchMouseUp: function (evt) {

        this.mousedownEndTime = +new Date();
        var difference = this.mousedownEndTime - this.mouseDownTimePoint;
        if (difference <= 150) {
            this.isMouseClick = true;
        } else {
            this.isMouseClick = false;
        }

        if (difference > 1000) {
            var loc = this.getCursor(evt);

            this.isLongTab = false;
        } else {
            this.isLongTab = false;
        }

        this.notLeft = false;
        this.lastLoc = null;
        this.mouseDownTimePoint = null;
        this.mousedownEndTime = null;
        this.mousedownStartLoc = null;
        this.svgMove.onmousemove = null;

    },
    dispatchMouseMove: function (evt) {
        if (this.notLeft && this.lastLoc != null) {
            var loc = this.getCursor(evt);
            var newX = this.getX() + 1.0 * (loc.x - this.lastLoc.x);
            var newY = this.getY() + 1.0 * (loc.y - this.lastLoc.y);
            this.setX(newX);
            this.setY(newY);
            this.lastLoc = loc;
        }

    },
    dispatchMouseDown: function (evt) {
        var target = evt.target || event.srcElement;
        if (target == this.svgMove) {
            var loc = this.getCursor(evt);
            this.svgMove.onmousemove = this.dispatchMouseMove.bind(this);

            this.notLeft = true;
            this.lastLoc = loc;
            this.mouseDownTimePoint = +new Date();
            this.mouseDownStartLoc = loc;
        }
    },
    getCursor: function (evt) {
        var svg = document.getElementById("map");
        var pt = svg.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        return pt.matrixTransform(svg.getScreenCTM().inverse());
    },
    // setter and getter for infobox
    setTitel: function (titel) {
        this.titel = titel;
        this.divTitel.innerHTML = this.titel;
    },
    hide: function () {
        if (this.svgMap.contains(this.boxForeignObject)) {
            this.svgMap.removeChild(this.boxForeignObject);
        }
    },
    show: function () {
        if (!this.svgMap.contains(this.boxForeignObject)) {
            this.svgMap.appendChild(this.boxForeignObject);
        }
    },
    isShown:function () {
        return this.svgMap.contains(this.boxForeignObject);
    },
    getX: function () {
        return Number.parseFloat(this.boxForeignObject.getAttribute("x"));
    },
    setX: function (x) {
        this.boxForeignObject.setAttribute("x", x);
    },
    getY: function () {
        return Number.parseFloat(this.boxForeignObject.getAttribute("y"));
    },
    setY: function (y) {
        this.boxForeignObject.setAttribute("y", y);
    },
    // setter and getter for representation incl. value-translation
    getArea: function () {
        return this.simpleCircleArea;
    },
    setArea: function (simpleCircleArea) {
        this.simpleCircleArea = simpleCircleArea;
    },
    // functionality for buttons
    dispatchWaterOutlineButtonMouseClick: function () {
        // TODO
    },
    dispatchSaveAreaButtonMouseClick: function () {
        this.controller.saveNewCircleArea(this.simpleCircleArea);
    },
    dispatchAbortButtonMouseClick: function () {
        this.controller.abortNewCircleArea(this.simpleCircleArea);
    }
};
