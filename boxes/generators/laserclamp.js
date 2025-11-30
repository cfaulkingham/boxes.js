import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class LaserClamp extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 0});
        this.argparser.add_argument("--minheight", {action: "store", type: "float", default: 25.0, help: "minimal clamping height in mm"});
        this.argparser.add_argument("--maxheight", {action: "store", type: "float", default: 50.0, help: "maximal clamping height in mm"});
        this.argparser.add_argument("--extraheight", {action: "store", type: "float", default: 0.0, help: "extra height to make operation smoother in mm"});
    }

    topPart(l, move) {
        let t = this.thickness;
        let tw;
        let th;
        [tw, th] = [(12 * t), (l + (4 * t))];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo((8 * t), 0);
        this.rectangularHole(t, ((2 * t) + (l / 2)), (1.05 * t), l);
        this.polyline((2 * t), [90, t], (l + (1.5 * t)), [-90, (0.5 * t)], (2 * t), -90, 0, [180, (0.5 * t)], 0, [90, (1.5 * t)], (9 * t), [180, (4 * t)], (2 * t), [-90, t]);
        this.hole((-5 * t), (-3 * t), (2.5 * t));
        this.polyline((l - (5.5 * t)), [90, t]);
        this.move(tw, th, move);
    }

    bottomPart(h_min, h_extra, move) {
        let t = this.thickness;
        let tw;
        let th;
        [tw, th] = [(14 * t), (h_min + (4 * t))];
        if (this.move(tw, th, move, true)) {
            return;
        }
        let ls = ((t / 2) * (2 ** 0.5));
        this.moveTo((2 * t), 0);
        this.fingerHolesAt((3 * t), (2 * t), (h_min + h_extra), 90);
        if (h_extra) {
            this.polyline((4 * t), [90, t], (h_extra - (2 * t)), [-90, t]);
        }
        else {
            this.polyline((6 * t));
        }
        this.polyline((4 * t), [90, (2 * t)], (3 * t), 135, (2 * ls), 45, (1 * t), -90, (6 * t), -90);
        this.polyline(h_min, [90, t], (2 * t), [90, t], ((h_min + h_extra) - (0 * t)), [-90, t], t, [180, t], 0, 90, 0, [-180, (0.5 * t)], 0, 90);
        this.move(tw, th, move);
    }

    render() {
        let t = this.thickness;
        let h_max;
        let h_min;
        let h_extra;
        [h_max, h_min, h_extra] = [this.maxheight, this.minheight, this.extraheight];
        if ((h_extra && h_extra < (2 * t))) {
            h_extra = (2 * t);
        }
        this.topPart((h_max + h_extra), {move: "right"});
        this.bottomPart(h_min, h_extra, {move: "right"});
        this.roundedPlate((4 * t), ((h_min + h_extra) + (4 * t)), {edge: "e", r: t, extend_corners: false, move: "right", callback: [() => this.fingerHolesAt((1 * t), (2 * t), (h_min + h_extra))]});
        this.rectangularWall((1.1 * t), (h_min + h_extra), "efef");
    }

}

export { LaserClamp };