const { Boxes } = require('../boxes/boxes');
const { FingerJointSettings } = require('../boxes/edges');
const { LidSettings } = require('../boxes/lids');
const { edges } = require('../boxes/edges');
const { _TopEdge } = require('../boxes/lids');
const { Color } = require('../boxes/Color');

class BOX extends Boxes {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--XX", {action: "store", type: "float", default: 0.5, help: "DESCRIPTION"});
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let t = this.thickness;
        let s = edges.FingerJointSettings(this.thickness);
        let p = edges.FingerJointEdge(this, s);
        p.char = "a";
        this.addPart(p);
    }

}

module.exports.BOX = BOX;