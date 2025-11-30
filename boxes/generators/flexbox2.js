import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class FlexBox2 extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.FlexSettings);
        // this.buildArgParser("x", "y", "h", "outside");
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 15, help: "Radius of the corners in mm"});
        this.argparser.add_argument("--latchsize", {action: "store", type: "float", default: 8, help: "size of latch in multiples of thickness"});
    }

    flexBoxSide(y, h, r, callback, move) {
        let t = this.thickness;
        if (this.move((y + (2 * t)), (h + t), move, true)) {
            return;
        }
        this.moveTo(t, t);
        this.cc(callback, 0);
        this.edges["f"](y);
        this.corner(90, 0);
        this.cc(callback, 1);
        this.edges["f"]((h - r));
        this.corner(90, r);
        this.cc(callback, 2);
        this.edge((y - (2 * r)));
        this.corner(90, r);
        this.cc(callback, 3);
        this.latch(this.latchsize);
        this.cc(callback, 4);
        this.edges["f"](((h - r) - this.latchsize));
        this.corner(90);
        this.move((y + (2 * t)), (h + t), move);
    }

    surroundingWall(move) {
        let y;
        let h;
        let x;
        let r;
        [y, h, x, r] = [this.y, this.h, this.x, this.radius];
        let t = this.thickness;
        let tw = (((((y + h) - (3 * r)) + (2 * this.c4)) + this.latchsize) + t);
        let th = (x + (2.5 * t));
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(t, (0.25 * t));
        this.edges["F"]((h - r), false);
        if ((y - (2 * r)) < t) {
            this.edges["X"]((((2 * this.c4) + y) - (2 * r)), (x + (2 * t)));
        }
        else {
            this.edges["X"](this.c4, (x + (2 * t)));
            this.edge((y - (2 * r)));
            this.edges["X"](this.c4, (x + (2 * t)));
        }
        this.latch(this.latchsize, false);
        this.edge((x + (2 * t)));
        this.latch(this.latchsize, false, true);
        this.edge(this.c4);
        this.edge((y - (2 * r)));
        this.edge(this.c4);
        this.edges["F"]((h - r));
        this.corner(90);
        this.edge(t);
        this.edges["f"](x);
        this.edge(t);
        this.corner(90);
        this.move(tw, th, move);
    }

    render() {
        if (this.outside) {
            this.y = this.adjustSize(this.y);
            this.h = this.adjustSize(this.h);
            this.x = this.adjustSize(this.x);
        }
        this.latchsize *= this.thickness;
        this.radius = (this.radius || Math.min((this.y / 2.0), (this.h - this.latchsize)));
        this.radius = Math.min(this.radius, (this.y / 2.0));
        this.radius = Math.min(this.radius, Math.max(0, (this.h - this.latchsize)));
        this.moveTo((2 * this.thickness), this.thickness);
        this.ctx.save();
        this.surroundingWall({move: "right"});
        this.rectangularWall(this.y, this.x, {edges: "FFFF"});
        this.ctx.restore();
        this.surroundingWall({move: "up only"});
        this.flexBoxSide(this.y, this.h, this.radius, {move: "right"});
        this.flexBoxSide(this.y, this.h, this.radius, {move: "mirror right"});
        this.rectangularWall(this.x, ((this.h - this.radius) - this.latchsize), {edges: "fFeF"});
    }

}

export { FlexBox2 };