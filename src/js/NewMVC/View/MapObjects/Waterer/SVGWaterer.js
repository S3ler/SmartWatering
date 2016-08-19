function SVGWaterer(svgMap, controller) {
    //function Waterer(svgMap, APIwaterer, controller) {
    // this.APIwaterer = APIwaterer;

    this.svgMap = svgMap;

    this.controller = controller;

    //this.area = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    //this.area.classList.add("waterer");


    //this.svgMap.appendChild(this.area);


    // TODO
    this.map = this.svgMap;

    var cx = 50000;
    var cy = 50000;
    this.centerX = 50000;
    this.centerY = 50000;

    this.lineLength = 400;

    this.animationInProgress = false;
    this.watererAngularSecondsSpeed = 20; // °/s

    this.waterer = document.createElementNS("http://www.w3.org/2000/svg", 'g');

    this.watererOutline = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    this.watererOutline.setAttribute("cx", cx);
    this.watererOutline.setAttribute("cy", cy);
    this.watererOutline.setAttribute("r", 300);
    this.watererOutline.setAttribute("id", "watererOutline");

    this.watererDirectionLine = document.createElementNS("http://www.w3.org/2000/svg", 'line');
    this.watererDirectionLine.setAttribute("x1", this.centerX);
    this.watererDirectionLine.setAttribute("y1", this.centerY);
    this.watererDirectionLine.setAttribute("x2", this.centerX);
    this.watererDirectionLine.setAttribute("y2", (this.centerY - this.lineLength));

    this.watererDirection = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
    var smallEdgesValue = 170;
    var directionEdge = 250;

    this.watererDirection.setAttribute("points",
        (cx - smallEdgesValue) + "," + (cy + smallEdgesValue) + " " +
        (cx + smallEdgesValue) + "," + (cy + smallEdgesValue) + " " +
        (cx) + "," + (cy - directionEdge)
    );


    this.watererDirection.setAttribute("id", "watererDirection");


    var directionTransformation = document.createElementNS("http://www.w3.org/2000/svg", 'animateTransform');
    directionTransformation.setAttribute("attributeName", "transform");
    directionTransformation.setAttribute("type", "rotate");
    var centerString = " " + this.centerX + " " + this.centerY;
    directionTransformation.setAttribute("from", 0 + centerString);
    directionTransformation.setAttribute("to", 0 + centerString);
    //map.getCurrentTime() +
    directionTransformation.setAttribute("begin", 0);
    directionTransformation.setAttribute("dur", 0);
    directionTransformation.setAttribute("fill", "freeze");


    var directionTransformationLine = document.createElementNS("http://www.w3.org/2000/svg", 'animateTransform');
    directionTransformationLine.setAttribute("attributeName", "transform");
    directionTransformationLine.setAttribute("type", "rotate");
    var centerString = " " + this.centerX + " " + this.centerY;
    directionTransformationLine.setAttribute("from", 0 + centerString);
    directionTransformationLine.setAttribute("to", 0 + centerString);
    //this.map.getCurrentTime() +
    directionTransformationLine.setAttribute("begin", 0);
    directionTransformationLine.setAttribute("dur", 0);
    directionTransformationLine.setAttribute("fill", "freeze");


    for (var distanceLevel = 1; distanceLevel < 6; distanceLevel++) {
        var watererDistance = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        watererDistance.setAttribute("class", "watererDistance");
        watererDistance.setAttribute("cx", cx);
        watererDistance.setAttribute("cy", cy);
        watererDistance.setAttribute("r", (distanceLevel * 2000));

        var watererDistanceDescription = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        watererDistanceDescription.setAttribute("class", "watererDistanceDescription");
        watererDistanceDescription.setAttribute("x", cx);
        watererDistanceDescription.setAttribute("y", (cx - distanceLevel * 2000- 50));
        watererDistanceDescription.innerHTML = (distanceLevel * 2) + " m";

        this.waterer.appendChild(watererDistance);
        this.waterer.appendChild(watererDistanceDescription);
    }


    this.watererDirectionLine.appendChild(directionTransformationLine);
    this.watererDirection.appendChild(directionTransformation);

    this.waterer.appendChild(this.watererOutline);
    this.waterer.appendChild(this.watererDirectionLine);
    this.waterer.appendChild(this.watererDirection);




    // for (var watererIndex = 0; watererIndex < watererDistance.length; watererIndex++) {
    //    this.waterer.appendChild(watererDistance[watererIndex]);
    //    this.waterer.appendChild(watererDistanceDescription[watererIndex]);
    //}
    this.map.appendChild(this.waterer);
}

