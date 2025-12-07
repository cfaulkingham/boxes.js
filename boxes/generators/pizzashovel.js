import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class PizzaShovel extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.HandleEdgeSettings, {outset: 0.0, height: 40, hole_width: "30:30:30"});
        // this.buildArgParser();
        this.argparser.add_argument("--grip_length", {action: "store", type: "float", default: 250.0, help: "Length of the grip. Zero for holes for a screw-in handle"});
        this.argparser.add_argument("--grip_height", {action: "store", type: "float", default: 30.0, help: "Height of the grip. Distance between the cross beams."});
        this.argparser.add_argument("--top_holes", {action: "store", type: "float", default: 3.0, help: "Diameter of the screw holes in the bottom of the pusher - where the screws pass through"});
        this.argparser.add_argument("--bottom_holes", {action: "store", type: "float", default: 2.0, help: "Diameter of the screw holes in the bottom of the pusher - where the screws hold"});
        this.argparser.add_argument("--grip_holes", {action: "store", type: "float", default: 3.0, help: "Diameter of the screw holes for zero griplength"});
    }

    holesCB(d) {
        const cb = () => {
            for (let i = 0; i < 5; i += 1) {
                this.hole((((this.x - 3) / 5) * (i + 0.5)), 20, {d: d});
            }
        };

        return cb;
    }

    gripCB(top) {
        const cb = () => {
            let t = this.thickness;
            if (this.grip_length) {
                for (let d of [-t, !t]) {
                    this.fingerHolesAt(((this.x / 2) + d), 0, 40, 90);
                }
            }
            else {
                for (let y of (top ? [10, 30] : [15, 35, 60])) {
                    this.hole((this.x / 2), y, {d: this.grip_holes});
                }
            }
        };

        return cb;
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.grip_height];
        let grip = this.grip_length;
        let t = this.thickness;
        let ce = new edges.CompoundEdge(this, "fe", [(y / 2), (y / 2)]);
        let ec = new edges.CompoundEdge(this, "ef", [(y / 2), (y / 2)]);
        this.rectangularWall(x, y, ["e", ce, "e", ec], {move: "up"});
        this.rectangularWall(x, 40, "efef", {callback: [this.gripCB()], move: "up"});
        this.rectangularWall(x, 80, "efef", {callback: [this.gripCB()], move: "up"});
        for (let i = 0; i < 2; i += 1) {
            let a = Math.tan(((h + (2 * t)) / ((y / 2) - 30)));
            let l = (((y / 2) - 30) / Math.cos(a));
            a = (a * 180 / Math.PI);
            this.polygonWall([((y / 2) + 40), [90, t], (h + (2 * t)), [90, t], 70, a, l, -a, 0, [180, t]], "e", {callback: [() => [this.fingerHolesAt(0, (1.5 * t), (y / 2), 0), this.fingerHolesAt(((y / 2) + t), (1.5 * t), 40, 0)], null, () => this.fingerHolesAt(-t, (1.5 * t), 80, 0)], move: "up"});
        }
        this.rectangularWall((x - 3), 40, "eeee", {callback: [this.holesCB(this.bottom_holes)], move: "up"});
        this.rectangularWall((x - 3), 40, "yeee", {callback: [this.holesCB(this.top_holes)], move: "up"});
        if (grip) {
            let ce1 = new edges.CompoundEdge(this, "fe", [40, (grip - (h / 2))]);
            let ce2 = new edges.CompoundEdge(this, "ef", [(grip - (h / 2)), 40]);
            this.flangedWall(((40 + grip) - (h / 2)), h, [ce1, "e", ce2, "e"], {flanges: [0, (h / 2)], r: (h / 2), move: "up"});
            this.flangedWall(((40 + grip) - (h / 2)), h, "eeee", {flanges: [0, (h / 2)], r: (h / 2), move: "up"});
            this.flangedWall(((40 + grip) - (h / 2)), h, [ce1, "e", ce2, "e"], {flanges: [0, (h / 2)], r: (h / 2), move: "up"});
            this.flangedWall(((30 + grip) - (h / 2)), (h - (2 * t)), "eeee", {flanges: [0, ((h / 2) - t)], r: ((h / 2) - t), move: "up"});
            this.flangedWall(((30 + grip) - (h / 2)), (h - (2 * t)), "eeee", {flanges: [0, ((h / 2) - t)], r: ((h / 2) - t), move: "up"});
        }
    }

}

export { PizzaShovel };