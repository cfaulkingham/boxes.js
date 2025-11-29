const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class RackBox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 1.2});
        // this.buildArgParser("x", "y", "h", "outside");
        this.argparser.add_argument("--triangle", {action: "store", type: "float", default: 25.0, help: "Sides of the triangles holding the lid in mm"});
        this.argparser.add_argument("--d1", {action: "store", type: "float", default: 2.0, help: "Diameter of the inner lid screw holes in mm"});
        this.argparser.add_argument("--d2", {action: "store", type: "float", default: 3.0, help: "Diameter of the lid screw holes in mm"});
        this.argparser.add_argument("--d3", {action: "store", type: "float", default: 4.0, help: "Diameter of the mounting screw holes in mm"});
        this.argparser.add_argument("--holedist", {action: "store", type: "float", default: 7.0, help: "Distance of the screw holes from the wall in mm"});
    }

    wallxCB() {
        let t = this.thickness;
        this.fingerHolesAt(0, (this.h - (1.5 * t)), this.triangle, 0);
        this.fingerHolesAt(this.x, (this.h - (1.5 * t)), this.triangle, 180);
    }

    wallxfCB() {
        let t = this.thickness;
        let hd = this.holedist;
        for (let x of [hd, ((this.x + (3 * hd)) + (2 * t))]) {
            for (let y of [hd, ((this.h - hd) + t)]) {
                this.hole(x, y, (this.d3 / 2.0));
            }
        }
        this.moveTo((t + (2 * hd)), t);
        this.wallxCB();
    }

    wallyCB() {
        let t = this.thickness;
        this.fingerHolesAt(0, (this.h - (1.5 * t)), this.triangle, 0);
        this.fingerHolesAt(this.y, (this.h - (1.5 * t)), this.triangle, 180);
    }

    render() {
        let t = this.thickness;
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let d1;
        let d2;
        let d3;
        [d1, d2, d3] = [this.d1, this.d2, this.d3];
        let hd = this.holedist;
        let tr = this.triangle;
        let trh = (tr / 3.0);
        if (this.outside) {
        }
        else {
        }
        this.rectangularWall(x, h, "fFeF", {callback: [this.wallxCB], move: "right"});
        this.rectangularWall(y, h, "ffef", {callback: [this.wallyCB], move: "up"});
        this.flangedWall(x, h, "FFeF", {callback: [this.wallxfCB], r: t, flanges: [0.0, (2 * hd), 0, (2 * hd)]});
        this.rectangularWall(y, h, "ffef", {callback: [this.wallyCB], move: "left up"});
        this.rectangularWall(x, y, "fFFF", {move: "right"});
        this.rectangularWall(x, y, {callback: ([() => this.hole(trh, trh)] * 4), move: "up"});
        this.rectangularTriangle(tr, tr, "ffe", {num: 4, callback: [null, () => this.hole(trh, trh)]});
    }

}

module.exports.RackBox = RackBox;