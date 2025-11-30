import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class MotorEdge extends Boxes {
    __call__(l) {
        this.polyline((l - 165), 45, (25 * (2 ** 0.5)), -45, 60, -45, (25 * (2 ** 0.5)), 45, 55);
    }

}

export { MotorEdge };
class OutsetEdge extends Boxes {
    startwidth() {
        return 20.0;
    }

}

export { OutsetEdge };
class HangerEdge extends Boxes {
    margin() {
        return 40.0;
    }

    __call__(l) {
        this.fingerHolesAt(0, (-0.5 * this.thickness), l, {angle: 0});
        let w = this.settings;
        this.polyline(0, -90, (22 + w), 90, 70, 135, ((2 ** 0.5) * 12), 45, 35, -45, (((2 ** 0.5) * 0.5) * w), -90, (((2 ** 0.5) * 0.5) * w), -45, (l - 28), 45, ((2 ** 0.5) * 5), 45, 5, -90);
    }

}

export { HangerEdge };
class RollerEdge extends Boxes {
    margin() {
        return 20.0;
    }

    __call__(l) {
        let m = (40 + 100);
        this.polyline(((l - m) / 2.0), -45, ((2 ** 0.5) * 20), 45, 100, 45, ((2 ** 0.5) * 20), -45, ((l - m) / 2.0));
    }

}

export { RollerEdge };
class RollerEdge2 extends Boxes {
    margin() {
        return this.thickness;
    }

    __call__(l) {
        let a = 30;
        let f = (1 / Math.cos((a * Math.PI / 180)));
        this.edges["f"](70);
        this.polyline(0, a, (f * 25), -a, (l - 190), -a, (f * 25), a, 0);
        this.edges["f"](70);
    }

}

