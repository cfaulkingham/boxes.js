import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class RoundedBox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(boxes.edges.FingerJointSettings);
        this.addSettingsArgs(boxes.edges.DoveTailSettings);
        this.addSettingsArgs(boxes.edges.FlexSettings);
        // this.buildArgParser("x", "y", "outside");
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 15, help: "Radius of the corners in mm"});
        this.argparser.add_argument("--wallpieces", {action: "store", type: "int", default: 1, choices: [1, 2, 3, 4], help: "number of pieces for outer wall"});
        this.argparser.add_argument("--edge_style", {action: "store", type: boxes.ArgparseEdgeType("fFh"), choices: list("fFh"), default: "f", help: "edge type for top and bottom edges"});
        this.argparser.add_argument("--top", {action: "store", type: "str", default: "hole", choices: ["hole", "lid", "closed"], help: "style of the top and lid"});
    }

    hole() {
        let t = this.thickness;
        let x;
        let y;
        let r;
        [x, y, r] = [this.x, this.y, this.radius];
        let dr = (2 * t);
        if (this.edge_style === "h") {
            dr = t;
        }
        if (r > dr) {
            r -= dr;
        }
        else {
            this.moveTo((dr - r), 0);
            r = 0;
        }
        let lx = ((x - (2 * r)) - (2 * dr));
        let ly = ((y - (2 * r)) - (2 * dr));
        this.moveTo(0, dr);
        for (let l of [lx, ly, lx, ly]) {
            this.edge(l);
            this.corner(90, r);
        }
    }

    cb(nr) {
        let h = (0.5 * this.thickness);
        let left;
        let l;
        let right;
        [left, l, right] = this.surroundingWallPiece(nr, this.x, this.y, this.radius, this.wallpieces);
        for (let dh of this.sh.slice(0, -1)) {
            h += dh;
            this.fingerHolesAt(0, h, l, 0);
        }
    }

    render() {
        let x;
        let y;
        let sh;
        let r;
        [x, y, sh, r] = [this.x, this.y, this.sh, this.radius];
        if (this.outside) {
        }
        let t = this.thickness;
        let h = (sh.reduce((a, b) => a + b, 0) + (t * (sh.length - 1)));
        let es = this.edge_style;
        let corner_holes = true;
        if (this.edge_style === "f") {
            let pe = "F";
            let ec = false;
        }
        else {
            if (this.edge_style === "F") {
                pe = "f";
                ec = false;
            }
            else {
                pe = "f";
                corner_holes = true;
                ec = true;
            }
        }
        this.ctx.save();
        this.roundedPlate(x, y, r, es, {wallpieces: this.wallpieces, extend_corners: ec, move: "right"});
        for (let dh of this.sh.slice(0, -1)) {
            this.roundedPlate(x, y, r, "f", {wallpieces: this.wallpieces, extend_corners: false, move: "right"});
        }
        this.roundedPlate(x, y, r, es, {wallpieces: this.wallpieces, extend_corners: ec, move: "right", callback: (this.top !== "closed" ? [this.hole] : null)});
        if (this.top === "lid") {
            let r_extra = this.edges[this.edge_style].spacing();
            this.roundedPlate((x + (2 * r_extra)), (y + (2 * r_extra)), (r + r_extra), "e", {wallpieces: this.wallpieces, extend_corners: false, move: "right"});
        }
        this.ctx.restore();
        this.roundedPlate(x, y, r, es, {wallpieces: this.wallpieces, move: "up only"});
        this.surroundingWall(x, y, r, h, pe, pe, {pieces: this.wallpieces, callback: this.cb});
    }

}

export { RoundedBox };