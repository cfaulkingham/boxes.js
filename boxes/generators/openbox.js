const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class OpenBox extends Boxes {
    constructor() {
        super();
        // this.buildArgParser("x", "y", "h", "outside");
        this.argparser.add_argument("--edgetype", {action: "store", type: ArgparseEdgeType("Fh"), choices: list("Fh"), default: "F", help: "edge type"});
        this.addSettingsArgs(edges.FingerJointSettings);
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let t = this.thickness;
        if (this.outside) {
            x = this.adjustSize(x);
            y = this.adjustSize(y, false);
            h = this.adjustSize(h, false);
        }
        let e = this.edgetype;
        this.rectangularWall(x, h, [e, e, "e", e], {move: "right"});
        this.rectangularWall(y, h, [e, "e", "e", "f"], {move: "up"});
        this.rectangularWall(y, h, [e, "e", "e", "f"]);
        this.rectangularWall(x, y, "efff", {move: "left"});
    }

}

module.exports.OpenBox = OpenBox;