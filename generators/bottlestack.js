const { Boxes } = require('../boxes/boxes');
const { FingerJointSettings } = require('../boxes/edges');
const { LidSettings } = require('../boxes/lids');
const { edges } = require('../boxes/edges');
const { _TopEdge } = require('../boxes/lids');
const { Color } = require('../boxes/Color');

class BottleStack extends Boxes {
    constructor() {
        super();
        this.argparser.add_argument("--diameter", {action: "store", type: "float", default: 80, help: "diameter of the bottles in mm"});
        this.argparser.add_argument("--number", {action: "store", type: "int", default: 3, help: "number of bottles to hold in the bottom row"});
        this.argparser.add_argument("--depth", {action: "store", type: "float", default: 80, help: "depth of the stand along the base of the bottles"});
        this.argparser.add_argument("--double", {action: "store", type: boolarg, default: true, help: "two pieces that can be combined to up to double the width"});
    }

    front(h_sides, offset, move) {
        let t = this.thickness;
        let a = 60;
        let nr = this.number;
        let r1 = (this.diameter / 2.0);
        let r2 = ((r1 / Math.cos(((90 - a) * Math.PI / 180))) - r1);
        if (this.double) {
            let r3 = (1.5 * t);
        }
        else {
            r3 = (0.5 * t);
        }
        let h = ((r1 + r2) * (1 - Math.cos((a * Math.PI / 180))));
        let h_extra = (1 * t);
        let h_s = (h_sides - t);
        let p = (0.05 * t);
        let tw;
        let th;
        [tw, th] = [(((nr * r1) * 2) + (2 * r3)), (h + (2 * t))];
        if (this.move(tw, th, move, true)) {
            return;
        }
        let open_sides = r3 <= (0.5 * t);
        if (offset === 0) {
            let slot = [0, 90, h_s, -90, t, -90, h_s, 90];
            if (open_sides) {
                this.moveTo(0, h_s);
                this.polyline((r3 - (0.5 * t)));
                this.polyline(...slot.slice(4));
            }
            else {
                this.polyline((r3 - (0.5 * t)));
                this.polyline(...slot);
            }
            for (let i = 0; i < (nr - open_sides); i += 1) {
                this.polyline(((2 * r1) - t));
                this.polyline(...slot);
            }
            if (open_sides) {
                this.polyline(((2 * r1) - t));
                this.polyline(...slot.slice(0, -3));
                this.polyline((r3 - (0.5 * t)));
            }
            else {
                this.polyline((r3 - (0.5 * t)));
            }
        }
        else {
            slot = [0, 90, h_s, -90, t, -90, h_s, 90];
            h_s += t;
            let slot2 = [0, 90, h_s, -90, (t + (2 * p)), -90, h_s, 90];
            if (open_sides) {
                this.moveTo(0, h_s);
                this.polyline((t + p), -90, h_s, 90);
            }
            else {
                this.polyline(((r3 - (0.5 * t)) - p));
                this.polyline(...slot2);
            }
            this.polyline((t - p));
            this.polyline(...slot);
            this.polyline(((2 * r1) - (5 * t)));
            this.polyline(...slot);
            this.polyline((t - p));
            this.polyline(...slot2);
            for (let i = 1; i < (nr - open_sides); i += 1) {
                this.polyline((((2 * r1) - (3 * t)) - p));
                this.polyline(...slot);
                this.polyline((t - p));
                this.polyline(...slot2);
            }
            if (open_sides) {
                this.polyline((((2 * r1) - (3 * t)) - p));
                this.polyline(...slot);
                this.polyline((t - p));
                this.polyline(0, 90, h_s, -90, (t + p));
            }
            else {
                this.polyline(((r3 - (0.5 * t)) - p));
            }
        }
        if (open_sides) {
            h_extra -= h_s;
        }
        this.polyline(0, 90, ((h_extra + h) - r3), [90, r3]);
        for (let i = 0; i < nr; i += 1) {
            this.polyline(0, [a, r2], 0, [(-2 * a), r1], 0, [a, r2]);
        }
        this.polyline(0, [90, r3], ((h_extra + h) - r3), 90);
        this.move(tw, th, move);
    }

    side(l, h, short, move) {
        let t = this.thickness;
        short = bool(short);
        let tw;
        let th;
        [tw, th] = [((l + (2 * t)) - ((4 * t) * short)), h];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(t, 0);
        this.polyline((l - ((3 * t) * short)));
        if (short) {
            let end = [90, (h - t), 90, t, -90, t, 90];
        }
        else {
            end = [[90, t], (h - (2 * t)), [90, t], 0, 90, t, -90, t, -90, t, 90];
        }
        this.polyline(0, ...end);
        this.polyline(((l - (2 * t)) - ((3 * t) * short)));
        this.polyline(0, ...reversed(end));
        this.move(tw, th, move);
    }

    render() {
        let t = this.thickness;
        let d = this.depth;
        let nr = this.number;
        let h_sides = (2 * t);
        let pieces = (this.double ? 2 : 1);
        for (let offset = 0; offset < pieces; offset += 1) {
            this.front(h_sides, offset, {move: "up"});
            this.front(h_sides, offset, {move: "up"});
        }
        for (let short = 0; short < pieces; short += 1) {
            for (let i = 0; i < (nr + 1); i += 1) {
                this.side(d, h_sides, short, {move: "up"});
            }
        }
    }

}

module.exports.BottleStack = BottleStack;