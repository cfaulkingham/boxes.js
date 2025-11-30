import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class DinRailEdge extends Boxes {
    constructor(boxes, settings, width, offset) {
        super();
        this.width = width;
        this.offset = offset;
    }

    startwidth() {
        return (8 + this.settings.thickness);
    }

    __call__(length, bedBolts, bedBoltSettings) {
        this.ctx.save();
        this.fingerHoles(0, ((this.burn + 8) + (this.settings.thickness / 2)), length, 0, {bedBolts: bedBolts, bedBoltSettings: bedBoltSettings});
        this.ctx.restore();
        let w = this.width;
        let o = this.offset;
        let l = length;
        this.polyline((((l - w) / 2) - o), 45, (2.75 * (2 ** 0.5)), 90, (2.75 * (2 ** 0.5)), -45, 0.5, -90, (w + 0.25), -90, 1, 30, ((5 * 2) * (3 ** -0.5)), 60, ((((l - w) / 2) + o) - 3.25));
    }

}

export { DinRailEdge };
class DinRailBox extends Boxes {
    latch(l, move) {
        let t = this.thickness;
        let tw = (((l + 3) + 6) + t);
        let th = 8;
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(tw, th, 180);
        this.polyline(2, 90, 0, [-180, 1.5], 0, 90, (l + (1.2 * t)), 90, 3, -90, 1, 30, ((2 * 2) * (3 ** -0.5)), 90, ((4.5 * 2) * (3 ** -0.5)), 60, (4 + 1.25), 90, 4.5, -90, (t + 4), -90, 2, 90, ((l - (0.8 * t)) - 9), 90, 2, -90, (5 + t), 90, 4, 90);
        this.move(tw, th, move);
    }

    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 0.8});
        // this.buildArgParser();
        this.argparser.add_argument("--rail_width", {action: "store", type: "float", default: 35.0, help: "width of the rail (typically 35 or 15mm)"});
        this.argparser.add_argument("--rail_offset", {action: "store", type: "float", default: 0.0, help: "offset of the rail from the middle of the box (in mm)"});
    }

    spring() {
        let t = this.thickness;
        let l = Math.min(((this.x / 2) - (1.5 * t)), 50);
        this.moveTo(((this.x / 2) - l), (-6 - t), 0);
        this.polyline((l + (0.525 * t)), 90, 6, 90, (1.1 * t), 90, 3, -90, (l - (0.525 * t)), 180, (l - (0.525 * t)), -90, (1 + (0.1 * t)), 90, (t - 0.5), -90, 2);
    }

    lid_lip(l, move) {
        let t = this.thickness;
        let tw;
        let th;
        [tw, th] = [(l + 2), (t + 8)];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(1, t);
        this.edges["f"](l);
        let poly = [0, 90, 6, -60, 0, [120, (2 * (3 ** -0.5))], 0, 30, 2, 90, 5, [-180, 0.5], 5, 90];
        this.polyline(...((poly + [(l - (2 * 3))]) + list(reversed(poly))));
        this.move(tw, th, move);
    }

    lid_holes() {
        let t = this.thickness;
        this.rectangularHole((0.55 * t), 7, (1.1 * t), 1.6);
        this.rectangularHole((this.x - (0.55 * t)), 7, (1.1 * t), 1.6);
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let w = this.rail_width;
        let o = this.rail_offset;
        let t = this.thickness;
        this.rectangularWall(x, y, "EEEE", {callback: [() => this.fingerHolesAt((0.55 * t), (0.05 * t), (y - (0.1 * t)), 90), null, () => this.fingerHolesAt((0.55 * t), (0.05 * t), (y - (0.1 * t)), 90), null], move: "right", label: "Lid"});
        this.lid_lip((y - (0.1 * t)), {move: "rotated right"});
        this.lid_lip((y - (0.1 * t)), {move: "rotated right"});
        this.rectangularWall(x, y, "ffff", {callback: [() => this.fingerHolesAt(0, (((((y - w) / 2) - (0.5 * t)) + o) - 9), x, 0)], move: "right", label: "Back"});
        this.edges["f"].settings.setValues(t, false, {edge_width: 8});
        let dr = DinRailEdge(this, this.edges["f"].settings, w, o);
        this.rectangularWall(y, h, [dr, "F", "e", "F"], {ignore_widths: [1, 6], move: "rotated right", label: "Left Side upsidedown"});
        this.rectangularWall(y, h, [dr, "F", "e", "F"], {ignore_widths: [1, 6], move: "rotated mirror right", label: "Right Side"});
        this.rectangularWall(x, h, ["h", "f", "e", "f"], {ignore_widths: [1, 6], callback: [this.spring, null, this.lid_holes], move: "up", label: "Bottom"});
        this.rectangularWall(x, h, ["h", "f", "e", "f"], {callback: [null, null, this.lid_holes], ignore_widths: [1, 6], move: "up", label: "Top"});
        this.rectangularWall(x, 8, "feee", {callback: [() => this.rectangularHole((x / 2), (2.05 - (0.5 * t)), t, (t + 4.1))], move: "up"});
        this.latch((((y - w) / 2) + o), {move: "up"});
    }

}

export { DinRailBox };