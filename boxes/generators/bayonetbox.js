import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class BayonetBox extends Boxes {
    constructor() {
        super();
        this.argparser.add_argument("--diameter", {action: "store", type: "float", default: 50.0, help: "Diameter of the box in mm"});
        this.argparser.add_argument("--lugs", {action: "store", type: "int", default: 10, help: "number of locking lugs"});
        this.argparser.add_argument("--alignment_pins", {action: "store", type: "float", default: 1.0, help: "diameter of the alignment pins"});
        // this.buildArgParser("outside");
    }

    alignmentHoles(inner, outer) {
        let d = this.diameter;
        let r = (d / 2);
        let t = this.thickness;
        let p = (0.05 * t);
        let l = this.lugs;
        let a = (180 / l);
        this.ctx.save();
        for (let i = 0; i < 3; i += 1) {
            if (outer) {
                let x = (r - (t / 2));
                this.hole(x, 0, {d: this.alignment_pins});
            }
            if (inner) {
                let x = ((r - (2 * t)) - p);
                this.hole(x, 0, {d: this.alignment_pins});
            }
            this.moveTo(0, 0, (360 / 3));
        }
        this.ctx.restore();
    }

    lowerLayer(asPart, move) {
        let d = this.diameter;
        let r = (d / 2);
        let t = this.thickness;
        let p = (0.05 * t);
        let l = this.lugs;
        let a = (180 / l);
        if (asPart) {
            if (this.move(d, d, move, true)) {
                return;
            }
            this.moveTo((d / 2), (d / 2));
        }
        this.alignmentHoles(true, false);
        this.hole(0, 0, {r: ((d / 2) - (2.5 * t))});
        this.moveTo(((d / 2) - (1.5 * t)), 0, -90);
        for (let i = 0; i < l; i += 1) {
            this.polyline(0, [((-4 / 3) * a), (r - (1.5 * t))], 0, 90, (0.5 * t), -90, 0, [((-2 / 3) * a), (r - t)], 0, -90, (0.5 * t), 90);
        }
        if (asPart) {
            this.move(d, d, move);
        }
    }

    lowerCB() {
        let d = this.diameter;
        let r = (d / 2);
        let t = this.thickness;
        let p = (0.05 * t);
        let l = this.lugs;
        let a = (180 / l);
        this.alignmentHoles(false, true);
        this.ctx.save();
        this.lowerLayer();
        this.ctx.restore();
        this.moveTo((((d / 2) - (1.5 * t)) + p), 0, -90);
        for (let i = 0; i < l; i += 1) {
            this.polyline(0, [((-2 / 3) * a), ((r - (1.5 * t)) + p)], 0, 90, (0.5 * t), -90, 0, [((-4 / 3) * a), ((r - t) + p)], 0, -90, (0.5 * t), 90);
        }
    }

    upperCB() {
        let d = this.diameter;
        let r = (d / 2);
        let t = this.thickness;
        let p = (0.05 * t);
        let l = this.lugs;
        let a = (180 / l);
        this.hole(0, 0, {r: ((d / 2) - (2.5 * t))});
        this.hole(0, 0, {r: ((d / 2) - (1.5 * t))});
        this.alignmentHoles(true, true);
        this.moveTo(((d / 2) - (1.5 * t)), 0, -90);
        for (let i = 0; i < l; i += 1) {
            this.polyline(0, [(-1.3 * a), ((r - (1.5 * t)) + p)], 0, 90, (0.5 * t), -90, 0, [(-0.7 * a), ((r - t) + p)], 0, -90, (0.5 * t), 90);
        }
    }

    render() {
        let d = this.diameter;
        let t = this.thickness;
        let p = (0.05 * t);
        console.log("render called with:", {d, t, p});
        if (!this.outside) {
        }
        console.log("Calling disc 1");
        this.parts.disc(d, 0, 1.0, () => this.alignmentHoles(false, false), "right");
        console.log("Calling disc 2");
        this.parts.disc(d, 0, 1.0, () => [this.alignmentHoles(), this.hole(0, 0, ((d / 2) - (1.5 * t)))], "right");
        console.log("Calling disc 3");
        this.parts.disc(d, 0, 1.0, () => this.lowerLayer(false, null), "right");
        console.log("Calling disc 4");
        this.parts.disc(d, 0, 1.0, () => this.upperCB(), "right");
        console.log("Calling disc 5");
        this.parts.disc(d, 0, 1.0, () => this.alignmentHoles(), "right");
    }

}

export { BayonetBox };