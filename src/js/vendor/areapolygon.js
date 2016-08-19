// circles must have x and y as center, and r as radius
function createTangentLines2(m0, m1) {
    var v_r = Vector.create([m1.x - m0.x, m1.y - m0.y]);
    setLength(v_r, m0.r);
    var v_r0 = v_r.dup();
    var sv_m1t0 = Vector.create([m1.x, m1.y]);
    var sv_m0t0 = Vector.create([m0.x, m0.y]);

    v_r0 = v_r0.rotate(-Math.PI/2, Vector.Zero(2));

    sv_m0t0 = sv_m0t0.add(v_r0);
    sv_m1t0 = sv_m1t0.add(v_r0);

    var l_t0 = document.createElementNS("http://www.w3.org/2000/svg", 'line');

    //l_t1.x2 = p_m2t1.x;
    //l_t1.y2 = p_m2t1.y;
    //l_t1.x1 = p_m1t1.x;
    //l_t1.y1 = p_m1t1.y;
    l_t0.setAttribute('x2', sv_m1t0.elements[0]);
    l_t0.setAttribute('y2', sv_m1t0.elements[1]);
    l_t0.setAttribute('x1', sv_m0t0.elements[0]);
    l_t0.setAttribute('y1', sv_m0t0.elements[1]);



    var v_r1 = v_r.dup();

    var sv_m0t1 = Vector.create([m0.x, m0.y]);
    var sv_m1t1 = Vector.create([m1.x, m1.y]);

    v_r1 = v_r1.rotate(Math.PI/2, Vector.Zero(2));

    sv_m0t1 = sv_m1t0.add(v_r1);
    sv_m1t1 = sv_m1t1.add(v_r1);

    var l_t1 = document.createElementNS("http://www.w3.org/2000/svg", 'line');

    // l_t2.x2 = p_m2t2.x;
    // l_t2.y2 = p_m2t2.y;
    // l_t2.x1 = p_m1t2.x;
    // l_t2.y1 = p_m1t2.y;
    l_t1.setAttribute('x2', sv_m1t1.elements[0]);
    l_t1.setAttribute('y2', sv_m1t1.elements[1]);
    l_t1.setAttribute('x1', sv_m0t1.elements[0]);
    l_t1.setAttribute('y1', sv_m0t1.elements[1]);

    return [l_t0, l_t1];

}

function setLength(vector, length) {
    var l = Math.sqrt(Math.pow(vector.elements[0],2)+Math.pow(vector.elements[1],2));
    var k = l/length ;
    vector.elements[0] /= k;
    vector.elements[1] /= k;
    return vector;
}


