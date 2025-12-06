import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { CompoundEdge  } from '../edges.js';
import { Edge  } from '../edges.js';

class USlotEdge extends Edge {
    constructor(boxes, settings, edge) {
        super();
        this.e = edge;
    }

    __call__(length, bedBolts, bedBoltSettings) {
        let l = length;
        let o = this.settings;
        let d = ((length * (1 - (o / 100))) / 2);
        let r = Math.min((3 * this.thickness), ((l - (2 * d)) / 2));
        this.edges[this.e](d);
        this.step(-this.edges[this.e].endwidth());
        this.polyline(0, 90, 0, [-90, r], ((l - (2 * d)) - (2 * r)), [-90, r], 0, 90);
        this.step(this.edges[this.e].startwidth());
        this.edges[this.e](d);
    }

    margin() {
        return this.edges[this.e].margin();
    }

    startwidth() {
        return this.edges[this.e].startwidth();
    }

}

export { USlotEdge };
class HalfStackableEdge extends Boxes {
    __call__(length) {
        let s = this.settings;
        let r = ((s.height / 2.0) / (1 - Math.cos((s.angle * Math.PI / 180))));
        let l = (r * Math.sin((s.angle * Math.PI / 180)));
        let p = (this.bottom ? 1 : -1);
        if (this.bottom) {
            this.boxes.fingerHolesAt(0, ((s.height + this.settings.holedistance) + (0.5 * this.boxes.thickness)), length, 0);
        }
        this.boxes.edge(s.width, {tabs: 1});
        this.boxes.corner((p * s.angle), r);
        this.boxes.corner((-p * s.angle), r);
        this.boxes.edge(((length - (1 * s.width)) - (2 * l)));
    }

    endwidth() {
        return (this.settings.holedistance + this.settings.thickness);
    }

}

export { HalfStackableEdge };
class NotesHolder extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 1});
        this.addSettingsArgs(edges.StackableSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--bottom_edge", {action: "store", type: ArgparseEdgeType("Fhsfe"), choices: list("Fhsfe"), default: "s", help: "edge type for bottom edge"});
        this.argparser.add_argument("--opening", {action: "store", type: "float", default: 40, help: "percent of front (or back) that's open"});
        this.argparser.add_argument("--back_openings", {action: "store", type: boolarg, default: false, help: "have openings on the back side, too"});
    }

    fingerHoleCB(lengths, height, posy) {
        const CB = () => {
            let t = this.thickness;
            let px = (-0.5 * t);
            for (let x of lengths.slice(0, -1)) {
                px += (x + t);
                this.fingerHolesAt(px, posy, height, 90);
            }
        };

        return CB;
    }

    render() {
        let sx;
        let y;
        let h;
        [sx, y, h] = [this.sx, this.y, this.h];
        let t = this.thickness;
        let x = (sx.reduce((a, b) => a + b, 0) + ((sx.length - 1) * t));
        let o = Math.max(0, Math.min(this.opening, 100));
        let sides = ((x * (1 - (o / 100))) / 2);
        let b = this.edges.get(this.bottom_edge, this.edges["F"]);
        if (this.bottom_edge === "s") {
            let b2 = HalfStackableEdge(this, this.edges["s"].settings, this.edges["f"].settings);
            let b3 = this.edges["h"];
        }
        else {
            b2 = b;
            b3 = b;
        }
        let b4 = Edge(this, null);
        b4.startwidth = () => b3.startwidth();
        for (let side = 0; side < 2; side += 1) {
            this.ctx.save();
            this.rectangularWall(y, h, [b, "F", "e", "F"], {ignore_widths: [1, 6], move: "right"});
            if ((this.opening === 0.0 || (side && !this.back_openings))) {
                this.rectangularWall(x, h, [b, "f", "e", "f"], {callback: [this.fingerHoleCB(sx, h)], ignore_widths: [1, 6], move: "right"});
            }
            else {
                this.rectangularWall(((sx[0] * (1 - (o / 100))) / 2), h, [b2, "e", "e", "f"], {ignore_widths: [1, 6], move: "right"});
                for (let ix = 0; ix < (sx.length - 1); ix += 1) {
                    let left = ((sx[ix] * (1 - (o / 100))) / 2);
                    let right = ((sx[(ix + 1)] * (1 - (o / 100))) / 2);
                    let h_e = t;
                    let bottom_edge = CompoundEdge(this, [b3, b4, b3], [left, t, right]);
                    this.rectangularWall(((left + right) + t), h, [bottom_edge, "e", "e", "e"], {callback: [() => this.fingerHolesAt((left + (t / 2)), 0, h, 90)], move: "right"});
                }
                this.rectangularWall(((sx[-1] * (1 - (o / 100))) / 2), h, [b2, "e", "e", "f"], {ignore_widths: [1, 6], move: "right mirror"});
            }
            this.ctx.restore();
            this.rectangularWall(x, h, [b, "F", "e", "F"], {ignore_widths: [1, 6], move: "up only"});
            sx = list(reversed(sx));
        }
        if (this.bottom_edge !== "e") {
            let outer_edge = (this.bottom_edge === "f" ? "h" : "f");
            let u_edge = USlotEdge(this, o, outer_edge);
            let outer_width = this.edges[outer_edge].startwidth();
            if (this.opening > 0.0) {
                let edge_array = [];
                let lengths_array = [];
                for (let i = 0; i < sx.length; i++) {
                    edge_array.push(u_edge);
                    lengths_array.push(sx[i]);
                    if (i < sx.length - 1) {
                        edge_array.push(new edges.OutSetEdge(this, outer_width));
                        lengths_array.push(this.thickness);
                    }
                }
                var front_edge = new CompoundEdge(this, edge_array, lengths_array);
            }
            if ((this.opening > 0.0 && this.back_openings)) {
                let edge_array = [];
                let lengths_array = [];
                for (let i = 0; i < sx.length; i++) {
                    edge_array.push(u_edge);
                    lengths_array.push(sx[i]);
                    if (i < sx.length - 1) {
                        edge_array.push(new edges.OutSetEdge(this, outer_width));
                        lengths_array.push(this.thickness);
                    }
                }
                var back_edge = new CompoundEdge(this, edge_array, lengths_array);
            }
            this.rectangularWall(x, y, [front_edge, outer_edge, back_edge, outer_edge], {callback: [this.fingerHoleCB(sx, y)], move: "up"});
        }
        for (let i = 0; i < (sx.length - 1); i += 1) {
            this.rectangularWall(y, h, ((this.bottom_edge === "e" ? "e" : "f") + "fef"), {move: "right"});
        }
    }

}

export { NotesHolder };