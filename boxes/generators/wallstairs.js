const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');
const { _WallMountedBox } = require('../walledges');

class WallStairs extends _WallMountedBox {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--braceheight", {action: "store", type: "float", default: 30, help: "height of the brace at the bottom back (in mm). Zero for none"});
    }

    yWall(move) {
        let t = this.thickness;
        let x;
        let sx;
        let y;
        let sy;
        let sh;
        [x, sx, y, sy, sh] = [this.x, this.sx, this.y, this.sy, this.sh];
        let tw;
        let th;
        [tw, th] = [sy.reduce((a, b) => a + b, 0), (Math.max(sh) + t)];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.polyline((y - t), 90);
        this.edges["f"](this.braceheight);
        this.step(t);
        this.edges["A"]((sh[-1] - this.braceheight));
        this.corner(90);
        for (let i = (sy.length - 1); i < 0; i += -1) {
            this.edges["f"](sy[i]);
            this.step((sh[(i - 1)] - sh[i]));
        }
        this.edges["f"](sy[0]);
        this.polyline(0, 90, sh[0], 90);
        this.move(tw, th, move);
    }

    yCB(width) {
        let t = this.thickness;
        let posx = (-0.5 * t);
        for (let dx of this.sx.slice(0, -1)) {
            posx += (dx + t);
            this.fingerHolesAt(posx, 0, width, 90);
        }
    }

    render() {
        this.generateWallEdges();
        this.extra_height = 20;
        let t = this.thickness;
        let sx;
        let sy;
        let sh;
        [sx, sy, sh] = [this.sx, this.sy, this.sh];
        for (let w of sy) {
            this.rectangularWall(x, w, "eheh", {callback: [() => this.yCB(w)], move: "up"});
        }
        if (this.braceheight) {
            this.rectangularWall(x, this.braceheight, "eheh", {callback: [() => this.yCB(this.braceheight)], move: "up"});
        }
        for (let i = 0; i < (sx.length + 1); i += 1) {
            this.yWall({move: "right"});
        }
    }

}

module.exports.WallStairs = WallStairs;