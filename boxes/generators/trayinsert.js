import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class SlantedEdge extends Boxes {
    __call__(length) {
        let angle = Math.Math.Math.Math.abs(this.settings);
        if (angle === 0) {
            let poly = [length];
        }
        else {
            let d = (length * Math.tan((angle * Math.PI / 180)));
            let l = (length / Math.cos((angle * Math.PI / 180)));
            poly = [0, -90, d, (90 + angle), l, -angle, 0];
        }
        if (this.settings >= 0) {
            poly.reverse();
        }
        this.polyline(...poly);
    }

}

export { SlantedEdge };
class TrayInsert extends Boxes {
    constructor() {
        super();
        // this.buildArgParser("sx", "sy", "h", "outside");
        this.argparser.add_argument("--x", {action: "store", type: "float", default: -1, help: "X dimension of tray/box that this fits into"});
        this.argparser.add_argument("--y", {action: "store", type: "float", default: -1, help: "Y dimension of tray/box that this fits into"});
        this.argparser.add_argument("--draft_angle", {action: "store", type: "float", default: 0.0, help: "amount the walls angle outwards toward to top (above sizes are at the bottom)"});
    }

    render() {
        if (this.outside) {
            this.sx = this.adjustSize(this.sx, false, false);
            this.sy = this.adjustSize(this.sy, false, false);
        }
        let t = this.thickness;
        let x = (this.sx.reduce((a, b) => a + b, 0) + (t * (this.sx.length - 1)));
        let y = (this.sy.reduce((a, b) => a + b, 0) + (t * (this.sy.length - 1)));
        let h = this.h;
        let l = SlantedEdge(this, -this.draft_angle);
        let r = SlantedEdge(this, this.draft_angle);
        if (this.x > x) {
            let delta = (this.x - x);
            if (delta > (2 * t)) {
                this.sx = [((delta / 2) - t), ...this.sx, ((delta / 2) - t)];
            }
            else {
                this.sx[0] += (delta / 2);
                this.sx[-1] += (delta / 2);
            }
            x = this.x;
        }
        if (this.y > y) {
            delta = (this.y - y);
            if (delta > (2 * t)) {
                this.sy = [((delta / 2) - t), ...this.sy, ((delta / 2) - t)];
            }
            else {
                this.sy[0] += (delta / 2);
                this.sy[-1] += (delta / 2);
            }
            y = this.y;
        }
        for (let i = 0; i < (this.sx.length - 1); i += 1) {
            let e = [new edges.SlottedEdge(this, this.sy), r, "e", l];
            this.rectangularWall(y, h, e, {move: "up"});
        }
        for (let i = 0; i < (this.sy.length - 1); i += 1) {
            e = ["e", r, new edges.SlottedEdge(this, this.sx.slice(0,  /* step -1 ignored */), "e"), l];
            this.rectangularWall(x, h, e, {move: "up"});
        }
    }

}

export { TrayInsert };