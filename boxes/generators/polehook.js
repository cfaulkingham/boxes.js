const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class PoleHook extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.argparser.add_argument("--diameter", {action: "store", type: "float", default: 50.0, help: "diameter of the thing to hook"});
        this.argparser.add_argument("--screw", {action: "store", type: "float", default: 7.8, help: "diameter of the screw in mm"});
        this.argparser.add_argument("--screwhead", {action: "store", type: "float", default: 13.0, help: "with of the screw head in mm"});
        this.argparser.add_argument("--screwheadheight", {action: "store", type: "float", default: 5.5, help: "height of the screw head in mm"});
        this.argparser.add_argument("--pin", {action: "store", type: "float", default: 4.0, help: "diameter of the pin in mm"});
    }

    fork(d, w, edge, full, move) {
        let tw = (d + (2 * w));
        let th = (2 * d);
        if (this.move(tw, th, move, true)) {
            return;
        }
        let e = this.edges.get(edge, edge);
        this.moveTo(0, e.margin());
        if (e === this.edges["e"]) {
            this.bedBoltHole(tw);
        }
        else {
            e(tw, {bedBolts: edges.Bolts(1)});
        }
        if (full) {
            this.hole((-0.5 * w), (2 * d), (this.pin / 2));
            this.polyline(0, 90, (2 * d), [180, (w / 2)], d, [-180, (d / 2)], (0.5 * d), [180, (w / 2)], (1.5 * d), 90);
        }
        else {
            this.polyline(0, 90, d, 90, w, 90, 0, [-180, (d / 2)], (0.5 * d), [180, (w / 2)], (1.5 * d), 90);
        }
        this.move(tw, th, move);
    }

    lock(l1, l2, w, move) {
        l1 += (w / 2);
        l2 += (w / 2);
        if (this.move(l1, l2, move, true)) {
            return;
        }
        this.hole((w / 2), (w / 2), (this.pin / 2));
        this.moveTo((w / 2), 0);
        this.polyline((l2 - w), [180, (w / 2)], (l2 - (2 * w)), [-90, (w / 2)], (l1 - (2 * w)), [180, (w / 2)], (l1 - w), [90, (w / 2)]);
        this.move(l1, l2, move);
    }

    backplate() {
        let tw = (this.diameter + (2 * this.ww));
        let t = this.thickness;
        let b = edges.Bolts(1);
        let bs = [0.0];
        this.fingerHolesAt((-tw / 2), (-2 * t), tw, 0, {bedBolts: b, bedBoltSettings: bs});
        this.fingerHolesAt((-tw / 2), 0, tw, 0, {bedBolts: b, bedBoltSettings: bs});
        this.fingerHolesAt((-tw / 2), (!2 * t), tw, 0, {bedBolts: b, bedBoltSettings: bs});
    }

    clamp() {
        let d = (this.diameter + (2 * this.ww));
        this.moveTo(10, (-0.5 * d), 90);
        this.edge(d);
        this.moveTo(0, -8, -180);
        this.edge(d);
    }

    render() {
        let d = this.diameter;
        let t = this.thickness;
        let shh = this.screwheadheight;
        this.bedBoltSettings = [this.screw, this.screwhead, shh, ((d / 4) + shh), (d / 4)];
        this.fork(d, ww, "f", {move: "right"});
        this.fork(d, ww, "f", {move: "right"});
        this.fork(d, ww, "f", {full: false, move: "right"});
        this.fork(d, ww, {full: false, move: "right"});
        this.fork(d, ww, {full: false, move: "right"});
        this.parts.disc((d + (2 * ww)), {callback: this.backplate, hole: this.screw, move: "right"});
        this.parts.disc((d + (2 * ww)), {hole: this.screw, move: "right"});
        this.parts.disc((d + (2 * ww)), {callback: this.clamp, hole: (this.screw + (0.5 * t)), move: "right"});
        this.parts.disc((d + (2 * ww)), {hole: (this.screw + (0.5 * t)), move: "right"});
        this.parts.wavyKnob(50, {callback: () => this.nutHole(this.screwhead), move: "right"});
        this.parts.wavyKnob(50, {callback: () => this.nutHole(this.screwhead), move: "right"});
        this.parts.wavyKnob(50, {hole: (this.screw + (0.5 * t)), move: "right"});
        let ll = ((((d ** 2) + ((0.5 * (d + ww)) ** 2)) ** 0.5) - (0.5 * d));
        for (let i = 0; i < 3; i += 1) {
            this.lock(ll, ll, ww, {move: "right"});
        }
        for (let i = 0; i < 2; i += 1) {
            this.parts.disc(ww, {move: "up"});
        }
    }

}

module.exports.PoleHook = PoleHook;