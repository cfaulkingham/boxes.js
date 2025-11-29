const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class LegEdge extends Boxes {
    __call__(l) {
        let d0 = ((l - 12.0) / 2);
        this.hole((l / 2), 6, 3.0);
        this.polyline(d0, 90, 0, [-180, 6], 0, 90, d0);
    }

}

module.exports.LegEdge = LegEdge;
class OttoLegs extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {finger: 1.0, space: 1.0, surroundingspaces: 1.0});
        this.argparser.add_argument("--anklebolt1", {action: "store", type: "float", default: 3.0, help: "diameter for hole for ankle bolts - foot side"});
        this.argparser.add_argument("--anklebolt2", {action: "store", type: "float", default: 2.6, help: "diameter for hole for ankle bolts - leg side"});
        this.argparser.add_argument("--length", {action: "store", type: "float", default: 34.0, help: "length of legs (34mm min)"});
    }

    foot(x, y, ly, l, r, move) {
        if (this.move(x, y, move, true)) {
            return;
        }
        let t = this.thickness;
        let w = ((ly + 5.5) + (2 * t));
        this.fingerHolesAt(((x / 2) - (w / 2)), 0, l, 90);
        this.fingerHolesAt(((x / 2) + (w / 2)), 0, l, 90);
        this.moveTo(r, 0);
        for (let l of [x, y, x, y]) {
            this.polyline([(l - (2 * r)), 2], 45, (r * (2 ** 0.5)), 45);
        }
        this.move(x, y, move);
    }

    ankles(x, h, edge, callback, move) {
        let f = 0.5;
        let tw = x;
        let th = ((2 * h) + this.thickness);
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(0, this.thickness);
        for (let i = 0; i < 2; i += 1) {
            this.cc(callback, 0);
            this.edges[edge](x);
            this.polyline(0, 90);
            this.cc(callback, 1);
            this.polyline([h, 2], 90, [(f * x), 1], 45, [(((2 ** 0.5) * (1 - f)) * x), 1], 45, [(h - ((1 - f) * x)), 1], 90);
            this.moveTo(tw, th, 180);
            this.ctx.stroke();
        }
        this.move(tw, th, move);
    }

    ankle1() {
        this.hole(15, 10, 3.45);
    }

    servoring(move) {
        if (this.move(20, 20, move, true)) {
            return;
        }
        this.moveTo(10, 10, 90);
        this.moveTo(3.45, 0, -90);
        this.polyline(0, [-264, 3.45], 0, 36, 6.55, 108, 0, [330, 9.0, 4], 0, 108, 6.55);
        this.move(20, 20, move);
    }

    ankle2() {
        this.hole(15, 10, (this.anklebolt1 / 2));
    }

    servoHole() {
        this.hole(6, 6, (11.6 / 2));
        this.hole(6, 12, (5.5 / 2));
    }

    render() {
        let t = this.thickness;
        let ws = 25;
        let lx;
        let ly;
        let lh;
        [lx, ly, lh] = [12.4, 23.5, Math.max(this.length, ((ws + 6) + t))];
        this.ctx.save();
        let c1 = edges.CompoundEdge(this, "FE", [(ly - 7.0), 7.0]);
        let c2 = edges.CompoundEdge(this, "EF", [7.0, (lh - 7.0)]);
        let e = [c1, c2, "F", "F"];
        for (let i = 0; i < 2; i += 1) {
            this.rectangularWall(lx, (lh - 7.0), [LegEdge(this, null), "f", "F", "f"], {callback: [null, () => this.fingerHolesAt((ws - 7.0), 0, lx)], move: "right"});
            this.rectangularWall(lx, lh, "FfFf", {callback: [() => this.hole((lx / 2), 7, (this.anklebolt2 / 2))], move: "right"});
            this.rectangularWall(ly, lh, e, {callback: [null, () => this.fingerHolesAt(ws, 7.0, ((ly - 7.0) - 3.0))], move: "right"});
            this.rectangularWall(ly, lh, e, {callback: [() => this.rectangularHole((ly / 2), ((ws + 3) + (0.5 * t)), 12, 6, 3), () => this.fingerHolesAt(ws, 7.0, ((ly - 7.0) - 3.0))], move: "right"});
        }
        this.partsMatrix(2, 1, "right", this.rectangularWall, ly, lx, "ffff", {callback: [null, () => this.hole((lx / 2), (ly / 2), 2.3)]});
        this.partsMatrix(2, 1, "right", this.rectangularWall, lx, ly, "eeee", {callback: [() => this.hole((lx / 2), (ly / 2), 1.5)]});
        this.partsMatrix(2, 1, "right", this.rectangularWall, 4.6, lx, "efee");
        this.partsMatrix(2, 1, "right", this.rectangularWall, lx, (ly - 7.0), "efff");
        this.partsMatrix(2, 1, "right", this.rectangularWall, lx, ((ly - 7.0) - 3.0), "efef");
        this.ctx.restore();
        this.rectangularWall(lx, lh, "ffff", {move: "up only"});
        this.foot(60, 40, ly, 30, {move: "right"});
        this.foot(60, 40, ly, 30, {move: "right"});
        this.ankles(30, 25, {callback: [null, this.ankle1], move: "right"});
        this.ankles(30, 25, {callback: [null, this.ankle2], move: "right"});
        this.partsMatrix(2, 2, "right", this.servoring);
    }

}

module.exports.OttoLegs = OttoLegs;