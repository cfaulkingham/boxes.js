import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class BreadBox extends Boxes {
    side(l, h, r, move) {
        let t = this.thickness;
        if (this.move((l + (2 * t)), (h + (2 * t)), move, true)) {
            return;
        }
        this.moveTo(t, t);
        this.ctx.save();
        let n = this.n;
        let a = (90.0 / n);
        let ls = ((2 * Math.sin(((a / 2) * Math.PI / 180))) * (r - (2.5 * t)));
        this.fingerHolesAt((2 * t), 0, (h - r), 90);
        this.moveTo((2.5 * t), (h - r), (90 - (a / 2)));
        for (let i = 0; i < n; i += 1) {
            this.fingerHolesAt(0, (0.5 * t), ls, 0);
            this.moveTo(ls, 0, -a);
        }
        this.moveTo(0, 0, (a / 2));
        this.fingerHolesAt(0, (0.5 * t), ((l / 2) - r), 0);
        this.ctx.restore();
        this.edges["f"](l);
        this.polyline(t, 90, (h - r), [90, (r + t)], ((l / 2) - r), 90, t, -90, 0);
        this.edges["f"]((l / 2));
        this.polyline(0, 90);
        this.edges["f"](h);
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

    rails(l, h, r, move) {
        let t = this.thickness;
        let s = this.spacing;
        let tw;
        let th;
        [tw, th] = [(((l / 2) + (2.5 * t)) + (3 * s)), ((h + (1.5 * t)) + (3 * s))];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(((2.5 * t) + s), 0);
        this.polyline(((l / 2) - r), [90, (r + t)], (h - r), 90, t, 90, (h - r), [-90, r], ((l / 2) - r), 90, t, 90);
        this.moveTo((-t - s), (t + s));
        this.polyline(((l / 2) - r), [90, (r + t)], (h - r), 90, t, 90, (h - r), [-90, r], ((l / 2) - r), 90, t, 90);
        this.moveTo((!t - s), (t + s));
        this.polyline(((l / 2) - r), [90, (r - (1.5 * t))], (h - r), 90, t, 90, (h - r), [-90, (r - (2.5 * t))], ((l / 2) - r), 90, t, 90);
        this.moveTo((-t - s), (t + s));
        this.polyline(((l / 2) - r), [90, (r - (1.5 * t))], (h - r), 90, t, 90, (h - r), [-90, (r - (2.5 * t))], ((l / 2) - r), 90, t, 90);
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
    }

    render() {
        let x;
        let y;
        let h;
        let r;
        [x, y, h, r] = [this.x, this.y, this.h, this.radius];
        if (!r) {
        }
        let t = this.thickness;
        this.ctx.save();
        this.side(x, h, r, {move: "right"});
        this.side(x, h, r, {move: "right"});
        this.rectangularWall(y, h, "fFfF", {move: "right"});
        this.ctx.restore();
        this.side(x, h, r, {move: "up only"});
        this.rectangularWall(x, y, "FEFF", {move: "right"});
        this.rectangularWall((x / 2), y, "FeFF", {move: "right"});
        this.door((((((x / 2) + h) - (2 * r)) + ((0.5 * Math.PI) * r)) + (2 * t)), (y - (0.2 * t)), {move: "right"});
        this.rectangularWall((2 * t), (y - (2.2 * t)), {edges: "eeef", move: "right"});
        let a = (90.0 / n);
        let ls = ((2 * Math.sin(((a / 2) * Math.PI / 180))) * (r - (2.5 * t)));
        edges.FingerJointSettings.edgeObjects(this, {chars: "aA"});
        edges.FingerJointSettings.edgeObjects(this, {chars: "bB"});
        this.rectangularWall((h - r), y, "fbfe", {move: "right"});
        this.rectangularWall(ls, y, "fafB", {move: "right"});
        for (let i = 0; i < (n - 2); i += 1) {
            this.rectangularWall(ls, y, "fafA", {move: "right"});
        }
        this.rectangularWall(ls, y, "fbfA", {move: "right"});
        this.rectangularWall(((x / 2) - r), y, "fefB", {move: "right"});
        this.rails(x, h, r, {move: "right mirror"});
        this.cornerRadius(r, {two: true, move: "right"});
    }

}

export { BreadBox };