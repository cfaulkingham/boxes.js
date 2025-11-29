const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class ShadyEdge extends Boxes {
    __call__(length) {
        let s = this.shades;
        let h = this.h;
        let a = Math.atan((s / h));
        let angle = (a * 180 / Math.PI);
        for (let i = 0; i < this.n; i += 1) {
            this.polyline(0, -angle, (h / Math.cos(a)), (angle + 90));
            this.edges["f"](s);
            this.corner(-90);
            if (i < (this.n - 1)) {
                this.edge(this.thickness);
            }
        }
    }

    margin() {
        return this.shades;
    }

}

module.exports.ShadyEdge = ShadyEdge;
class TrafficLight extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser("h", "hole_dD");
        this.argparser.add_argument("--depth", {action: "store", type: "float", default: 100, help: "inner depth not including the shades"});
        this.argparser.add_argument("--shades", {action: "store", type: "float", default: 50, help: "depth of the shaders"});
        this.argparser.add_argument("--n", {action: "store", type: "int", default: 3, help: "number of lights"});
        this.argparser.add_argument("--upright", {action: "store", type: boolarg, default: true, help: "stack lights upright (or side by side)"});
    }

    backCB() {
        let t = this.thickness;
        for (let i = 1; i < this.n; i += 1) {
            this.fingerHolesAt(((i * (this.h + t)) - (0.5 * t)), 0, this.h);
        }
    }

    sideCB() {
        let t = this.thickness;
        for (let i = 1; i < this.n; i += 1) {
            this.fingerHolesAt(((i * (this.h + t)) - (0.5 * t)), 0, this.depth);
        }
        for (let i = 0; i < this.n; i += 1) {
            this.fingerHolesAt((i * (this.h + t)), (this.depth - (2 * t)), this.h, 0);
        }
    }

    topCB() {
        let t = this.thickness;
        for (let i = 1; i < this.n; i += 1) {
            this.fingerHolesAt(((i * (this.h + t)) - (0.5 * t)), 0, (this.depth + this.shades));
        }
        for (let i = 0; i < this.n; i += 1) {
            this.fingerHolesAt((i * (this.h + t)), (this.depth - (2 * t)), this.h, 0);
        }
    }

    frontCB() {
        this.hole((this.h / 2), (this.h / 2), ((this.h / 2) - this.thickness));
    }

    wall(h1, h2, w, edges, callback, move, label) {
        edges = /* unknown node ListComp */;
        edges += edges;
        let overallwidth = ((w + edges[-1].spacing()) + edges[1].spacing());
        let overallheight = ((Math.max(h1, h2) + edges[0].spacing()) + edges[2].spacing());
        if (this.move(overallwidth, overallheight, move)) {
            return;
        }
        let a = Math.atan(((h2 - h1) / float(w)));
        let angle = (a * 180 / Math.PI);
        this.moveTo(edges[-1].spacing(), edges[0].margin());
        for (let [i, l] of [[0, w], [1, h2]]) {
            this.cc(callback, i, {y: (edges[i].startwidth() + this.burn)});
            edges[i](l);
            this.edgeCorner(edges[i], edges[(i + 1)], 90);
        }
        this.corner(angle);
        this.cc(callback, i, {y: (edges[2].startwidth() + this.burn)});
        edges[2]((w / Math.cos(a)));
        this.corner(-angle);
        this.edgeCorner(edges[2], edges[(2 + 1)], 90);
        this.cc(callback, i, {y: (edges[3].startwidth() + this.burn)});
        edges[3](h1);
        this.edgeCorner(edges[3], edges[(3 + 1)], 90);
        this.move(overallwidth, overallheight, move, {label: label});
    }

    addMountH(width, height) {
        let ds = this.hole_dD[0];
        if (this.hole_dD.length < 2) {
            let dh = 0;
            let y = (height - Math.max((this.thickness * 1.25), ((this.thickness * 1.0) + ds)));
        }
        else {
            dh = this.hole_dD[1];
            y = (height - Math.max((this.thickness * 1.25), ((this.thickness * 1.0) + (dh / 2))));
        }
        let dx = width;
        let x1 = (dx * 0.125);
        let x2 = (dx * 0.875);
        this.mountingHole(x1, y, ds, dh, 90);
        this.mountingHole(x2, y, ds, dh, 90);
    }

    addMountV(width, height) {
        if (this.hole_dD[0] < (2 * this.burn)) {
            return;
        }
        let ds = this.hole_dD[0];
        if (this.hole_dD.length < 2) {
            let dh = 0;
            let x = Math.max((this.thickness * 2.75), ((this.thickness * 2.25) + ds));
        }
        else {
            dh = this.hole_dD[1];
            x = Math.max((this.thickness * 2.75), ((this.thickness * 2.25) + (dh / 2)));
        }
        let dy = height;
        let y1 = ((this.thickness * 0.75) + (dy * 0.125));
        let y2 = ((this.thickness * 0.75) + (dy * 0.875));
        this.mountingHole(x, y1, ds, dh, 180);
        this.mountingHole(x, y2, ds, dh, 180);
    }

    render() {
        let d;
        let h;
        let n;
        [d, h, n] = [this.depth, this.h, this.n];
        let s = this.shades;
        let t = this.thickness;
        let th = ((n * (h + t)) - t);
        this.addPart(ShadyEdge(this, null));
        if (this.upright) {
            this.rectangularWall(th, h, "FFFF", {callback: [this.backCB, this.addMountV(th, h)], move: "up", label: "back"});
        }
        else {
            this.rectangularWall(th, h, "FFFF", {callback: [this.backCB, this.addMountH(th, h)], move: "up", label: "back"});
        }
        if (this.upright) {
            this.rectangularWall(th, d, "fFsF", {callback: [this.sideCB], move: "up", label: "left"});
            this.rectangularWall(th, d, "fFsF", {callback: [this.sideCB], move: "up", label: "right"});
            let e = edges.CompoundEdge(this, "fF", [d, s]);
            let e2 = edges.CompoundEdge(this, "Ff", [s, d]);
            for (let i = 0; i < n; i += 1) {
                this.rectangularWall(h, (d + s), ["f", e, "e", e2], {move: (i < (n - 1) ? "right" : "right up"), label: ("horizontal Wall " + str((i + 1)))});
            }
        }
        else {
            this.rectangularWall(th, d, "fFeF", {callback: [this.sideCB], move: "up", label: "bottom"});
            this.rectangularWall(th, (d + s), "fFeF", {callback: [this.topCB], move: "up", label: "top"});
            for (let i = 0; i < n; i += 1) {
                this.wall(d, (d + s), h, {move: (i < (n - 1) ? "right" : "right up"), label: ("vertical wall " + str((i + 1)))});
            }
        }
        for (let i = 0; i < n; i += 1) {
            this.rectangularWall(h, h, "efef", {callback: [this.frontCB], move: (i < (n - 1) ? "left" : "left up"), label: ("front " + str((i + 1)))});
        }
        if (this.upright) {
            this.rectangularWall(h, d, "ffef", {move: "up", label: "bottom wall"});
        }
        else {
            this.wall(d, (d + s), h, {move: "up", label: "vertical wall"});
        }
        for (let i = 0; i < n; i += 1) {
            this.parts.disc((h - (2 * t)), {move: "right", label: "colored windows"});
        }
    }

}

module.exports.TrafficLight = TrafficLight;