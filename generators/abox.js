const { Boxes } = require('../boxes/boxes');
const { FingerJointSettings } = require('../boxes/edges');
const { LidSettings } = require('../boxes/lids');
const { edges } = require('../boxes/edges');
const { _TopEdge } = require('../boxes/lids');
const { Color } = require('../boxes/Color');

class ABox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(LidSettings);
        // this.buildArgParser("x", "y", "h", "outside", "bottom_edge");
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let t = this.thickness;
        let t1;
        let t2;
        let t3;
        let t4;
        [t1, t2, t3, t4] = "eeee";
        let b = this.edges.get(this.bottom_edge, this.edges["F"]);
        let sideedge = "F";
        if (this.outside) {
        }
        this.ctx.save();
        this.rectangularWall(x, h, [b, sideedge, t1, sideedge], {ignore_widths: [1, 6], move: "up"});
        this.rectangularWall(x, h, [b, sideedge, t3, sideedge], {ignore_widths: [1, 6], move: "up"});
        if (this.bottom_edge !== "e") {
            this.rectangularWall(x, y, "ffff", {move: "up"});
        }
        this.lid(x, y);
        this.ctx.restore();
        this.rectangularWall(x, h, [b, sideedge, t3, sideedge], {ignore_widths: [1, 6], move: "right only"});
        this.rectangularWall(y, h, [b, "f", t2, "f"], {ignore_widths: [1, 6], move: "up"});
        this.rectangularWall(y, h, [b, "f", t4, "f"], {ignore_widths: [1, 6], move: "up"});
    }

}

module.exports.ABox = ABox;
