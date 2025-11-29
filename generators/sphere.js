const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class Sphere extends Boxes {
    constructor() {
        super();
        this.argparser.add_argument("--sphere_radius", {action: "store", type: "float", default: 100, help: "The radius of the assembled sphere"});
        this.argparser.add_argument("--amount_gores", {action: "store", type: "int", default: 6, help: "The amount of gores/parts you want the sphere to have, has to be at least 3"});
        this.argparser.add_argument("--top_hole_radius", {action: "store", type: "float", default: 30, help: "The size of the circular hole at the top"});
        this.argparser.add_argument("--bottom_hole_radius", {action: "store", type: "float", default: 80, help: "The size of the polygonal hole at the bottom"});
        this.argparser.add_argument("--scoring_lines", {action: "store", type: boolarg, default: false, help: "Add scoring lines to easier fold tabs"});
        this.argparser.add_argument("--cable_hook", {action: "store", type: "int", default: 0, help: "A hook to hang the sphere on a cable (for e.g. lamps), the amount of gores that have a hook"});
        this.argparser.add_argument("--cable_hook_radius", {action: "store", type: "float", default: 3, help: "The radius of the cable for the cable hook"});
        let defaultgroup = this.argparser._action_groups[1];
        for (let action of defaultgroup._actions) {
            if (action.dest === "tabs") {
                action.type = "int";
                action.default = 6;
                action.help = "The number of tabs. This has to be an even number";
            }
            if (action.dest === "thickness") {
                action.default = 1.0;
            }
        }
        defaultgroup.add_argument("--corner_tab", {action: "store", type: "float", default: 10.0, help: "The length of the tabs on the corners (in mm)(not supported everywhere). Keep as small as your material strength allows for cleaner result"});
        this.argparser.add_argument("--tab_width", {action: "store", type: "float", default: 5.0, help: "The width of the tabs (in mm)"});
    }

    calculateXOfGore(u) {
        return (Math.sin((u / this.sphere_radius)) * this.halfBellyLens);
    }

    coordinatesPartOfGore(u_start, u_stop, isRight, includeFinalTurn) {
        let N = this.resolution;
        let points = [];
        let direction = 1;
        if (!isRight) {
            direction = -1;
        }
        for (let i of numpy.linspace(u_start, u_stop, (N + 1))) {
            let u = i;
            let x = (direction * this.calculateXOfGore(u));
            points.append([x, u]);
        }
        if (includeFinalTurn) {
            if (isRight) {
                points.append(this.TurnToDirection((this.calculateTangentAngle(u_stop) * 180 / Math.PI)));
            }
            else {
                let unmirroredTangentAngle = this.calculateTangentAngle(u_stop);
                let heading = ((90 - unmirroredTangentAngle) + 180);
                points.append(this.TurnToDirection((heading * 180 / Math.PI)));
            }
        }
        return points;
    }

    coordinatesPartOfOffset(u_start, u_stop, normalDistance, isRight, includeFinalTurn) {
        let N = this.resolution;
        let points = [];
        let direction = 1;
        if (!isRight) {
            direction = -1;
        }
        for (let i of numpy.linspace(u_start, u_stop, (N + 1))) {
            let u = i;
            let u_offset = (u + (normalDistance * Math.sin(this.calculateNormalAngle(u))));
            let x_offset = (direction * (this.calculateXOfGore(u) + (normalDistance * Math.cos(this.calculateNormalAngle(u)))));
            points.append([x_offset, u_offset]);
        }
        if (includeFinalTurn) {
            if (isRight) {
                points.append(this.TurnToDirection((this.calculateTangentAngle(u_stop) * 180 / Math.PI)));
            }
            else {
                let unmirroredTangentAngle = this.calculateTangentAngle(u_stop);
                let heading = ((90 - unmirroredTangentAngle) + 180);
                points.append(this.TurnToDirection((heading * 180 / Math.PI)));
            }
        }
        return points;
    }

    scoringLines(u_start, u_stop, isRight) {
        let points = this.coordinatesPartOfGore(u_start, u_stop, isRight);
        this.drawPoints(points, {kerfdir: 0, close: false});
    }

    calculateNormalAngle(u) {
        return (this.calculateTangentAngle(u) - ((90 * Math.PI) / 180));
    }

    calculateTangentAngle(u) {
        return Math.atan2(this.gore_heigth, ((Math.cos((Math.PI * (u / this.gore_heigth))) * Math.PI) * this.halfBellyLens));
    }

    normalCompensation(u) {
        return (Math.sin(this.calculateNormalAngle(u)) * this.tab_width);
    }

    calculateXofTopAndGoreIntersection() {
        return Math.sqrt((((this.halfBellyLens ** 2) * (this.top_hole_radius ** 2)) / ((this.halfBellyLens ** 2) + (this.sphere_radius ** 2))));
    }

    calculateXofOffsetGore(u) {
        return (this.calculateXOfGore(u) + (Math.cos(this.calculateNormalAngle(u)) * this.tab_width));
    }

    calculateUpperUOfGore(x) {
        return ((Math.PI - Math.asin((x / this.halfBellyLens))) * this.sphere_radius);
    }

    calculateUOfBottomHole() {
        let theta = Math.asin((this.bottom_hole_radius / this.sphere_radius));
        return ((theta / Math.PI) * this.gore_heigth);
    }

    calculateLengthGoreTab() {
        let N = this.resolution;
        let length = 0;
        let x1 = this.calculateXOfGore(this.u_tabPoints[0]);
        for (let i of numpy.linspace(this.u_tabPoints[0], this.u_tabPoints[1], (N + 1))) {
            let u = i;
            let x2 = this.calculateXOfGore(u);
            let dx = (x2 - x1);
            let du = ((this.u_tabPoints[0] - this.u_tabPoints[1]) / N);
            length += Math.sqrt(((du ** 2) + (dx ** 2)));
            x1 = x2;
        }
        return length;
    }

    coordinatesTopHole(x_start, x_stop) {
        let N = this.resolution;
        let points = [];
        for (let i = 0; i < (N + 1); i += 1) {
            let x = ((((x_stop - x_start) / N) * i) + x_start);
            let u = ((Math.PI - Math.asin((Math.sqrt(((this.top_hole_radius ** 2) - (x ** 2))) / this.sphere_radius))) * this.sphere_radius);
            points.append([x, u]);
        }
        return points;
    }

    coordinatesCableHook() {
        let skewfactor = 0.8;
        let topWidth = (2 * this.x_rightGoreTop);
        let delta = ((topWidth * (1 - skewfactor)) / 2);
        let outercurveRadius = ((topWidth * skewfactor) / 2);
        let tipRadius = (((outercurveRadius * 2) - (this.cable_hook_radius * 2)) / 4);
        let points = [];
        points.append([(this.x_rightGoreTop - delta), (this.u_goreTop + topWidth)]);
        points.append(this.TurnToDirection(90));
        points.append(this.Curve(180, outercurveRadius));
        points.append(0);
        points.append(this.Curve(180, tipRadius));
        points.append(0);
        points.append(this.Curve(-180, this.cable_hook_radius));
        points.append(0);
        points.append(this.Curve(-90, outercurveRadius));
        points.append(0);
        points.append([((-this.x_rightGoreTop + delta) + (((tipRadius * 2) + (this.cable_hook_radius * 2)) - outercurveRadius)), ((this.u_goreTop + topWidth) - outercurveRadius)]);
        return points;
    }

    coordinatesToPolyline(points) {
        let polyPoints = [0];
        let distance = 0;
        let previousWasCurve = false;
        let previousAngle = 0;
        let i = 1;
        points.length
        if (isinstance(points[i], this.Curve)) {
            polyPoints.extend([points[i], points[(i + 1)]]);
            previousAngle += points[i].degrees;
            previousWasCurve = true;
            i += 2;
        }
        else {
            if (isinstance(points[i], this.TurnToDirection)) {
                let relativeAngle = (points[i].degrees - previousAngle);
                relativeAngle = (((relativeAngle + 180) % 360) - 180);
                polyPoints.extend([relativeAngle, 0]);
                previousAngle = points[i].degrees;
                i += 1;
            }
            else {
                if (previousWasCurve) {
                    previousWasCurve = false;
                    i += 1;
                }
                let absoluteAngle = (Math.atan2((points[i][1] - points[(i - 1)][1]), (points[i][0] - points[(i - 1)][0])) * 180 / Math.PI);
                relativeAngle = (absoluteAngle - previousAngle);
                relativeAngle = (((relativeAngle + 180) % 360) - 180);
                distance = Math.dist(points[i], points[(i - 1)]);
                if (distance > 0.0001) {
                    polyPoints.append(relativeAngle);
                    polyPoints.append(distance);
                    previousWasCurve = false;
                    previousAngle = absoluteAngle;
                }
                i += 1;
            }
        }
        return polyPoints;
    }

    coordinatesTabStart() {
        return [this.Curve(-180, (this.thickness / 2)), 0, this.Curve(180, ((this.tab_width - this.thickness) / 2)), 0];
    }

    coordinatesTabEnd() {
        return [this.Curve(180, ((this.tab_width - this.thickness) / 2)), 0, this.Curve(-180, (this.thickness / 2)), 0];
    }

    divideGore(numberOfTabs, tinyTabLength) {
        return numpy.linspace((this.u_goreBottom + tinyTabLength), (this.u_goreTop - tinyTabLength));
    }

    assemble(hook) {
        let coordinates = [];
        coordinates.extend(this.coordinatesPartOfGore(this.u_goreBottom, this.u_tabPoints[0], true, true));
        for (let i = 0; i < (this.u_tabPoints.length - 1); i += 2) {
            coordinates.extend(this.coordinatesTabStart());
            coordinates.extend(this.coordinatesPartOfOffset(this.u_tabPoints[i], this.u_tabPoints[(i + 1)], this.tab_width, true, true));
            coordinates.extend(this.coordinatesTabEnd());
            coordinates.extend(this.coordinatesPartOfGore(this.u_tabPoints[(i + 1)], this.u_tabPoints[(i + 2)], true, true));
        }
        let lastTabPoint = this.u_tabPoints[-1];
        let upperCornerU = (lastTabPoint + this.normalCompensation(lastTabPoint));
        coordinates.extend(this.coordinatesTabStart());
        if (upperCornerU < this.u_goreTop) {
            coordinates.extend(this.coordinatesPartOfOffset(lastTabPoint, (this.u_goreTop - this.normalCompensation(this.u_goreTop)), this.tab_width, true));
        }
        else {
            coordinates.extend([[this.calculateXofOffsetGore(lastTabPoint), upperCornerU]]);
        }
        coordinates.extend([[this.x_rightGoreTop, this.u_goreTop]]);
        if (hook) {
            coordinates.extend(this.coordinatesCableHook());
        }
        else {
            coordinates.extend(this.coordinatesTopHole(this.x_rightGoreTop, -this.x_rightGoreTop));
        }
        coordinates.extend(this.coordinatesPartOfGore(this.u_goreTop, lastTabPoint, false));
        for (let i = (this.u_tabPoints.length - 1); i < 0; i += -2) {
            coordinates.extend(this.coordinatesTabStart());
            coordinates.extend(this.coordinatesPartOfOffset(this.u_tabPoints[i], this.u_tabPoints[(i - 1)], this.tab_width, false));
            coordinates.extend(this.coordinatesTabEnd());
            coordinates.extend(this.coordinatesPartOfGore(this.u_tabPoints[(i - 1)], this.u_tabPoints[(i - 2)], false));
        }
        let firstTabPoint = this.u_tabPoints[0];
        let lowerCornerU = (firstTabPoint + this.normalCompensation(firstTabPoint));
        coordinates.extend(this.coordinatesTabStart());
        if (lowerCornerU > this.u_goreBottom) {
            coordinates.extend(this.coordinatesPartOfOffset(firstTabPoint, (this.u_goreBottom - this.normalCompensation(this.u_goreBottom)), this.tab_width, false));
        }
        else {
            coordinates.extend([[-this.calculateXofOffsetGore(firstTabPoint), lowerCornerU]]);
        }
        coordinates.extend([[-this.x_rightGoreBottom, this.u_goreBottom]]);
        coordinates.extend([[this.x_rightGoreBottom, this.u_goreBottom]]);
        return coordinates;
    }

    render() {
        if ((this.tabs % 2) === 1) {
            ValueError("The number of tabs has to be even")
        }
        if (this.tab_width <= this.thickness) {
            ValueError("The tab width has to be larger than the thickness of the material")
        }
        if (this.amount_gores < 3) {
            ValueError("The amount of gores has to be at least 3")
        }
        if (this.top_hole_radius < 0) {
            ValueError("The top hole radius cannot be negative")
        }
        if (this.top_hole_radius > this.sphere_radius) {
            ValueError("The top hole radius cannot be larger than the sphere radius")
        }
        if (this.bottom_hole_radius < 0) {
            ValueError("The bottom hole radius cannot be negative")
        }
        if (this.bottom_hole_radius > this.sphere_radius) {
            ValueError("The bottom hole radius cannot be larger than the sphere radius")
        }
        if (this.corner_tab < 0) {
            ValueError("The corner tab cannot be negative")
        }
        if (this.sphere_radius < 0) {
            ValueError("The sphere radius cannot be negative")
        }
        if ((this.thickness / 2) < this.burn) {
            ValueError("The material thickness has to be at least twice the burn thickness")
        }
        if (this.cable_hook > this.amount_gores) {
            ValueError("The amount of hooks cannot be larger than the amount of gores")
        }
        this.resolution = parseInt((this.sphere_radius / 10));
        this.gore_heigth = (Math.PI * this.sphere_radius);
        this.bellyLens = ((2 * Math.tan(((2 * Math.PI) / (2 * this.amount_gores)))) * this.sphere_radius);
        this.halfBellyLens = (this.bellyLens / 2);
        this.x_rightGoreTop = this.calculateXofTopAndGoreIntersection();
        if ((this.cable_hook_radius + 1) > (0.8 * this.x_rightGoreTop)) {
            ValueError("The cable hook radius is too big for this size top hole")
        }
        this.u_goreTop = this.calculateUpperUOfGore(this.x_rightGoreTop);
        this.u_goreBottom = this.calculateUOfBottomHole();
        this.x_rightGoreBottom = this.calculateXOfGore(this.u_goreBottom);
        this.u_tabPoints = this.divideGore(this.tabs, this.corner_tab);
        if (this.calculateLengthGoreTab() < (this.tab_width - this.thickness)) {
            ValueError("Too many tabs")
        }
        this.moveTo(-this.halfBellyLens, 30);
        let moveX = ((this.bellyLens + (this.tab_width * 2)) + 30);
        let drawHook = this.cable_hook;
        for (let i = 0; i < this.amount_gores; i += 1) {
            if (drawHook > 0) {
                let polyPoints = this.coordinatesToPolyline(this.assemble(true));
            }
            else {
                polyPoints = this.coordinatesToPolyline(this.assemble());
            }
            this.ctx.save();
            this.moveTo(0, -this.burn);
            this.polyline(...polyPoints);
            this.ctx.restore();
            if (this.scoring_lines) {
                this.ctx.save();
                this.moveTo(-this.calculateXOfGore(this.u_goreBottom), -this.u_goreBottom);
                for (let i = 0; i < (this.u_tabPoints.length - 1); i += 2) {
                    this.scoringLines(this.u_tabPoints[i], this.u_tabPoints[(i + 1)], true);
                }
                this.scoringLines(this.u_tabPoints[-1], this.u_goreTop, true);
                for (let i = (this.u_tabPoints.length - 1); i < 0; i += -2) {
                    this.scoringLines(this.u_tabPoints[i], this.u_tabPoints[(i - 1)], false);
                }
                this.scoringLines(this.u_tabPoints[0], this.u_goreBottom, false);
                this.ctx.restore();
            }
            drawHook -= 1;
            this.moveTo(moveX, 0);
        }
    }

}

module.exports.Sphere = Sphere;