function calculateAreaPolygon(circles) {
    // TODO plausabilitätstest ob sich kreise überschneiden, ansonsten den größeren verringern bis keine überschneidung mehr vorliegt
    // wobei ist das sinnvoll?
    //var areasArray = sortByOrientation(circles);
    var areasArray = Array.prototype.slice.call(circles, 0);

    var outertangents = new Array();
    var tangentStart, tangentEnd;
    var temptangents;
    for (i = 0; i < areasArray.length; i++) {
        var m0 = areasArray[i];
        var m1 = areasArray[(i + 1) % areasArray.length];

        if(m0.r != m1.r) {
            temptangents = createTangentLines(m0, m1);
        }else{
            temptangents = createTangentLines2(m0, m1);
        }

        tangentStart = {
            x: temptangents[0].x1,
            y: temptangents[0].y1
        };
        tangentEnd = {
            x: temptangents[0].x2,
            y: temptangents[0].y2
        };
        if (isPointInPoly(areasArray, tangentStart) || isPointInPoly(areasArray, tangentEnd)) {
            outertangents.push(temptangents[1]);
        } else {
            outertangents.push(temptangents[0]);
        }
    }


    var graham = new ConvexHullGrahamScan();
    for (i = 0; i < areasArray.length; i++) {
        graham.addPoint(areasArray[i].x, areasArray[i].y);
    }
    var hull = graham.getHull();
    // hull.forEach(function (el) { addPoint(el.x, el.y); });


    // filter überschneidungen von innenliegenden Kreise raus
    for (i = 0; i < outertangents.length; i++) {
        tangentStart = {
            x: outertangents[i].x1.animVal.value,
            y: outertangents[i].y1.animVal.value
        };
        tangentEnd = {
            x: outertangents[i].x2.animVal.value,
            y: outertangents[i].y2.animVal.value
        };
        if (isPointInPoly(hull, tangentEnd)) {
            var nextTangent = outertangents[(i + 1) % areasArray.length];

            var line1 = Line.create(
                [tangentStart.x, tangentStart.y],
                [tangentEnd.x - tangentStart.x, tangentEnd.y - tangentStart.y]
            );
            var line2 = Line.create(
                [nextTangent.x1.animVal.value, nextTangent.y1.animVal.value],
                [nextTangent.x2.animVal.value - nextTangent.x1.animVal.value, nextTangent.y2.animVal.value - nextTangent.y1.animVal.value]
            );

            var intersection =
                line1.intersectionWith(line2);

            //addPoint(intersection.elements[0], intersection.elements[1]);

            outertangents[i].setAttribute("x2", intersection.elements[0]);
            outertangents[i].setAttribute("y2", intersection.elements[1]);

            nextTangent.setAttribute("x1", intersection.elements[0]);
            nextTangent.setAttribute("y1", intersection.elements[1]);
            i++;

            if (intersection == null) {
                throw new Error("intersection shall never be null");
            }

        }
    }

    // für alle nicht innen liegenden kreise, müssen nun die Halbkreise generiert werden
    var nextTangentStart;
    var path;
    var currentCircleCenter;
    var curves = new Array();
    for (i = 0; i < outertangents.length; i++) {

        tangentStart = {
            x: outertangents[i].x2.animVal.value,
            y: outertangents[i].y2.animVal.value
        };
        currentCircleCenter = {
            x: areasArray[i].x,
            y: areasArray[i].y
        };
        var nextTangent = outertangents[(i + 1) % areasArray.length];
        nextTangentStart = {
            x: nextTangent.x1.animVal.value,
            y: nextTangent.y1.animVal.value,
        };

        if (!isPointInPoly(hull, tangentStart) || !isPointInPoly(hull, nextTangentStart)) {

            var bezierCurce = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            var startPoint = "M" + tangentStart.x + "," + tangentStart.y;
            var endPoint = "" + nextTangentStart.x + "," + nextTangentStart.y;
            var A = "A" + areasArray[(i + 1) % areasArray.length].r + "," + areasArray[(i + 1) % areasArray.length].r;
            // var controlPoint =areasArray[i].y +"," +areasArray[i].x;
            bezierCurce.setAttribute('d', startPoint + " " + A + " 0 0,1 " + endPoint);

            curves.push(bezierCurce);

        }

    }


    // TODO check einführen ob fläche geschlossen ist
    return outertangents.concat(curves);
}

function isPointInPoly(poly, pt) {
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
    return c;
}

function isInHull(hull, pt) {
    return isPointInPoly(hull, pt);
}

function sortByOrientation(areas) {
    var toSort = Array.prototype.slice.call(areas, 0);
    var i;

    function getAnchorPoint(areas) {
        var result = areas[0];
        for (var i = 0; i < areas.length; i++) {
            if (areas[i].x < result.x && areas[i].y < result.y) {
                result = areas[i];
            }
        }
        return result;
    }

    var anchorPoint = getAnchorPoint(toSort);
    toSort.sort(function (a, b) {
        var polarA = ConvexHullGrahamScan.prototype._findPolarAngle(anchorPoint, a);
        var polarB = ConvexHullGrahamScan.prototype._findPolarAngle(anchorPoint, b);

        if (polarA < polarB) {
            return -1;
        }
        if (polarA > polarB) {
            return 1;
        }
        return 0;
    });

    return toSort;
}

