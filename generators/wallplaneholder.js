const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');
const { _WallMountedBox } = require('../walledges');

class WallPlaneHolder extends _WallMountedBox {
    constructor() {
        super();
        this.argparser.add_argument("--width", {action: "store", type: "float", default: 80, help: "width of the plane"});
        this.argparser.add_argument("--length", {action: "store", type: "float", default: 250, help: "length of the plane"});
        this.argparser.add_argument("--hold_length", {action: "store", type: "float", default: 30, help: "length of the part holding the plane over the front"});
        this.argparser.add_argument("--height", {action: "store", type: "float", default: 80, help: "height of the front of plane"});
    }

    side() {
        let l;
        let w;
        let h;
        [l, w, h] = [this.length, this.width, this.height];
        let hl = this.hold_length;
        let t = this.thickness;
        this.fingerHolesAt((1.5 * t), (2 * t), (0.25 * l), 90);
        this.fingerHolesAt((1.5 * t), ((2 * t) + (0.75 * l)), (0.25 * l), 90);
        this.fingerHolesAt(((2.5 * t) + h), (((2 * t) + l) - hl), hl, 90);
        this.fingerHolesAt((2 * t), (1.5 * t), (h + (2 * t)), 0);
    }

    render() {
        this.generateWallEdges();
        let l;
        let w;
        let h;
        [l, w, h] = [this.length, this.width, this.height];
        let t = this.thickness;
        this.rectangularWall((h + (4 * t)), (l + (2 * t)), "eeea", {callback: [this.side], move: "right"});
        this.rectangularWall((h + (4 * t)), (l + (2 * t)), "eeea", {callback: [this.side], move: "right"});
        this.rectangularWall(w, (h + (2 * t)), "efFf", {move: "up"});
        this.rectangularWall(w, (0.25 * l), "ffef", {move: "up"});
        this.rectangularWall(w, (0.25 * l), "efef", {move: "up"});
        this.rectangularWall(w, this.hold_length, "efef", {move: "up"});
    }

}

module.exports.WallPlaneHolder = WallPlaneHolder;