const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class LBeam extends Boxes {
    constructor() {
        super();
        // this.buildArgParser("x", "y", "h", "outside");
        this.addSettingsArgs(edges.FingerJointSettings);
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let t = this.thickness;
        if (this.outside) {
            x = this.adjustSize(x, false);
            y = this.adjustSize(y, false);
        }
        this.rectangularWall(x, h, "eFee", {move: "right"});
        this.rectangularWall(y, h, "eeef");
    }

}

module.exports.LBeam = LBeam;