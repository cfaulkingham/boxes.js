import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class DrillBox extends _TopEdge {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {space: 3, finger: 3, surroundingspaces: 1});
        this.addSettingsArgs(edges.RoundedTriangleEdgeSettings, {outset: 1});
        this.addSettingsArgs(edges.StackableSettings);
        this.addSettingsArgs(edges.MountingSettings);
        this.addSettingsArgs(LidSettings);
        this.argparser.add_argument("--top_edge", {action: "store", type: ArgparseEdgeType("eStG"), choices: list("eStG"), default: "e", help: "edge type for top edge"});
        // this.buildArgParser();
        this.argparser.add_argument("--holes", {action: "store", type: "int", default: 3, help: "Number of holes for each size"});
        this.argparser.add_argument("--firsthole", {action: "store", type: "float", default: 1.0, help: "Smallest hole"});
        this.argparser.add_argument("--holeincrement", {action: "store", type: "float", default: 0.5, help: "increment between holes"});
    }

    sideholes(l) {
        let t = this.thickness;
        let h = (-0.5 * t);
        for (let d of this.sh.slice(0, -1)) {
            h += (d + t);
            this.fingerHolesAt(0, h, l, {angle: 0});
        }
    }

    drillholes(description) {
        let y = 0;
        let d = this.firsthole;
        for (let dy of this.sy) {
            let x = 0;
            for (let dx of this.sx) {
                let iy = (dy / this.holes);
                for (let k = 0; k < this.holes; k += 1) {
                    this.hole((x + (dx / 2)), (y + ((k + 0.5) * iy)), {d: (d + 0.05)});
                }
                if (description) {
                    this.rectangularHole((x + (dx / 2)), (y + (dy / 2)), (dx - 2), (dy - 2), {color: Color.ETCHING});
                    this.text(("%.1f" % d), (x + 2), (y + 2), 270, {align: "right", fontsize: 6, color: Color.ETCHING});
                }
                d += this.holeincrement;
                x += dx;
            }
            y += dy;
        }
    }

    render() {
        let x = this.sx.reduce((a, b) => a + b, 0);
        let y = this.sy.reduce((a, b) => a + b, 0);
        let h = (this.sh.reduce((a, b) => a + b, 0) + (this.thickness * (this.sh.length - 1)));
        let b = this.bottom_edge;
        let t1;
        let t2;
        let t3;
        let t4;
        [t1, t2, t3, t4] = this.topEdges(this.top_edge);
        this.rectangularWall(x, h, [b, "f", t1, "F"], {ignore_widths: [1, 6], callback: [() => this.sideholes(x)], move: "right"});
        this.rectangularWall(y, h, [b, "f", t2, "F"], {callback: [() => this.sideholes(y)], ignore_widths: [1, 6], move: "up"});
        this.rectangularWall(y, h, [b, "f", t3, "F"], {callback: [() => this.sideholes(y)], ignore_widths: [1, 6]});
        this.rectangularWall(x, h, [b, "f", t4, "F"], {ignore_widths: [1, 6], callback: [() => this.sideholes(x)], move: "left up"});
        if (b !== "e") {
            this.rectangularWall(x, y, "ffff", {move: "right"});
        }
        for (let d of this.sh.slice(0, -2)) {
            this.rectangularWall(x, y, "ffff", {callback: [this.drillholes], move: "right"});
        }
        this.rectangularWall(x, y, "ffff", {callback: [() => this.drillholes()], move: "right"});
        this.lid(x, y, this.top_edge);
    }

}

export { DrillBox };