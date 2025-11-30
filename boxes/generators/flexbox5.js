import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class FlexBox5 extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(boxes.edges.FingerJointSettings);
        this.addSettingsArgs(boxes.edges.FlexSettings);
        // this.buildArgParser("x", "h", "outside");
        this.argparser.add_argument("--top_diameter", {action: "store", type: "float", default: 60, help: "diameter at the top"});
        this.argparser.add_argument("--bottom_diameter", {action: "store", type: "float", default: 60, help: "diameter at the bottom"});
        this.argparser.add_argument("--latchsize", {action: "store", type: "float", default: 8, help: "size of latch in multiples of thickness"});
    }

    flexBoxSide(callback, move) {
        let t = this.thickness;
        let r1;
        let r2;
        [r1, r2] = [(this.top_diameter / 2.0), (this.bottom_diameter / 2)];
        let a = this.a;
        let l = this.l;
        let tw;
        let th;
        [tw, th] = [((l + r1) + r2), ((2 * Math.max(r1, r2)) + (2 * t))];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(r2, t);
        this.cc(callback, 0);
        this.edges["f"](l);
        this.corner((180 + (2 * a)), r1);
        this.cc(callback, 1);
        this.latch(this.latchsize);
        this.cc(callback, 2);
        this.edges["f"]((l - this.latchsize));
        this.corner((180 - (2 * a)), r2);
        this.move(tw, th, move);
    }

    surroundingWall(move) {
        let t = this.thickness;
        let r1;
        let r2;
        [r1, r2] = [(this.top_diameter / 2.0), (this.bottom_diameter / 2)];
        let h = this.h;
        let a = this.a;
        let l = this.l;
        let c1 = (((180 + (2 * a)) * Math.PI / 180) * r1);
        let c2 = (((180 - (2 * a)) * Math.PI / 180) * r2);
        let tw = (((2 * l) + c1) + c2);
        let th = (h + (2.5 * t));
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(0, (0.25 * t));
        this.edges["F"]((l - this.latchsize), false);
        this.edges["X"](c2, (h + (2 * t)));
        this.edges["F"](l, false);
        this.edges["X"](c1, (h + (2 * t)));
        this.latch(this.latchsize, false);
        this.edge((h + (2 * t)));
        this.latch(this.latchsize, false, true);
        this.edge(c1);
        this.edges["F"](l, false);
        this.edge(c2);
        this.edges["F"]((l - this.latchsize), false);
        this.corner(90);
        this.edge((h + (2 * t)));
        this.corner(90);
        this.move(tw, th, move);
    }

    render() {
        if (this.outside) {
            this.x = this.adjustSize(this.x);
            this.h = this.adjustSize(this.h);
            this.top_diameter = this.adjustSize(this.top_diameter);
            this.bottom_diameter = this.adjustSize(this.bottom_diameter);
        }
        let t = this.thickness;
        this.latchsize *= this.thickness;
        let d_t;
        let d_b;
        [d_t, d_b] = [this.top_diameter, this.bottom_diameter];
        this.x = Math.max(this.x, ((this.latchsize + (2 * t)) + ((d_t + d_b) / 2)));
        let d_c = ((this.x - (d_t / 2.0)) - (d_b / 2.0));
        this.a = (Math.asin((((d_t - d_b) / 2) / d_c)) * 180 / Math.PI);
        this.l = (d_c * Math.cos((this.a * Math.PI / 180)));
        this.surroundingWall({move: "up"});
        this.flexBoxSide({move: "right"});
        this.flexBoxSide({move: "mirror"});
    }

}

export { FlexBox5 };