SVGWaterer.prototype = {
    startWatering: function (x, y, radius) {
// create vectors
        var toWaterVector = {
            x: x - this.centerX,
            y: y - this.centerY,
        };


        var directionP = this.watererDirection.points.getItem(2);
        var currentVector = {
            x: directionP.x - this.centerX,
            y: directionP.y - this.centerY,
        };

        // normalize
        var len = Math.sqrt(toWaterVector.x * toWaterVector.x + toWaterVector.y * toWaterVector.y);
        toWaterVector.x /= len;
        toWaterVector.y /= len;

        len = Math.sqrt(currentVector.x * currentVector.x + currentVector.y * currentVector.y);
        currentVector.x /= len;
        currentVector.y /= len;

        var angleOfRotation = Math.atan2(toWaterVector.y, toWaterVector.x) - Math.atan2(currentVector.y, currentVector.x);
        if (angleOfRotation > Math.PI) {
            angleOfRotation -= 2 * Math.PI;
        } else if (angleOfRotation < (-Math.PI)) {
            angleOfRotation += 2 * Math.PI;
        }
        // to degree
        angleOfRotation = angleOfRotation * 180 / Math.PI;


        var currentRotation = 0;
        var currentDirectionTransformation = this.watererDirection.firstChild;
        var currentBegin = parseFloat(currentDirectionTransformation.getAttribute("begin"));
        var currentEnd = parseFloat(currentDirectionTransformation.getAttribute("dur"));

        var currentTime = this.map.getCurrentTime();
        if (currentTime >= (currentBegin + currentEnd)) { // animation is finished
            var res = currentDirectionTransformation.getAttribute("to").split(" ");
            currentRotation = parseFloat(res[0]);
        } else if (currentTime < (currentBegin + currentEnd)) { // animation still in progress
            var animationProgress = currentTime - currentBegin; // how much of the duration is animated
            var rotationProgress = animationProgress * this.watererAngularSecondsSpeed;


            var fromRotationRes = currentDirectionTransformation.getAttribute("from").split(" ");
            var toRotationRes = currentDirectionTransformation.getAttribute("to").split(" ");


            var fromRotation = parseFloat(fromRotationRes[0]);
            var toRotation = parseFloat(toRotationRes[0]);


            var rotationDifference;
            if (fromRotation >= 0 && toRotation >= 0) {
                rotationDifference = toRotation - fromRotation;
                if (rotationDifference >= 0) {
                    currentRotation = fromRotation + rotationProgress;
                } else if (rotationDifference < 0) {
                    currentRotation = fromRotation - rotationProgress;
                }
            } else if (fromRotation >= 0 && toRotation < 0) {
                rotationDifference = (-1) * ( fromRotation + Math.abs(toRotation) );
                currentRotation = fromRotation - rotationProgress;
            } else if (fromRotation < 0 && toRotation >= 0) {
                rotationDifference = (1) * ( Math.abs(fromRotation) + toRotation );
                currentRotation = fromRotation + rotationProgress;
            } else if (fromRotation < 0 && toRotation < 0) {
                rotationDifference = Math.abs(fromRotation) - Math.abs(toRotation);
                if (rotationDifference >= 0) {
                    currentRotation = fromRotation + rotationProgress;
                } else if (rotationDifference < 0) {
                    currentRotation = fromRotation - rotationProgress;
                }
            }

            /*
             while(this.watererDirection.firstChild) {
             this.watererDirection.removeChild(this.watererDirection.firstChild);
             }
             while(this.watererDirectionLine.firstChild) {
             this.watererDirectionLine.removeChild(this.watererDirectionLine.firstChild);
             }

             var animationTime = Math.abs((currentRotation - angleOfRotation) / this.watererAngularSecondsSpeed);
             //console.log(animationTime + " " + angleOfRotation);
             var directionTransformation = document.createElementNS("http://www.w3.org/2000/svg", 'animateTransform');
             directionTransformation.setAttribute("attributeName", "transform");
             directionTransformation.setAttribute("type", "rotate");
             var centerString = " " + this.centerX + " " + this.centerY;
             directionTransformation.setAttribute("from", currentRotation + centerString);
             directionTransformation.setAttribute("to", currentRotation + centerString);
             //this.map.getCurrentTime() +
             directionTransformation.setAttribute("begin", this.map.getCurrentTime());
             directionTransformation.setAttribute("dur",  0);
             directionTransformation.setAttribute("fill", "freeze");

             var directionTransformationLine = document.createElementNS("http://www.w3.org/2000/svg", 'animateTransform');
             directionTransformationLine.setAttribute("attributeName", "transform");
             directionTransformationLine.setAttribute("type", "rotate");
             //var centerString = " " + this.centerX + " " + this.centerY;
             directionTransformationLine.setAttribute("from", currentRotation + centerString);
             directionTransformationLine.setAttribute("to", currentRotation + centerString);
             //this.map.getCurrentTime() +
             directionTransformationLine.setAttribute("begin", this.map.getCurrentTime());
             directionTransformationLine.setAttribute("dur",  0 );
             directionTransformationLine.setAttribute("fill", "freeze");

             this.watererDirection.appendChild(directionTransformation);
             this.watererDirectionLine.appendChild(directionTransformationLine);
             */
        }


        /*
         while(this.watererDirection.firstChild) {
         this.watererDirection.removeChild(this.watererDirection.firstChild);
         }
         while(this.watererDirectionLine.firstChild) {
         this.watererDirectionLine.removeChild(this.watererDirectionLine.firstChild);
         }
         */


        /*
         var lastDirectTransformation = this.watererDirection.firstChild;
         var lastDur = parseFloat(lastDirectTransformation.getAttribute("dur"));
         var currentRotation;

         if(this.map.getCurrentTime() >= (lastBegin + lastDur)) {
         // animation is finished
         var res = lastDirectTransformation.getAttribute("to").split(" ");
         currentRotation = parseFloat(res[0]);
         }else{
         var fromRotationRes = lastDirectTransformation.getAttribute("from").split(" ");
         var fromRotation = parseFloat(fromRotationRes[0]);

         var toRotationRes = lastDirectTransformation.getAttribute("to").split(" ");
         var toRotation = parseFloat(toRotationRes[0]);
         if(lastDur != 0) {
         var rotated = ((fromRotation - toRotation) / lastDur) *(this.map.getCurrentTime() - lastBegin);
         var alreadyRotated =
         currentRotation = fromRotation + rotated;
         }else{
         currentRotation = toRotation;
         }

         }

         var directionP = this.watererDirection.points.getItem(2);
         var currentDirectionX = directionP.x - this.centerX;
         var currentDirectionY = directionP.y - this.centerY;

         var targetDirectionX = x  - this.centerX;
         var targetDirectionY = y  - this.centerY;

         // normalize:
         var len = Math.sqrt(targetDirectionX * targetDirectionX + targetDirectionY * targetDirectionY)
         targetDirectionX/=len;
         targetDirectionY/=len;

         len = Math.sqrt(currentDirectionX * currentDirectionX + currentDirectionY * currentDirectionY)
         currentDirectionX/=len;
         targetDirectionY/=len;

         var p1 = {
         x: currentDirectionX,
         y: currentDirectionY
         };

         var p2 = {
         x: targetDirectionX,
         y: targetDirectionY
         };

         // angle in radians
         var angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x);

         // angle in degrees
         //var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
         // angleDeg = angleDeg + 90
         var angleDeg = Math.atan2(p2.y, p2.x) - Math.atan2(p1.y, p1.x) * 180;


         console.log(angleDeg);

         // mathematically negative
         var rotationDirection = "negative";
         var angleOfRotation = angleDeg ;
         if(angleOfRotation < 0) {
         angleOfRotation = 360 + angleOfRotation;
         }

         if(angleOfRotation > 180) {
         angleOfRotation =(-1)*( 360 + (-1)*angleOfRotation);
         }

         //console.log(angleOfRotation);
         // 5 °/s
         */
        var deltaRotation;
        var rotationDifference;

        //console.log("angleOfRotation " +angleOfRotation);
        //console.log("currentRotation " +currentRotation);
        if (currentRotation >= 0 && angleOfRotation >= 0) {
            deltaRotation = angleOfRotation - currentRotation;
        } else if (currentRotation >= 0 && angleOfRotation < 0) {
            deltaRotation = (-1) * ( currentRotation + Math.abs(angleOfRotation) );
        } else if (currentRotation < 0 && angleOfRotation >= 0) {
            deltaRotation = (1) * ( Math.abs(currentRotation) + angleOfRotation );
        } else if (currentRotation < 0 && angleOfRotation < 0) {
            deltaRotation = Math.abs(currentRotation) - Math.abs(angleOfRotation);
        }
        //console.log("deltaRotation 1: " + deltaRotation);

        if (deltaRotation > 180) {
            // it is shorter to go in negative direction
            deltaRotation = (-1) * (360 - Math.abs(deltaRotation));
            angleOfRotation = currentRotation + deltaRotation;
        } else if (deltaRotation < -180) {
            // it is shorter to go in positive direction
            deltaRotation = 360 - Math.abs(deltaRotation);
            angleOfRotation = currentRotation + deltaRotation;
        }
        //console.log("deltaRotation 2: " + deltaRotation);


        var animationTime = Math.abs(deltaRotation / this.watererAngularSecondsSpeed);
        //console.log(animationTime + " " + angleOfRotation);
        var directionTransformation = document.createElementNS("http://www.w3.org/2000/svg", 'animateTransform');
        directionTransformation.setAttribute("attributeName", "transform");
        directionTransformation.setAttribute("type", "rotate");
        var centerString = " " + this.centerX + " " + this.centerY;
        directionTransformation.setAttribute("from", currentRotation + centerString);
        directionTransformation.setAttribute("to", angleOfRotation + centerString);
        //this.map.getCurrentTime() +
        directionTransformation.setAttribute("begin", this.map.getCurrentTime());
        directionTransformation.setAttribute("dur", (animationTime));
        directionTransformation.setAttribute("fill", "freeze");

        var directionTransformationLine = document.createElementNS("http://www.w3.org/2000/svg", 'animateTransform');
        directionTransformationLine.setAttribute("attributeName", "transform");
        directionTransformationLine.setAttribute("type", "rotate");
        //var centerString = " " + this.centerX + " " + this.centerY;
        directionTransformationLine.setAttribute("from", currentRotation + centerString);
        directionTransformationLine.setAttribute("to", angleOfRotation + centerString);
        //this.map.getCurrentTime() +
        directionTransformationLine.setAttribute("begin", this.map.getCurrentTime());
        directionTransformationLine.setAttribute("dur", ( animationTime));
        directionTransformationLine.setAttribute("fill", "freeze");

        if (document.getElementById("toWaterArea") != null) {
            document.getElementById("toWaterArea").parentNode.removeChild(document.getElementById("toWaterArea"));
        }
        // create new circle/area
        this.area = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        this.area.setAttribute("cx", x);
        this.area.setAttribute("cy", y);
        this.area.setAttribute("r", radius);
        this.area.setAttribute("id", "toWaterArea");

        while (this.watererDirection.firstChild) {
            this.watererDirection.removeChild(this.watererDirection.firstChild);
        }
        while (this.watererDirectionLine.firstChild) {
            this.watererDirectionLine.removeChild(this.watererDirectionLine.firstChild);
        }

        this.map.appendChild(this.area);

        this.watererDirection.appendChild(directionTransformation);
        this.watererDirectionLine.appendChild(directionTransformationLine);

        var timeout = setTimeout(function () {
                var area = document.getElementById("toWaterArea");
                if (area != null) {
                    if (!area.classList.contains('wateredArea')) {
                        area.classList.add('wateredArea');
                        var timout = setTimeout(function () {
                            var area = document.getElementById("toWaterArea");
                            if (area != null) {
                                if (area.classList.contains('wateredArea')) {
                                    area.classList.remove('wateredArea');
                                }
                                area.parentNode.removeChild(area);
                            }

                        }, 3000);
                    }
                }
            },
            animationTime * 1000);


        this.animationInProgress = true;
    },
    stop: function () {
        // we can find out actual values by: getCTM and getScreenCtM
        this.animationInProgress = false;
        this.watererDirection.pauseAnimations();
        this.watererDirectionLine.pauseAnimations();
    }
};