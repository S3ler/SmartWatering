// Notation for the use of GIS

// vector or point: [ x , y ]
// line_segment: [ vector, vector ]
// polygon: [ vector , vector , ... ] with: the vector n-1 is automatically connected to the vector 0
// line_segments: [ line_segment, line_segment ]
// circle: [ x, y, r]
// bezier_circle: [ x, y, r, bezierString]
// outline: [ (line_segment, bezier_circle,)^+ line_segment, bezier_circle ]


var GIS = {
    createRectanglePolygon: function (vector1, vector2) {
        var resultPolygon = [];

        resultPolygon.push(vector1);
        resultPolygon.push([vector1[1], vector1[0]]);

        resultPolygon.push(vector2);
        resultPolygon.push([vector2[1], vector2[0]]);

        return resultPolygon;
    },
    pointsVectorInPolygon: function (intersection, polygon) {
        var point = [intersection.elements[0], intersection.elements[1]];
        return this.isPointInPolygon(point, polygon);
    },
    createBezierCirclesEqual: function (outerLineSegments, circles) {
        var nextLineSegmentStart, currentLineSegmentEnd, currentCircle;
        var bezierCircles = [];
        for (var j = 0; j < outerLineSegments.length; j++) {
            currentCircle = circles[j];
            if (j % 2 != 0) {
                if (currentCircle[2] < circles[((j + 1) % outerLineSegments.length)][2]) {
                    currentLineSegmentEnd = outerLineSegments[j][1];
                    nextLineSegmentStart = outerLineSegments[((j + 1) % outerLineSegments.length)][1];
                }
            } else {
                currentLineSegmentEnd = outerLineSegments[j][1];
                nextLineSegmentStart = outerLineSegments[((j + 1) % circles.length)][0];
            }


            // var currentLineSegmentEnd = outerLineSegments[j][1];
            //var nextLineSegmentStart = outerLineSegments[((j + 1) % outerLineSegments.length)][0];
            // var currentLineSegmentEnd= [circles[j][0],circles[j][1]]

            // nextLineSegmentStart= [circles[((j + 1) % outerLineSegments.length)][0],circles[((j + 1) % outerLineSegments.length)][1]]

            var bezierString = this.createBezierString(currentLineSegmentEnd, nextLineSegmentStart, currentCircle);

            bezierCircles.push([currentCircle[0], currentCircle[1], currentCircle[2], bezierString]);


        }
        return bezierCircles;
    },
    createBezierCircles: function (outerLineSegments, circles) {

        var bezierCircles = [];
        var beforeCircle, currentCircle, nextCircle, moreThan180Degree, bezierString;
        for (var j = 0; j < outerLineSegments.length; j++) {
            var currentLineSegmentEnd = outerLineSegments[j][1];
            var nextLineSegmentStart = outerLineSegments[((j + 1) % circles.length)][0];
            currentCircle = circles[j];
            nextCircle = circles[((j + 1) % circles.length)];
            if (currentCircle[2] == nextCircle[2]) {
                bezierString = this.createBezierString000(currentLineSegmentEnd, nextLineSegmentStart, nextCircle);
            } else if (nextCircle[2] > currentCircle[2]) {
                bezierString = this.createBezierString000(currentLineSegmentEnd, nextLineSegmentStart, nextCircle);
            } else {
                bezierString = this.createBezierString000(currentLineSegmentEnd, nextLineSegmentStart, nextCircle);
            }

            bezierCircles.push([currentCircle[0], currentCircle[1], currentCircle[2], bezierString]);
        }


        // check auf mehr als 180 circle or not
        var current, next, before;
        var centerVectorLength;
        for (var i = 0; i < bezierCircles.length; i++) {
            before = bezierCircles[i];
            current = bezierCircles[(i + 1) % bezierCircles.length];
            next = bezierCircles[(i + 2) % bezierCircles.length];

            currentLineSegmentEnd = outerLineSegments[i][1];
            nextLineSegmentStart = outerLineSegments[((i + 1) % outerLineSegments.length)][0];
            var v_end_point = Vector.create([currentLineSegmentEnd[0], currentLineSegmentEnd[1]]);
            var v_start_point = Vector.create([nextLineSegmentStart[0], nextLineSegmentStart[1]]);
            var v_line_direction = v_start_point.subtract(v_end_point);
            var v_line_anchor = Vector.create([current[0], current[1]]);
            var l_tangents = Line.create(v_line_anchor, v_line_direction);


            var v_center_before = Vector.create([before[0], before[1]]);
            var v_center_after = Vector.create([next[0], next[1]]);

            var v_closest_before = l_tangents.pointClosestTo(v_center_before);
            var v_closest_after = l_tangents.pointClosestTo(v_center_after);

            centerVectorLength = this.getVectorLength(v_closest_before.subtract(v_closest_after));

            //centerVectorLength = this.getLineSegmentLength([before[0], before[1]], [next[0], next[1]]);
            if ((centerVectorLength + before[2] + next[2]) < 2 * current[2]) { // less then 180 degree
                bezierString = this.to010BezierString(before[3]);
                before[3] = bezierString;
            }
        }
        return bezierCircles;
    },
    to010BezierString: function (bezierString) {
        if (bezierString.indexOf(" 0 0 0 ") !== -1) {
            return bezierString.replace(" 0 0 0 ", " 0 1 0 ");
        }
        return bezierString;
    },
    createBezierString010: function (startPoint, endPoint, basicCircle) {
        var start = "M " + startPoint[0] + "," + startPoint[1];
        var end = " " + endPoint[0] + "," + endPoint[1];
        var A = "A " + basicCircle[2] + "," + basicCircle[2];
        return start + " " + A + " 0 1 0 " + end;
    },
    createBezierString000: function (startPoint, endPoint, basicCircle) {
        var start = "M " + startPoint[0] + "," + startPoint[1];
        var end = " " + endPoint[0] + "," + endPoint[1];
        var A = "A " + basicCircle[2] + "," + basicCircle[2];
        return start + " " + A + " 0 0 0 " + end;
    },
    createBezierString: function (startPoint, endPoint, basicCircle) {
        var start = "M " + startPoint[0] + "," + startPoint[1];
        var end = " " + endPoint[0] + "," + endPoint[1];
        var A = "A " + basicCircle[2] + "," + basicCircle[2];
        return start + " " + A + " 0 0 1 " + end;
    },
    createTangentLineSegments: function (circles) {
        var lineSegments1 = [];
        var lineSegments2 = [];
        var i;
        for (i = 0; i < circles.length; i++) {
            var circle1 = circles[i];
            var circle2 = circles[((i + 1) % circles.length)];
            var lineSegments = this.createTangentLineSegment(circle1, circle2);

            lineSegments1.push(lineSegments[0]);
            lineSegments2.push(lineSegments[1]);

        }
        return {lineSegments1: lineSegments1, lineSegments2: lineSegments2};
    },
    createOutline: function (circles) {
        if (circles.length == 1) {
            // createBezierString010: function (startPoint, endPoint, basicCircle) {
            var circle = circles[0];
            var startPoint = [circle[0] + circle[2], circle[1]];
            var endPoint = [(circle[0] + circle[2]), (circle[1] + 0.1)];
            return [[circle[0], circle[1], circle[2], this.createBezierString010(startPoint, endPoint, circle) + " Z"]];
        }


        var __ret = this.createTangentLineSegments(circles);
        var lineSegments1 = __ret.lineSegments1;
        var inverseCircleOrder = [];
        for (var j = circles.length - 1; j >= 0; j--) {
            inverseCircleOrder.push([circles[j][0], circles[j][1], circles[j][2]]);
        }
        __ret = this.createTangentLineSegments(inverseCircleOrder);
        var lineSegments2 = __ret.lineSegments1;


        var outerLineSegments = this.getOuterLineSegments(lineSegments1, lineSegments2, circles);
        var bezierCircles = this.createBezierCircles(outerLineSegments, circles);

        var result = [];
        var lineSegment;
        for (var i = 0; i < bezierCircles.length; i++) {
            lineSegment = outerLineSegments[i];
            //result.push([lineSegment[0][0], lineSegment[0][1], 50]);
            //result.push([lineSegment[1][0], lineSegment[1][1], 50]);
            result.push(lineSegment);
            result.push(bezierCircles[i]);
        }
        return result;
    },
    scaleVectorToLength: function (vector, length) {
        var l = this.getVectorLength(vector);
        var k = l / length;
        var resultVector = vector.dup();
        resultVector.elements[0] /= k;
        resultVector.elements[1] /= k;
        return resultVector;
    },
    getVectorLength: function (vector) {
        return Math.sqrt(Math.pow(vector.elements[0], 2) + Math.pow(vector.elements[1], 2));
    },
    getLineSegmentBetweenEqualCircles: function (circle1, circle2, v_center_scaled, v_Center_Rotation) {
        var v_anchor_circle1 = Vector.create([circle1[0], circle1[1]]);
        var v_anchor_circle2 = Vector.create([circle2[0], circle2[1]]);
        var v_center_rotated = v_center_scaled.dup().rotate(v_Center_Rotation, Vector.Zero(2));

        var v_lineSegment_start = v_anchor_circle1.add(v_center_rotated);
        var v_lineSegment_end = v_anchor_circle2.add(v_center_rotated);

        return [[v_lineSegment_start.elements[0], v_lineSegment_start.elements[1]],
            [v_lineSegment_end.elements[0], v_lineSegment_end.elements[1]]];
    },
    createTangentLineSegmentsForEqualCircles: function (circle1, circle2) {
        var v_Center = Vector.create([circle2[0] - circle1[0], circle2[1] - circle1[1]]);
        var v_center_scaled = this.scaleVectorToLength(v_Center, circle1[2]);
        var line_segment1 = this.getLineSegmentBetweenEqualCircles(circle1, circle2, v_center_scaled, Math.PI / 2);
        var line_segment2 = this.getLineSegmentBetweenEqualCircles(circle1, circle2, v_center_scaled, -Math.PI / 2);
        return [line_segment1, line_segment2];
    },
    getLineSegmentBetweenUnequalCircles: function (circle1, circle2, v_center1_scaled, v_center2_scaled, v_Center_Rotation) {
        var v_anchor_circle1 = Vector.create([circle1[0], circle1[1]]);
        var v_anchor_circle2 = Vector.create([circle2[0], circle2[1]]);

        var v_center1_rotated = v_center1_scaled.dup().rotate(v_Center_Rotation, Vector.Zero(2));
        var v_center2_rotated = v_center2_scaled.dup().rotate(v_Center_Rotation, Vector.Zero(2));

        var v_lineSegment_start = v_anchor_circle1.add(v_center1_rotated);
        var v_lineSegment_end = v_anchor_circle2.add(v_center2_rotated);

        //    return [[v_lineSegment_start.elements[0], v_lineSegment_end.elements[1]], [v_lineSegment_start.elements[0], v_lineSegment_end.elements[1]]];
        return [[v_lineSegment_start.elements[0], v_lineSegment_start.elements[1]], [v_lineSegment_end.elements[0], v_lineSegment_end.elements[1]]];
    },
    createTangenLIneSegmentsForUnequalCircles: function (circle1, circle2) { // circle1 must be the one with the bigger Radius
        var smaller_circle = [circle1[0], circle1[1], (circle1[2] - circle2[2])];
        var v_Center = Vector.create([circle2[0] - circle1[0], circle2[1] - circle1[1]]);
        var v_Center_length = this.getVectorLength(v_Center);
        var additional_rotation = Math.asin(smaller_circle[2] / v_Center_length);

        var v_center1_scaled = this.scaleVectorToLength(v_Center.dup(), circle1[2]);
        var v_center2_scaled = this.scaleVectorToLength(v_Center.dup(), circle2[2]);

        var line_segment1 = this.getLineSegmentBetweenUnequalCircles(circle1, circle2,
            v_center1_scaled, v_center2_scaled, Math.PI / 2 - additional_rotation);

        var line_segment2 = this.getLineSegmentBetweenUnequalCircles(circle1, circle2,
            v_center1_scaled, v_center2_scaled, -Math.PI / 2 + additional_rotation);

        line_segment2 = [[line_segment2[1][0], line_segment2[1][1]], [line_segment2[0][0], line_segment2[0][1]]];

        // [[v_lineSegment_start.elements[0], v_lineSegment_start.elements[1]]
        // ,
        // [v_lineSegment_end.elements[0], v_lineSegment_end.elements[1]]];

        return [line_segment1, line_segment2];
    },
    createTangentLineSegment: function (circle1, circle2) {
        if (circle1[2] == circle2[2]) {
            return this.createTangentLineSegmentsForEqualCircles(circle1, circle2);
        } else {
            var lineSegments;
            if (circle1[2] > circle2[2]) {
                lineSegments = this.createTangenLIneSegmentsForUnequalCircles(circle1, circle2);
                return [lineSegments[0], lineSegments[1]];

            } else {
                lineSegments = this.createTangenLIneSegmentsForUnequalCircles(circle2, circle1);
                return [lineSegments[1], lineSegments[0]];
            }
        }
    },
    getOuterLineSegments: function (lineSegments1, lineSegments2, circles) {
        var zeroMomentum = this.getZeroMomentum(circles);
        var lineSegments1ZeroMomentumDistanceLength = 0;
        var lineSegments2ZeroMomentumDistanceLength = 0;
        for (var i = 0; i < lineSegments1.length; i++) {
            lineSegments1ZeroMomentumDistanceLength += this.getLineSegmentLength(zeroMomentum, lineSegments1[i][0]);
            lineSegments1ZeroMomentumDistanceLength += this.getLineSegmentLength(zeroMomentum, lineSegments1[i][1]);

            lineSegments2ZeroMomentumDistanceLength += this.getLineSegmentLength(zeroMomentum, lineSegments2[i][0]);
            lineSegments2ZeroMomentumDistanceLength += this.getLineSegmentLength(zeroMomentum, lineSegments2[i][1]);

        }
        return lineSegments1;
        if (lineSegments1ZeroMomentumDistanceLength > lineSegments2ZeroMomentumDistanceLength) {
            return lineSegments1;
        }
        return lineSegments2
    },
    getZeroMomentum: function (polygon) {
        var x = 0, y = 0;
        var el;
        for (var i = 0; i < polygon.length; i++) {
            el = polygon[i];
            x += el[0];
            y += el[1];
        }
        x /= polygon.length;
        y /= polygon.length;
        return [x, y];
    },
    getMaximumDistance:function(polygon, point)        {
        var distance;
        var maxDistance = Number.MIN_VALUE;
        for (var i = 0; i < polygon.length; i++) {
            distance = this.getLineSegmentLength(point, polygon[i]);
            if (distance > maxDistance) {
                maxDistance = distance;
            }
        }
        return maxDistance;
    },
    getLineSegmentLength:function(point1, point2)
    {
        return Math.sqrt(Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2));
    },
    createBezierCircles2: function (outerLineSegments, circles) {
        var bezierCircles = [];
        var nextCircle, moreThan180Degree, bezierString;
        for (var j = 0; j < outerLineSegments.length; j++) {
            var currentLineSegmentEnd = outerLineSegments[j][1];
            var nextLineSegmentStart = outerLineSegments[((j + 1) % circles.length)][0];
            var currentCircle = circles[j];
            nextCircle = circles[((j + 1) % circles.length)];
            // TODO wenn nächstes / aktuelle </> sind => ändere die 0 0 0 um: > 180 => 0 1 0 | < 180 => 0 0 0
            if (currentCircle[2] == nextCircle[2]) {
                bezierString = this.createBezierString000(currentLineSegmentEnd, nextLineSegmentStart, nextCircle);
            } else if (nextCircle[2] > currentCircle[2]) {
                // TODO check auf mehr als 180 circle or not
                bezierString = this.createBezierString000(currentLineSegmentEnd, nextLineSegmentStart, nextCircle);
            } else {
                bezierString = this.createBezierString000(currentLineSegmentEnd, nextLineSegmentStart, nextCircle);
            }

            bezierCircles.push([currentCircle[0], currentCircle[1], currentCircle[2], bezierString]);
        }
        return bezierCircles;
    },
    createBezierCircles1: function (outerLineSegments, circles) {
        var bezierCircles = [];
        var nextCircle, moreThan180Degree, bezierString;
        for (var j = 0; j < outerLineSegments.length; j++) {
            var currentLineSegmentEnd = outerLineSegments[j][1];
            var nextLineSegmentStart = outerLineSegments[((j + 1) % circles.length)][0];
            var currentCircle = circles[j];
            nextCircle = circles[((j + 1) % circles.length)];
            if (currentCircle[2] == nextCircle[2]) {
                bezierString = this.createBezierString(currentLineSegmentEnd, nextLineSegmentStart, nextCircle);
            } else {
                bezierString = this.createBezierString(currentLineSegmentEnd, nextLineSegmentStart, nextCircle);
            }

            bezierCircles.push([currentCircle[0], currentCircle[1], currentCircle[2], bezierString]);
        }
        return bezierCircles;
    },
    createBezierCirclesEqual: function (outerLineSegments, circles) {
        var bezierCircles = [];
        var nextCircle, moreThan180Degree, bezierString;
        for (var j = 0; j < outerLineSegments.length; j++) {
            var currentLineSegmentEnd = outerLineSegments[j][1];
            var nextLineSegmentStart = outerLineSegments[((j + 1) % circles.length)][0];
            var currentCircle = circles[j];
            nextCircle = circles[((j + 1) % circles.length)];
            if (currentCircle[2] == nextCircle[2]) {
                bezierString = this.createBezierString(currentLineSegmentEnd, nextLineSegmentStart, nextCircle);
            }

            bezierCircles.push([currentCircle[0], currentCircle[1], currentCircle[2], bezierString]);
        }
        return bezierCircles;
    }
};