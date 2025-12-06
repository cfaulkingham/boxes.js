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
        this.buildArgParser({x: 100, y: 100, h: 100, outside: true});
        this.argparser.add_argument("--bottom_edge", {action: "store", type: "str", default: "h", help: "edge type for bottom edge"});
        this.argparser.add_argument("--n", {action: "store", type: "int", default: 5, help: "number of walls at one side (1+)"});
        this.argparser.add_argument("--top", {action: "store", type: "str", default: "none", choices: ["none", "angled hole", "angled lid", "angled lid2"], help: "style of the top and lid"});
    }

    floor(x, y, n, opts = {}) {
        // Extract options with defaults
        let { edge = 'e', hole = false, move = null, callback = null, label = null } = opts;
        
        // regularPolygon(corners, radius, h, side) - pass h = y/2.0
        let [r, h_poly, side] = this.regularPolygon(2 * n + 2, null, y / 2.0, null);
        let t = this.thickness;
        let lx;
        if (n % 2) {
            lx = x - 2 * h_poly + side;
        } else {
            lx = x - 2 * r + side;
        }
        edge = this.edges.get(edge, edge);
        let tx = (x + (2 * edge.spacing()));
        let ty = (y + (2 * edge.spacing()));
        if (this.move(tx, ty, move, true)) {
            return;
        }
        this.moveTo(((tx - lx) / 2.0), edge.margin());
        if (hole) {
            this.ctx.save();
            // regularPolygon with h = y/2.0 - t
            let [hr, hh, hside] = this.regularPolygon(2 * n + 2, null, y / 2.0 - t, null);
            let dx = (side - hside);
            let hlx = (lx - dx);
            this.moveTo((dx / 2.0), (t + edge.spacing()));
            // Build array: [hlx, hside * n] repeated twice
            const holePattern = [hlx, ...Array(n).fill(hside)];
            const holeEdges = [...holePattern, ...holePattern];
            for (let i = 0; i < holeEdges.length; i++) {
                let l = holeEdges[i];
                this.edge(l);
                this.corner(360.0 / (2 * n + 2));
            }
            this.ctx.restore();
        }
        // Build array: [lx, side * n] repeated twice
        const floorPattern = [lx, ...Array(n).fill(side)];
        const floorEdges = [...floorPattern, ...floorPattern];
        for (let i = 0; i < floorEdges.length; i++) {
            let l = floorEdges[i];
            this.cc(callback, i, 0, edge.startwidth() + this.burn);
            edge.draw(l);
            this.edgeCorner(edge, edge, 360.0 / (2 * n + 2));
        }
        this.move(tx, ty, move, false, label);
    }

    render() {
        let x;
        let y;
        let h;
        let n;
        [x, y, h, n] = [this.x, this.y, this.h, this.n];
        let b = this.bottom_edge;

        // Ensure n >= 1
        if (n < 1) {
            n = 1;
            this.n = 1;
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
        // regularPolygon(corners, radius, h, side) - pass h = y/2.0
        let [r, hp, side] = this.regularPolygon(2 * n + 2, null, y / 2.0, null);
        let lx;
        if (n % 2) {
            lx = x - 2 * hp + side;
        } else {
            lx = x - 2 * r + side;
        }

        // Deep copy the finger joint settings
        let fingerJointSettings = this.edges["f"].settings.clone ? 
            this.edges["f"].settings.clone() : 
            Object.assign(Object.create(Object.getPrototypeOf(this.edges["f"].settings)), this.edges["f"].settings);
        // setValues(thickness, relative, kwargs) - pass angle in kwargs
        fingerJointSettings.setValues(this.thickness, true, {angle: (360.0 / (2 * (n + 1)))});
        // edgeObjects(boxes, chars, add) - chars is a string, not object
        fingerJointSettings.edgeObjects(this, "gGH");
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
        let fingers = (this.top === "angled lid2" || this.top === "angled hole");

        let cnt = 0;
        for (let j = 0; j < 2; j++) {
            cnt += 1;
            if (j === 0 || n % 2) {
                this.rectangularWall(lx, h, 
                    fingers ? (b + "GfG") : (b + "GeG"),
                    {move: "right", label: `wall ${cnt}`});
            } else {
                this.rectangularWall(lx, h,
                    fingers ? (b + "gfg") : (b + "geg"),
                    {move: "right", label: `wall ${cnt}`});
            }
            for (let i = 0; i < n; i++) {
                cnt += 1;
                // reverse for second half if even n
                if ((i + j * ((n + 1) % 2)) % 2) {
                    this.rectangularWall(side, h,
                        fingers ? (b + "GfG") : (b + "GeG"),
                        {move: "right", label: `wall ${cnt}`});
                } else {
                    this.rectangularWall(side, h,
                        fingers ? (b + "gfg") : (b + "geg"),
                        {move: "right", label: `wall ${cnt}`});
                }
            }
        }
    }

}

export { AngledBox };