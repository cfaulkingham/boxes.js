const { Boxes } = require('../boxes/boxes');
const { FingerJointSettings } = require('../boxes/edges');
const { LidSettings } = require('../boxes/lids');
const { edges } = require('../boxes/edges');
const { _TopEdge } = require('../boxes/lids');
const { Color } = require('../boxes/Color');

class BasedBox extends Boxes {
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
        this.rectangularWall(x, h, "fFFF", {move: "right", label: "Wall 1"});
        this.rectangularWall(y, h, "ffFf", {move: "up", label: "Wall 2"});
        this.rectangularWall(y, h, "ffFf", {label: "Wall 4"});
        this.rectangularWall(x, h, "fFFF", {move: "left up", label: "Wall 3"});
        this.rectangularWall(x, y, "ffff", {move: "right", label: "Top"});
        this.rectangularWall(x, y, "hhhh", {label: "Base"});
    }

}

module.exports.BasedBox = BasedBox;