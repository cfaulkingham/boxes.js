const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class SlantedTray extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--front_height", {action: "store", type: "float", default: 0.3, help: "height of the front as fraction of the total height"});
    }

    finger_holes_CB(sx, h) {
        let t = this.thickness;
        let pos = (-0.5 * t);
        for (let x of sx.slice(0, -1)) {
            pos += (x + t);
            this.fingerHolesAt(pos, 0, h);
        }
    }

    render() {
        let sx;
        let y;
        let h;
        [sx, y, h] = [this.sx, this.y, this.h];
        let t = this.thickness;
        if (this.outside) {
        }
        let front_height = (h * this.front_height);
        let x = (sx.reduce((a, b) => a + b, 0) + (t * (sx.length - 1)));
        this.rectangularWall(x, h, "eFfF", {move: "up", callback: [partial(this.finger_holes_CB, sx, h)]});
        this.rectangularWall(x, y, "FFfF", {move: "up", callback: [partial(this.finger_holes_CB, sx, y)]});
        this.rectangularWall(x, front_height, "FFeF", {move: "up", callback: [partial(this.finger_holes_CB, sx, front_height)]});
        for (let _ = 0; _ < (sx.length + 1); _ += 1) {
            this.trapezoidWall(y, h, front_height, "ffef", {move: "right"});
        }
    }

}

module.exports.SlantedTray = SlantedTray;