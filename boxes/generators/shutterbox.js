const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class ShutterBox extends Boxes {
    side(l, h, r, style, move) {
        let t = this.thickness;
        if (this.move((l + (2 * t)), (h + (2 * t)), move, true)) {
            return;
        }
        this.moveTo(t, t);
        this.ctx.save();
        let n = this.n;
        let a = (90.0 / n);
        let ls = ((2 * Math.sin(((a / 2) * Math.PI / 180))) * (r - (2.5 * t)));
        if (style === "double") {
            this.ctx.save();
            this.fingerHolesAt(r, (2 * t), (l - (2 * r)), 0);
            this.moveTo(r, (2.5 * t), (180 - (a / 2)));
            for (let i = 0; i < n; i += 1) {
                this.fingerHolesAt(0, (0.5 * t), ls, 0);
                this.moveTo(ls, 0, -a);
            }
            if ((h - (2 * r)) > (2 * t)) {
                this.moveTo(0, 0, (a / 2));
                this.fingerHolesAt(0, (0.5 * t), (h - (2 * r)), 0);
            }
            this.ctx.restore();
        }
        else {
            this.fingerHolesAt(0, (2 * t), (l - r), 0);
        }
        this.moveTo((l - r), (2.5 * t), (a / 2));
        for (let i = 0; i < n; i += 1) {
            this.fingerHolesAt(0, (-0.5 * t), ls, 0);
            this.moveTo(ls, 0, a);
        }
        if ((h - (2 * r)) > (2 * t)) {
            this.moveTo(0, 0, (-a / 2));
            this.fingerHolesAt(0, (-0.5 * t), (h - (2 * r)), 0);
        }
        this.ctx.restore();
        this.edges["f"](l);
        this.corner(90);
        this.edges["f"]((h - r));
        this.polyline(0, -90, t, 90, 0, [90, (r + t)]);
        if (style === "single") {
            this.polyline((l - r), 90, t);
            this.edges["f"](h);
        }
        else {
            this.polyline((l - (2 * r)), [90, (r + t)], 0, 90, t, -90);
            this.edges["f"]((h - r));
        }
        this.move((l + (2 * t)), (h + (2 * t)), move);
    }

    cornerRadius(r, two, move) {
        let s = this.spacing;
        if (this.move(r, (r + s), move, true)) {
            return;
        }
        for (let i = 0; i < (two ? 2 : 1); i += 1) {
            this.polyline(r, 90, r, 180, 0, [-90, r], 0, -180);
            this.moveTo(r, (r + s), 180);
        }
        this.move(r, (r + s), move);
    }

    rails(l, r, move) {
        let t = this.thickness;
        let s = this.spacing;
        let tw;
        let th;
        [tw, th] = [((l + (2.5 * t)) + (3 * s)), ((r + (1.5 * t)) + (3 * s))];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(((2.5 * t) + s), 0);
        this.polyline((l - r), [90, (r + t)], 0, 90, t, 90, 0, [-90, r], (l - r), 90, t, 90);
        this.moveTo((-t - s), (t + s));
        this.polyline((l - r), [90, (r + t)], 0, 90, t, 90, 0, [-90, r], (l - r), 90, t, 90);
        this.moveTo((0.5 * t), (t + s));
        this.polyline((l - r), [90, (r - (1.5 * t))], 0, 90, t, 90, 0, [-90, (r - (2.5 * t))], (l - r), 90, t, 90);
        this.moveTo((-t - s), (t + s));
        this.polyline((l - r), [90, (r - (1.5 * t))], 0, 90, t, 90, 0, [-90, (r - (2.5 * t))], (l - r), 90, t, 90);
        this.move(tw, th, move);
    }

    rails2(l, r, move) {
        let t = this.thickness;
        let s = this.spacing;
        let tw;
        let th;
        [tw, th] = [((l + (2.5 * t)) + (3 * s)), ((2 * r) + t)];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo((r + t), 0);
        for (let i = 0; i < 2; i += 1) {
            this.polyline((l - (2 * r)), [90, (r + t)], 0, 90, t, 90, 0, [-90, r], (l - (2 * r)), [-90, r], 0, 90, t, 90, 0, [90, (r + t)]);
            this.moveTo(0, (1.5 * t));
            this.polyline((l - (2 * r)), [90, (r - (1.5 * t))], 0, 90, t, 90, 0, [-90, (r - (2.5 * t))], (l - (2 * r)), [-90, (r - (2.5 * t))], 0, 90, t, 90, 0, [90, (r - (1.5 * t))]);
            this.moveTo(0, r);
        }
        this.move(tw, th, move);
    }

    door(l, h, move) {
        let t = this.thickness;
        if (this.move(l, h, move, true)) {
            return;
        }
        this.fingerHolesAt(t, t, (h - (2 * t)));
        this.edge((2 * t));
        this.edges["X"]((l - (2 * t)), h);
        this.polyline(0, 90, h, 90, l, 90, h, 90);
        this.move(l, h, move);
    }

    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 0.5});
        this.addSettingsArgs(edges.FlexSettings, {distance: 0.75, connection: 2.0});
        // this.buildArgParser();
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 40.0, help: "radius of the corners"});
        this.argparser.add_argument("--style", {action: "store", type: "str", default: "single", choices: ["single", "double"], help: "Number of rounded top corners"});
    }

    render() {
        let x;
        let y;
        let h;
        let r;
        [x, y, h, r] = [this.x, this.y, this.h, this.radius];
        let style = this.style;
        if (!r) {
        }
        let t = this.thickness;
        this.ctx.save();
        this.side(y, h, r, style, {move: "right"});
        this.side(y, h, r, style, {move: "right"});
        if (style === "single") {
            this.rectangularWall(x, h, "fFEF", {move: "right"});
        }
        else {
            this.rectangularWall(x, (h - r), "fFeF", {move: "right"});
        }
        this.rectangularWall(x, (h - r), "fFeF", {move: "right"});
        if (style === "double") {
            this.cornerRadius(r, {two: true, move: "right"});
        }
        this.cornerRadius(r, {two: true, move: "right"});
        if (style === "single") {
            this.rails(y, r, {move: "right"});
        }
        else {
            this.rails2(y, r, {move: "right"});
        }
        this.ctx.restore();
        this.side(y, h, r, style, {move: "up only"});
        this.rectangularWall(y, x, "FFFF", {move: "right"});
        if (style === "single") {
            this.door((((y - r) + ((0.5 * Math.PI) * r)) + (3 * t)), (x - (0.2 * t)), {move: "right"});
        }
        else {
            this.door((((y - (2 * r)) + (Math.PI * r)) + (3 * t)), (x - (0.2 * t)), {move: "right"});
        }
        this.rectangularWall((2 * t), (x - (2.2 * t)), {edges: "eeef", move: "right"});
        let a = (90.0 / n);
        let ls = ((2 * Math.sin(((a / 2) * Math.PI / 180))) * (r - (2.5 * t)));
        edges.FingerJointSettings.edgeObjects(this, {chars: "aA"});
        edges.FingerJointSettings.edgeObjects(this, {chars: "bB"});
        if (style === "double") {
            if ((h - (2 * r)) > (2 * t)) {
                this.rectangularWall((h - (2 * r)), x, "fBfe", {move: "right"});
                this.rectangularWall(ls, x, "fAfb", {move: "right"});
            }
            else {
                this.rectangularWall(ls, x, "fAfe", {move: "right"});
            }
            for (let i = 0; i < (n - 2); i += 1) {
                this.rectangularWall(ls, x, "fAfa", {move: "right"});
            }
            this.rectangularWall(ls, x, "fBfa", {move: "right"});
            this.rectangularWall((y - (2 * r)), x, "fbfb", {move: "right"});
        }
        else {
            this.rectangularWall((y - r), x, "fbfe", {move: "right"});
        }
        this.rectangularWall(ls, x, "fafB", {move: "right"});
        for (let i = 0; i < (n - 2); i += 1) {
            this.rectangularWall(ls, x, "fafA", {move: "right"});
        }
        if ((h - (2 * r)) > (2 * t)) {
            this.rectangularWall(ls, x, "fbfA", {move: "right"});
            this.rectangularWall((h - (2 * r)), x, "fefB", {move: "right"});
        }
        else {
            this.rectangularWall(ls, x, "fefA", {move: "right"});
        }
    }

}

module.exports.ShutterBox = ShutterBox;