function createTangentLines(m1, m2) {
    // TODO check if m1 in m2 etc.


    //  m1.x = parseFloat(m1.getAttribute("cx")); //- parseFloat(m1.getAttribute("r")) * 0.5;
    // m1.y = parseFloat(m1.getAttribute("cy"));// - parseFloat(m1.getAttribute("r")) * 0.5;
    // m2.x = parseFloat(m2.getAttribute("cx")); //- parseFloat(m2.getAttribute("r")) * 0.5;
    // m2.y = parseFloat(m2.getAttribute("cy"));// - parseFloat(m2.getAttribute("r")) * 0.5;

    var switched = false;
    //if (m1.getAttribute("r") > m2.getAttribute("r")) {
    if (m1.r > m2.r) {
        var tmp = m1;
        m1 = m2;
        m2 = tmp;
        switched = true;
        // m1 is always the circle with the smaller radius
    }
    var v_r = {
        x: undefined,
        y: undefined,
        length: Math.abs(m2.r) - parseFloat(m1.r)
    };

    var v_m1 = {
        x: m1.x,
        y: m1.y,
        length: Math.sqrt(Math.pow(m1.x, 2) + Math.pow(m1.y, 2))
    };

    var v_m2 = {
        x: m2.x,
        y: m2.y,
        length: Math.sqrt(Math.pow(m2.x, 2) + Math.pow(m2.y, 2))
    };
    var v_m1m2 = {
        x: v_m2.x - v_m1.x,
        y: v_m2.y - v_m1.y,
        length: Math.sqrt(Math.pow(v_m2.x - v_m1.x, 2) + Math.pow(v_m2.y - v_m1.y, 2))
    };

    var alpha = Math.asin(v_r.length / v_m1m2.length); //  * 180 / Math.PI
    var k = v_r.length / v_m1m2.length;
    v_m1m2.x *= k;
    v_m1m2.y *= k;
    v_m1m2.length =
        Math.sqrt(Math.pow(v_m1m2.x, 2) + Math.pow(v_m1m2.y, 2));


    var v_m2t1 = {
        x: v_m1m2.x * Math.cos(-Math.PI * 0.5 - alpha) - v_m1m2.y * Math.sin(-Math.PI * 0.5 - alpha),
        y: v_m1m2.x * Math.sin(-Math.PI * 0.5 - alpha) + v_m1m2.y * Math.cos(-Math.PI * 0.5 - alpha),
        length: v_m1m2.length
    };


    var v_m2t2 = {
        x: (-1) * v_m2t1.x * Math.cos(2 * alpha) - (-1) * v_m2t1.y * Math.sin(2 * alpha),
        y: (-1) * v_m2t1.x * Math.sin(2 * alpha) + (-1) * v_m2t1.y * Math.cos(2 * alpha),
        length: v_m1m2.length
    };


    k = m1.r / v_m2t1.length;
    v_m2t1.x *= k;
    v_m2t1.y *= k;
    v_m2t1.length =
        Math.sqrt(Math.pow(v_m2t1.x, 2) + Math.pow(v_m2t1.y, 2));

    var v_m1t1 = {
        x: v_m2t1.x,
        y: v_m2t1.y
    };

    // tangente m1
    //addLine(m1.x, m1.y, v_m1t1.x + v_m1.x, v_m1t1.y + v_m1.y);

    var v_m1t2 = {
        x: (-1) * v_m1t1.x * Math.cos(2 * alpha) - (-1) * v_m1t1.y * Math.sin(2 * alpha),
        y: (-1) * v_m1t1.x * Math.sin(2 * alpha) + (-1) * v_m1t1.y * Math.cos(2 * alpha)
    };

    // Tangente m1
    //addLine(m1.x, m1.y, v_m1t2.x + v_m1.x, v_m1t2.y + v_m1.y);

    k = m2.r / v_m2t1.length;
    v_m2t1.x *= k;
    v_m2t1.y *= k;
    //addLine(m2.x, m2.y, v_m2t1.x + v_m2.x, v_m2t1.y + v_m2.y);

    var p_m2t1 = {
        x: v_m2t1.x + m2.x,
        y: v_m2t1.y + m2.y
    };

    k = m2.r / v_m2t2.length;
    v_m2t2.x *= k;
    v_m2t2.y *= k;
    //addLine(m2.x, m2.y, v_m2t2.x + v_m2.x, v_m2t2.y + v_m2.y);

    var p_m2t2 = {
        x: v_m2t2.x + m2.x,
        y: v_m2t2.y + m2.y
    };

    var p_m1t1 = {
        x: v_m1t1.x + m1.x,
        y: v_m1t1.y + m1.y
    };
    var p_m1t2 = {
        x: v_m1t2.x + m1.x,
        y: v_m1t2.y + m1.y
    };

    var l_t1 = document.createElementNS("http://www.w3.org/2000/svg", 'line');

    //l_t1.x2 = p_m2t1.x;
    //l_t1.y2 = p_m2t1.y;
    //l_t1.x1 = p_m1t1.x;
    //l_t1.y1 = p_m1t1.y;
    l_t1.setAttribute('x2', p_m2t1.x);
    l_t1.setAttribute('y2', p_m2t1.y);
    l_t1.setAttribute('x1', p_m1t1.x);
    l_t1.setAttribute('y1', p_m1t1.y);
    l_t1.setAttribute('y1', p_m1t1.y);
    l_t1.setAttribute('stroke', "black");
    l_t1.setAttribute('stroke-width', "1");
    l_t1.setAttribute('fill', "red");


    var l_t2 = document.createElementNS("http://www.w3.org/2000/svg", 'line');

    // l_t2.x2 = p_m2t2.x;
    // l_t2.y2 = p_m2t2.y;
    // l_t2.x1 = p_m1t2.x;
    // l_t2.y1 = p_m1t2.y;
    l_t2.setAttribute('x2', p_m2t2.x);
    l_t2.setAttribute('y2', p_m2t2.y);
    l_t2.setAttribute('x1', p_m1t2.x);
    l_t2.setAttribute('y1', p_m1t2.y);
    l_t2.setAttribute('stroke', "black");
    l_t2.setAttribute('stroke-width', "1");
    l_t2.setAttribute('fill', "red");


    if (switched) {
        return [l_t2, l_t1];
    }
    return [l_t1, l_t2];

}
