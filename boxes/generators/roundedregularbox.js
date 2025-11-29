const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class RoundedRegularBox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(boxes.edges.FingerJointSettings);
        this.addSettingsArgs(boxes.edges.DoveTailSettings);
        this.addSettingsArgs(boxes.edges.FlexSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--sides", {action: "store", type: "int", default: 5, help: "number of sides"});
        this.argparser.add_argument("--inner_size", {action: "store", type: "float", default: 150, help: "diameter of the inner circle in mm"});
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 15, help: "Radius of the corners in mm"});
        this.argparser.add_argument("--wallpieces", {action: "store", type: "int", default: 0, help: "number of pieces for outer wall (0 for one per side)"});
        this.argparser.add_argument("--top", {action: "store", type: "str", default: "hole", choices: ["hole", "lid", "closed"], help: "style of the top and lid"});
    }

    holeCB() {
        let n = this.sides;
        let t = this.thickness;
        let poly = ([this.side, [(360 / n), (this.radius - (2 * t))]] * n);
        this.moveTo((-this.side / 2), (2 * t));
        this.polygonWall(poly, {edge: "e", turtle: true});
    }

    render() {
        let n = this.sides;
        let t = this.thickness;
        if (this.wallpieces === 0) {
            this.wallpieces = n;
        }
        let _radius;
        let height;
        let side;
        [_radius, height, side] = this.regularPolygon(n);
        let poly = [(side / 2), [(360 / n), this.radius]];
        let parts = 1;
        for (let i = 0; i < (n - 1); i += 1) {
            if (((this.wallpieces * (i + 1)) / n) >= parts) {
                poly.extend([(side / 2), 0, (side / 2), [(360 / n), this.radius]]);
                parts += 1;
            }
            else {
                poly.extend([side, [(360 / n), this.radius]]);
            }
        }
        poly.extend([(side / 2), 0]);
        this.ctx.save();
        this.polygonWall(poly, {move: "right"});
        if (this.top === "closed") {
            this.polygonWall(poly, {move: "right"});
        }
        else {
            this.polygonWall(poly, {callback: [this.holeCB], move: "right"});
        }
        if (this.top === "lid") {
            this.polygonWall(([this.side, [(360 / n), (this.radius + t)]] * n), {edge: "e", move: "right"});
        }
        this.ctx.restore();
        this.polygonWall(poly, {move: "up only"});
        this.moveTo(0, t);
        this.polygonWalls(poly, this.h);
    }

}

module.exports.RoundedRegularBox = RoundedRegularBox;