export { RollerEdge2 };
class Rotary extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.argparser.add_argument("--diameter", {action: "store", type: "float", default: 72.0, help: "outer diameter of the wheels (including O rings)"});
        this.argparser.add_argument("--rubberthickness", {action: "store", type: "float", default: 5.0, help: "diameter of the strings of the O rings"});
        this.argparser.add_argument("--axle", {action: "store", type: "float", default: 6.0, help: "diameter of the axles"});
        this.argparser.add_argument("--knifethickness", {action: "store", type: "float", default: 8.0, help: "thickness of the knives in mm. Use 0 for use with honey comb table."});
        this.argparser.add_argument("--beamwidth", {action: "store", type: "float", default: 32.0, help: "width of the (aluminium) profile connecting the parts"});
        this.argparser.add_argument("--beamheight", {action: "store", type: "float", default: 7.1, help: "height of the (aluminium) profile connecting the parts"});
    }

    mainPlate() {
        let t = this.thickness;
        let d = this.diameter;
        let a = this.axle;
        let bw;
        let bh;
        [bw, bh] = [this.beamwidth, this.beamheight];
        let hh = (((0.5 * d) + bh) + 2);
        this.hole((1.0 * d), hh, (a / 2.0));
        this.hole(((2.0 * d) + 5), hh, (a / 2.0));
        this.rectangularHole(((1.5 * d) + 2.5), (0.5 * bh), bw, bh);
    }

    frontPlate() {
        let t = this.thickness;
        let d = this.diameter;
        let a = this.axle;
        let bw;
        let bh;
        [bw, bh] = [this.beamwidth, this.beamheight];
        let hh = (((0.5 * d) + bh) + 2);
        this.hole((1.0 * d), hh, (a / 2.0));
        this.hole(((2.0 * d) + 5), hh, (a / 2.0));
        this.rectangularHole(((1.5 * d) + 2.5), (0.5 * bh), bw, bh);
        let mx = ((2.7 * d) + 20);
        this.rectangularHole(mx, hh, (36 + 20), 36, {r: (36 / 2.0)});
        for (let x of [-1, 1]) {
            for (let y of [-1, 1]) {
                this.rectangularHole((mx + (x * 25)), (hh + (y * 25)), 20, 4, {r: 2});
            }
        }
    }

    link(x, y, a, middleHole, move) {
        let t = this.thickness;
        let overallwidth = (x + y);
        let overallheight = y;
        let ra = (a / 2.0);
        if (this.move(overallwidth, overallheight, move)) {
            return;
        }
        this.moveTo((y / 2.0), 0);
        this.hole(0, (y / 2.0), ra);
        this.hole(x, (y / 2.0), ra);
        if (middleHole) {
            this.hole((x / 2.0), (y / 2.0), ra);
        }
        this.edge(10);
        this.edges["F"](60);
        this.polyline((x - 70), [180, (y / 2.0)], x, [180, (y / 2.0)]);
        this.move(overallwidth, overallheight, move);
    }

    holderBaseCB() {
        let bw;
        let bh;
        [bw, bh] = [this.beamwidth, this.beamheight];
        this.hole(20, (this.hh - 10), (this.a / 2));
        this.rectangularHole((this.hl - 70), (this.hh - 10), 110, this.a, {r: (this.a / 2)});
        this.rectangularHole((this.hl / 2), (0.5 * bh), bw, bh);
    }

    holderTopCB() {
        this.fingerHolesAt(0, (30 - (0.5 * this.thickness)), this.hl, 0);
        let d = ((this.diameter / 2.0) + 1);
        let y = (((((-0.5 * this.diameter) + this.th) + this.hh) - this.beamheight) - 2.0);
        this.hole(((this.hl / 2) + d), y, (this.axle / 2.0));
        this.hole(((this.hl / 2) - d), y, (this.axle / 2.0));
        this.hole(((this.hl / 2) + d), y, (this.diameter / 2.0));
        this.hole(((this.hl / 2) - d), y, (this.diameter / 2.0));
    }

    render() {
        let t = this.thickness;
        let d = this.diameter;
        let bw;
        let bh;
        [bw, bh] = [this.beamwidth, this.beamheight];
        this.edges["f"].settings.setValues(this.thickness, {space: 2, finger: 2, surroundingspaces: 1});
        if (this.knifethickness) {
            this.addPart(HangerEdge(this, this.knifethickness));
        }
        else {
        }
        this.rectangularWall(hl, hh, {edges: "hfef", callback: [this.holderBaseCB, null, () => this.rectangularHole(((hl / 2) + 50), ((hh - (t / 2)) - 1), 60, (t + 2))], move: "up"});
        this.rectangularWall(hl, hh, {edges: "hfef", callback: [this.holderBaseCB], move: "up"});
        this.rectangularWall(hl, hw, {edges: "ffff", callback: [() => this.hole((((hl / 2) - 16) - 20), 25, 5)], move: "up"});
        this.ctx.save();
        this.rectangularWall(hw, hh, {edges: "hFeF", callback: [() => this.hole((hw / 2), (hh - 20), 4)], move: "right"});
        this.rectangularWall(hw, hh, {edges: "hFeF", move: "right"});
        this.rectangularWall((hw + 20), th, {edges: "fFeF", move: "right", callback: [() => this.fingerHolesAt((20 - (0.5 * t)), 0, th)]});
        this.rectangularWall((hw + 20), th, {edges: "fFeF", move: "right", callback: [() => this.fingerHolesAt((20 - (0.5 * t)), 0, th)]});
        this.ctx.restore();
        this.rectangularWall(hw, hh, {edges: "hFeF", move: "up only"});
        let outset = OutsetEdge(this, null);
        let roller2 = RollerEdge2(this, null);
        this.rectangularWall(hl, th, {edges: [roller2, "f", "e", "f"], callback: [() => this.hole(20, 15, (a / 2)), null, () => this.rectangularHole(50, (th - 15), 70, a)], move: "up"});
        this.rectangularWall(hl, th, {edges: [roller2, "f", "e", "f"], callback: [() => this.hole(20, 15, (a / 2)), null, () => this.rectangularHole(50, ((th - 15) - t), 70, a)], move: "up"});
        this.rectangularWall(hl, th, {edges: [roller2, "f", RollerEdge(this, null), "f"], callback: [this.holderTopCB], move: "up"});
        this.rectangularWall(hl, (20 - t), {edges: "feee", move: "up"});
        let tl = 70;
        this.rectangularWall(tl, (hw + 20), {edges: "FeFF", move: "right", callback: [null, () => this.fingerHolesAt((20 - (0.5 * t)), 0, tl)]});
        this.rectangularWall(tl, (hw + 20), {edges: "FeFF", move: "", callback: [null, () => this.fingerHolesAt((20 - (0.5 * t)), 0, tl)]});
        this.rectangularWall(tl, (hw + 20), {edges: "FeFF", move: "left up only", callback: [null, () => this.fingerHolesAt((20 - (0.5 * t)), 0, tl)]});
        this.link((hl - 40), 25, a, true, {move: "up"});
        this.link((hl - 40), 25, a, true, {move: "up"});
        this.link((hl - 40), 25, a, true, {move: "up"});
        this.link((hl - 40), 25, a, true, {move: "up"});
        this.ctx.save();
        this.rectangularWall(((hw - (2 * t)) - 2), 60, {edges: "efef", move: "right"});
        this.rectangularWall(((hw - (4 * t)) - 4), 60, {edges: "efef", move: "right"});
        this.parts.wavyKnob(50, {callback: () => this.nutHole("M8"), move: "right"});
        this.parts.wavyKnob(50, {callback: () => this.nutHole("M8"), move: "right"});
        this.ctx.restore();
        this.rectangularWall(((hw - (2 * t)) - 4), 60, {edges: "efef", move: "up only"});
        this.ctx.save();
        let slot = edges.SlottedEdge(this, [((30 - t) / 2), ((30 - t) / 2)]);
        this.rectangularWall(30, 30, {edges: ["e", "e", slot, "e"], callback: [() => this.hole(7, 23, (this.axle / 2))], move: "right"});
        this.rectangularWall(30, 30, {edges: ["e", "e", slot, "e"], callback: [() => this.hole(7, 23, (this.axle / 2))], move: "right"});
        let leftover = ((((hw - (6 * t)) - 6) - 20) / 2.0);
        slot = edges.SlottedEdge(this, [leftover, 20, leftover]);
        this.rectangularWall(((hw - (4 * t)) - 6), 30, {edges: [slot, "e", "e", "e"], callback: [() => this.hole((((hw - (4 * t)) - 6) / 2.0), 15, 4)], move: "right"});
        for (let i = 0; i < 3; i += 1) {
            this.rectangularWall(20, 30, {callback: [() => this.nutHole("M8", 10, 15)], move: "right"});
            this.rectangularWall(20, 30, {callback: [() => this.hole(10, 15, 4)], move: "right"});
        }
        this.ctx.restore();
        this.rectangularWall(30, 30, {move: "up only"});
        if (this.knifethickness) {
            let ow = 10;
            this.rectangularWall((3.6 * d), h, {edges: "hfFf", callback: [() => this.rectangularHole((1.8 * d), (0.5 * bh), bw, bh)], move: "up"});
            this.rectangularWall((3.6 * d), h, {edges: "hfFf", callback: [() => this.rectangularHole((1.8 * d), (0.5 * bh), bw, bh)], move: "up"});
            this.rectangularWall((3.6 * d), ow, {edges: "ffff", move: "up"});
            this.rectangularWall((3.6 * d), ow, {edges: "ffff", move: "up"});
            this.ctx.save();
            this.rectangularWall(ow, h, {edges: "hFFH", move: "right"});
            this.rectangularWall(ow, h, {edges: "hFFH", move: "right"});
            this.ctx.restore();
            this.rectangularWall(ow, h, {edges: "hFFH", move: "up only"});
        }
        let mw = 40;
        this.rectangularWall((3.6 * d), h, {edges: ["h", "f", MotorEdge(this, null), "f"], callback: [this.mainPlate], move: "up"});
        this.rectangularWall((3.6 * d), h, {edges: ["h", "f", MotorEdge(this, null), "f"], callback: [this.frontPlate], move: "up"});
        this.rectangularWall((3.6 * d), mw, {edges: "ffff", move: "up"});
        this.ctx.save();
        this.rectangularWall(mw, h, {edges: "hFeH", move: "right"});
        this.rectangularWall(mw, h, {edges: "hFeH", move: "right"});
        this.pulley(88, "GT2_2mm", {r_axle: (a / 2.0), move: "right"});
        this.pulley(88, "GT2_2mm", {r_axle: (a / 2.0), move: "right"});
        this.ctx.restore();
        this.rectangularWall(mw, h, {edges: "hFeH", move: "up only"});
        this.axle = 19;
        for (let i = 0; i < 3; i += 1) {
            this.parts.disc((this.diameter - (2 * this.rubberthickness)), {hole: this.axle, move: "right"});
        }
        this.parts.disc((this.diameter - (2 * this.rubberthickness)), {hole: this.axle, move: "up right"});
        for (let i = 0; i < 3; i += 1) {
            this.parts.disc((this.diameter - (2 * this.rubberthickness)), {hole: this.axle, move: "left"});
        }
        this.parts.disc((this.diameter - (2 * this.rubberthickness)), {hole: this.axle, move: "left up"});
        for (let i = 0; i < 3; i += 1) {
            this.parts.disc(((this.diameter - (2 * this.rubberthickness)) + 4), {hole: this.axle, move: "right"});
        }
        this.parts.disc(((this.diameter - (2 * this.rubberthickness)) + 4), {hole: this.axle, move: "right up"});
    }

}

export { Rotary };