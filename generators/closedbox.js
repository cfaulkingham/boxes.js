const { Boxes } = require('../boxes/boxes');
const { FingerJointSettings } = require('../boxes/edges');
const { LidSettings } = require('../boxes/lids');
const { edges } = require('../boxes/edges');
const { _TopEdge } = require('../boxes/lids');
const { Color } = require('../boxes/Color');

class ClosedBox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser("x", "y", "h", "outside");
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
        this.rectangularWall(x, h, "FFFF", {bedBolts: ([d2] * 4), move: "right", label: "Wall 1"});
        this.rectangularWall(y, h, "FfFf", {bedBolts: [d3, d2, d3, d2], move: "up", label: "Wall 2"});
        this.rectangularWall(y, h, "FfFf", {bedBolts: [d3, d2, d3, d2], label: "Wall 4"});
        this.rectangularWall(x, h, "FFFF", {bedBolts: ([d2] * 4), move: "left up", label: "Wall 3"});
        this.rectangularWall(x, y, "ffff", {bedBolts: [d2, d3, d2, d3], move: "right", label: "Top"});
        this.rectangularWall(x, y, "ffff", {bedBolts: [d2, d3, d2, d3], label: "Bottom"});
    }

}

module.exports.ClosedBox = ClosedBox;