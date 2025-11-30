import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class DoubleFlexDoorBox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(boxes.edges.FingerJointSettings);
        this.addSettingsArgs(boxes.edges.FlexSettings);
        // this.buildArgParser("x", "y", "h", "outside");
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 15, help: "Radius of the latch in mm"});
        this.argparser.add_argument("--latchsize", {action: "store", type: "float", default: 8, help: "size of latch in multiples of thickness"});
    }

    flexBoxSide(x, y, r, callback, move) {
        let t = this.thickness;
        let ll = (((x - (2 * r)) / 2) - this.latchsize);
        if (this.move((x + (2 * t)), (y + (2 * t)), move, true)) {
            return;
        }
        this.moveTo((t + r), t);
        for (let [i, l] of zip(range(2), [x, y])) {
            this.cc(callback, i);
            this.edges["f"]((l - (2 * r)));
            this.corner(90, r);
        }
        this.cc(callback, 2);
        this.edge(ll);
        this.latch(this.latchsize);
        this.latch(this.latchsize, {reverse: true});
        this.edge(ll);
        this.corner(90, r);
        this.cc(callback, 3);
        this.edges["f"]((y - (2 * r)));
        this.corner(90, r);
        this.move((x + (2 * t)), (y + (2 * t)), move);
    }

    surroundingWall(x, y, h, r, move) {
        let t = this.thickness;
        let c4 = ((Math.PI * r) * 0.5);
        let tw = ((((2 * x) + (2 * y)) - (8 * r)) + (4 * c4));
        let th = (h + (2.5 * t));
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(0, (0.25 * t), -90);
        this.latch(this.latchsize, false, true);
        this.edge((((x - (2 * r)) / 2) - this.latchsize), false);
        if ((y - (2 * r)) < t) {
            this.edges["X"]((((2 * c4) + y) - (2 * r)), (h + (2 * t)));
        }
        else {
            this.edges["X"](c4, (h + (2 * t)));
            this.edges["F"]((y - (2 * r)), false);
            this.edges["X"](c4, (h + (2 * t)));
        }
        this.edges["F"]((x - (2 * r)), false);
        if ((y - (2 * r)) < t) {
            this.edges["X"]((((2 * c4) + y) - (2 * r)), (h + (2 * t)));
        }
        else {
            this.edges["X"](c4, (h + (2 * t)));
            this.edges["F"]((y - (2 * r)));
            this.edges["X"](c4, (h + (2 * t)));
        }
        this.edge((((x - (2 * r)) / 2) - this.latchsize), false);
        this.latch(this.latchsize, false);
        this.edge((h + (2 * t)));
        this.latch(this.latchsize, false, true);
        this.edge((((x - (2 * r)) / 2) - this.latchsize), false);
        this.edge(c4);
        this.edges["F"]((y - (2 * r)));
        this.edge(c4);
        this.edges["F"]((x - (2 * r)), false);
        this.edge(c4);
        this.edges["F"]((y - (2 * r)), false);
        this.edge(c4);
        this.edge((((x - (2 * r)) / 2) - this.latchsize));
        this.latch(this.latchsize, false, false);
        this.edge((h + (2 * t)));
        this.move(tw, th, move);
    }

    render() {
        if (this.outside) {
            this.x = this.adjustSize(this.x);
            this.y = this.adjustSize(this.y);
            this.h = this.adjustSize(this.h);
        }
        let t = this.thickness;
        this.latchsize *= t;
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let r = (this.radius || (Math.min((x - (2 * this.latchsize)), y) / 2.0));
        r = Math.min(r, (y / 2.0));
        this.surroundingWall(x, h, y, r, {move: "up"});
        this.flexBoxSide(x, h, r, {move: "right"});
        this.flexBoxSide(x, h, r, {move: "mirror"});
    }

}

export { DoubleFlexDoorBox };