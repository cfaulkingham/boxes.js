import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class SevenSegmentPattern extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.argparser.add_argument("--digit", {action: "store", type: "float", default: 100.0, help: "height of the digit (without walls) in mm"});
        this.argparser.add_argument("--h", {action: "store", type: "float", default: 20.0, help: "height separation walls in mm"});
    }

    segment(l, w) {
        let w2 = (w * (2 ** 0.5));
        this.moveTo(0, 0, 45);
        this.polyline(w2, -45, (l - (2 * w)), -45, w2, -90, w2, -45, (l - (2 * w)), -45, w2, -90);
    }

    seven_segments(x) {
        let t = this.thickness;
        let l = (0.4 * x);
        let w = (0.05 * x);
        let d = (0.05 * x);
        let width = ((l + (2 * w)) + d);
        for (let px of [((w / 2) + (d / 2)), (((w / 2) + l) + (1.5 * d))]) {
            for (let py of [(w + (d / 2)), ((w + l) + (1.5 * d))]) {
                this.ctx.save();
                this.moveTo(px, py, 90);
                this.segment(l, w);
                this.ctx.restore();
            }
        }
        for (let i = 0; i < 3; i += 1) {
            this.ctx.save();
            this.moveTo(((w / 2) + d), (w + (i * (l + d))));
            this.segment(l, w);
            this.ctx.restore();
        }
    }

    seven_segment_holes(x) {
        let t = this.thickness;
        let l = (0.4 * x);
        let w = (0.05 * x);
        let d = (0.05 * x);
        let width = ((l + (2 * w)) + d);
        for (let i = 0; i < 2; i += 1) {
            this.fingerHolesAt(((t / 4) * (2 ** 0.5)), (((x / 2) + w) - ((t / 4) * (2 ** 0.5))), (((2 ** 0.5) * (width - t)) - (t / 2)), -45);
            this.fingerHolesAt(t, t, (((2 ** 0.5) * (((0.55 * x) / 2) - t)) - (t / 2)), 45);
            this.fingerHolesAt(((width / 2) + ((t / (2 ** 0.5)) / 2)), ((width / 2) + ((t / (2 ** 0.5)) / 2)), (((2 ** 0.5) * ((l / 2) + (d / 2))) - (1.5 * t)), 45);
            this.fingerHolesAt((-t / 2), ((x / 2) + (0.25 * t)), ((x / 2) - (0.25 * t)), 90);
            this.fingerHolesAt((-t / 2), 0, ((x / 2) - (0.25 * t)), 90);
            this.fingerHolesAt(-t, (-t / 2), (((l + (2 * w)) + d) + (2 * t)), 0);
            this.moveTo(width, x, 180);
        }
    }

    seven_segment_separators(x, h, n) {
        let t = this.thickness;
        let l = (0.4 * x);
        let w = (0.05 * x);
        let d = (0.05 * x);
        let width = ((l + (2 * w)) + d);
        for (let length of [(((2 ** 0.5) * (width - t)) - (t / 2)), ((((2 ** 0.5) * x) / 4) - t), (((2 ** 0.5) * ((l / 2) + (d / 2))) - (1.5 * t)), ((x / 2) - (0.25 * t)), ((x / 2) - (0.25 * t)), (((l + (2 * w)) + d) + (2 * t))]) {
            this.partsMatrix((2 * n), 1, "right", this.rectangularWall, length, h, "feee");
        }
    }

    render() {
        let digit;
        let h;
        [digit, h] = [this.digit, this.h];
        let t = this.thickness;
        this.seven_segments(digit);
        this.moveTo((((0.55 * digit) + this.spacing) + t), t);
        this.seven_segment_holes(digit);
        this.moveTo((((0.55 * digit) + this.spacing) + t), -t);
        this.seven_segment_separators(digit, h);
    }

}

export { SevenSegmentPattern };