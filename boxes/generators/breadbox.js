import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class BreadBox extends Boxes {
    side(l, h, r, kw = {}) {
        const { move = null } = kw;
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
        // Use edge objects via their .draw() methods
        this.edges["f"].draw(l);
        this.polyline(t, 90, (h - r), [90, (r + t)], ((l / 2) - r), 90, t, -90, 0);
        this.edges["f"].draw(l / 2);
        this.polyline(0, 90);
        this.edges["f"].draw(h);
        this.move((l + (2 * t)), (h + (2 * t)), move);
    }

    cornerRadius(r, kw = {}) {
        const { two = false, move = null } = kw;
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

    rails(l, h, r, kw = {}) {
        const { move = null } = kw;
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
        // The original Python uses (-t - s); translate that directly
        this.moveTo((-t - s), (t + s));
        this.polyline(((l / 2) - r), [90, (r - (1.5 * t))], (h - r), 90, t, 90, (h - r), [-90, (r - (2.5 * t))], ((l / 2) - r), 90, t, 90);
        this.moveTo((-t - s), (t + s));
        this.polyline(((l / 2) - r), [90, (r - (1.5 * t))], (h - r), 90, t, 90, (h - r), [-90, (r - (2.5 * t))], ((l / 2) - r), 90, t, 90);
        this.move(tw, th, move);
    }

    door(l, h, kw = {}) {
        const { move = null } = kw;
        let t = this.thickness;
        if (this.move(l, h, move, true)) {
            return;
        }
        this.fingerHolesAt(t, t, (h - (2 * t)));
        this.edge((2 * t));
        // Flex edge 'X' takes (length, height)
        if (this.edges["X"] && typeof this.edges["X"].draw === "function") {
            this.edges["X"].draw((l - (2 * t)), h);
        } else {
            // Fallback: just draw a straight edge if flex edge is unavailable
            this.edge(l - (2 * t));
        }
        this.polyline(0, 90, h, 90, l, 90, h, 90);
        this.move(l, h, move);
    }

    constructor() {
        super();
        // Finger joints (standard 'f'/'F' edges are created in _buildObjects)
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 0.5});

        // NOTE: Flex edge 'X' must be created AFTER the base _buildObjects()
        // runs (which resets this.edges). We therefore register it in
        // a BreadBox-specific _buildObjects override instead of here.

        // this.buildArgParser();
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 40.0, help: "radius of the corners"});
    }

    _buildObjects() {
        // First let the base class create its standard edges and parts
        super._buildObjects();

        // Flex edge for the sliding door (register as 'X'). We do this
        // here so that it survives the base _buildObjects() reset, and
        // so it uses the final thickness from parseArgs().
        const flexSettings = new edges.FlexSettings(this.thickness, true, {
            distance: 0.75,
            connection: 2.0,
        });
        const flexEdge = new edges.FlexEdge(this, flexSettings);
        flexEdge.char = 'X';
        this.addPart(flexEdge);
    }

    render() {
        let x;
        let y;
        let h;
        let r;
        [x, y, h, r] = [this.x, this.y, this.h, this.radius];

        // Upstream: self.n = n = 3
        this.n = 3;
        const n = this.n;

        // Upstream: default and clamp radius based on h
        if (!r) {
            r = h / 2;
        }
        r = Math.min(r, h / 2);
        this.radius = r;

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
        // rectangularWall(x, y, edges, kw)
        this.rectangularWall((2 * t), (y - (2.2 * t)), "eeef", {move: "right"});

        const a = (90.0 / n);
        const ls = (2 * Math.sin(((a / 2) * Math.PI / 180))) * (r - (2.5 * t));

        // Upstream:
        //   edges.FingerJointSettings(t, angle=a).edgeObjects(self, chars="aA")
        //   edges.FingerJointSettings(t, angle=a/2).edgeObjects(self, chars="bB")
        new edges.FingerJointSettings(t, true, { angle: a }).edgeObjects(this, "aA");
        new edges.FingerJointSettings(t, true, { angle: a / 2 }).edgeObjects(this, "bB");
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