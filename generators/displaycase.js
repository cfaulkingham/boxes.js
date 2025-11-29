const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class DisplayCase extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser("x", "y", "h", "outside");
        this.argparser.add_argument("--overhang", {action: "store", type: "float", default: 2, help: "overhang for joints in mm"});
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        if (this.outside) {
            x = this.adjustSize(x);
            y = this.adjustSize(y);
            h = this.adjustSize(h);
        }
        let t = this.thickness;
        let d2 = edges.Bolts(2);
        let d3 = edges.Bolts(3);
        this.rectangularWall(x, h, "ffff", {bedBolts: ([d2] * 4), move: "right", label: "Wall 1"});
        this.rectangularWall(y, h, "fFfF", {bedBolts: [d3, d2, d3, d2], move: "up", label: "Wall 2"});
        this.rectangularWall(y, h, "fFfF", {bedBolts: [d3, d2, d3, d2], label: "Wall 4"});
        this.rectangularWall(x, h, "ffff", {bedBolts: ([d2] * 4), move: "left up", label: "Wall 3"});
        this.flangedWall(x, y, "FFFF", {flanges: ([this.overhang] * 4), move: "right", label: "Top"});
        this.flangedWall(x, y, "FFFF", {flanges: ([this.overhang] * 4), label: "Bottom"});
    }

}

module.exports.DisplayCase = DisplayCase;