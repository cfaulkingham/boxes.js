import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class AngledBox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser("x", "y", "h", "outside", "bottom_edge");
        this.argparser.add_argument("--n", {action: "store", type: "int", default: 5, help: "number of walls at one side (1+)"});
        this.argparser.add_argument("--top", {action: "store", type: "str", default: "none", choices: ["none", "angled hole", "angled lid", "angled lid2"], help: "style of the top and lid"});
    }

    floor(x, y, n, edge, hole, move, callback, label) {
        let r;
        let h;
        let side;
        [r, h, side] = this.regularPolygon(((2 * n) + 2));
        let t = this.thickness;
        if ((n % 2)) {
            let lx = ((x - (2 * h)) + side);
        }
        else {
            lx = ((x - (2 * r)) + side);
        }
        edge = this.edges.get(edge, edge);
        let tx = (x + (2 * edge.spacing()));
        let ty = (y + (2 * edge.spacing()));
        if (this.move(tx, ty, move)) {
            return;
        }
        this.moveTo(((tx - lx) / 2.0), edge.margin());
        if (hole) {
            this.ctx.save();
            let hr;
            let hh;
            let hside;
            [hr, hh, hside] = this.regularPolygon(((2 * n) + 2));
            let dx = (side - hside);
            let hlx = (lx - dx);
            this.moveTo((dx / 2.0), (t + edge.spacing()));
            for (let [i, l] of enumerate((([hlx] + ([hside] * n)) * 2))) {
                this.edge(l);
                this.corner((360.0 / ((2 * n) + 2)));
            }
            this.ctx.restore();
        }
        for (let [i, l] of enumerate((([lx] + ([side] * n)) * 2))) {
            this.cc(callback, i, 0, (edge.startwidth() + this.burn));
            edge(l);
            this.edgeCorner(edge, edge, (360.0 / ((2 * n) + 2)));
        }
        this.move(tx, ty, move, {label: label});
    }

    render() {
        let x;
        let y;
        let h;
        let n;
        [x, y, h, n] = [this.x, this.y, this.h, this.n];
        let b = this.bottom_edge;
        if (n < 1) {
        }
        if (x < y) {
            [x, y] = [y, x];
        }
        if (this.outside) {
            x = this.adjustSize(x);
            y = this.adjustSize(y);
            if (this.top === "none") {
                h = this.adjustSize(h, false);
            }
            else {
                if ((this.top.includes("lid") && this.top !== "angled lid")) {
                    h = (this.adjustSize(h) - this.thickness);
                }
                else {
                    h = this.adjustSize(h);
                }
            }
        }
        let t = this.thickness;
        let r;
        let hp;
        let side;
        [r, hp, side] = this.regularPolygon(((2 * n) + 2));
        if ((n % 2)) {
            let lx = ((x - (2 * hp)) + side);
        }
        else {
            lx = ((x - (2 * r)) + side);
        }
        let fingerJointSettings = this.edges["f"].settings;
        fingerJointSettings.setValues(this.thickness, {angle: (360.0 / (2 * (n + 1)))});
        fingerJointSettings.edgeObjects(this, {chars: "gGH"});
        this.ctx.save();
        if (b !== "e") {
            this.floor(x, y, n, {edge: "f", move: "right", label: "Bottom"});
        }
        if (this.top === "angled lid") {
            this.floor(x, y, n, {edge: "e", move: "right", label: "Lower Lid"});
            this.floor(x, y, n, {edge: "E", move: "right", label: "Upper Lid"});
        }
        else {
            if (["angled hole", "angled lid2"].includes(this.top)) {
                this.floor(x, y, n, {edge: "F", move: "right", hole: true, label: "Top Rim and Lid"});
                if (this.top === "angled lid2") {
                    this.floor(x, y, n, {edge: "E", move: "right", label: "Upper Lid"});
                }
            }
        }
        this.ctx.restore();
        this.floor(x, y, n, {edge: "F", move: "up only"});
        let fingers = ["angled lid2", "angled hole"].includes(this.top);
        let cnt = 0;
        for (let j = 0; j < 2; j += 1) {
            cnt += 1;
            if ((j === 0 || (n % 2))) {
                this.rectangularWall(lx, h, {move: "right", edges: (fingers ? (b + "GfG") : (b + "GeG")), label: /* unknown node JoinedStr */});
            }
            else {
                this.rectangularWall(lx, h, {move: "right", edges: (fingers ? (b + "gfg") : (b + "geg")), label: /* unknown node JoinedStr */});
            }
            for (let i = 0; i < n; i += 1) {
                cnt += 1;
                if (((i + (j * ((n + 1) % 2))) % 2)) {
                    this.rectangularWall(side, h, {move: "right", edges: (fingers ? (b + "GfG") : (b + "GeG")), label: /* unknown node JoinedStr */});
                }
                else {
                    this.rectangularWall(side, h, {move: "right", edges: (fingers ? (b + "gfg") : (b + "geg")), label: /* unknown node JoinedStr */});
                }
            }
        }
    }

}

export { AngledBox };