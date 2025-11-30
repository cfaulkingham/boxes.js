import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { _WallMountedBox  } from '../walledges.js';

class FrontEdge extends Boxes {
    __call__(length) {
        let ws = this.slot_width;
        let wt = this.tool_width;
        let ds = this.slot_depth;
        let r1 = Math.min(this.radius, (ds / 2), ((wt - ws) / 2));
        let r2 = Math.min(this.radius, (ws / 2));
        let w = (((wt - ws) / 2) - r1);
        let t = this.thickness;
        let d = Math.min((2 * t), ((wt - ws) / 4.0));
        this.edge(d);
        for (let i = 0; i < this.number; i += 1) {
            this.polyline(w, [90, r1], ((ds - r1) - r2), [-90, r2], (ws - (2 * r2)), [-90, r2], ((ds - r1) - r2), [90, r1], w);
        }
        this.edge(d);
    }

}

export { FrontEdge };
class WallSlottedHolder extends _WallMountedBox {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--slot_depth", {action: "store", type: "float", default: 50.0, help: "depth of slots from the front"});
        this.argparser.add_argument("--additional_depth", {action: "store", type: "float", default: 50.0, help: "depth behind the lots"});
        this.argparser.add_argument("--slot_width", {action: "store", type: "float", default: 5.0, help: "width of slots"});
        this.argparser.add_argument("--tool_width", {action: "store", type: "float", default: 35.0, help: "overall width for the tools"});
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 5.0, help: "radius of the slots at the front"});
        this.argparser.add_argument("--number", {action: "store", type: "int", default: 6, help: "number of tools/slots"});
        this.argparser.add_argument("--hooks", {action: "store", type: "str", default: "all", choices: ["all", "odds", "everythird"], help: "amount of hooks / braces"});
    }

    brace(i) {
        let n = this.number;
        if ([0, n].includes(i)) {
            return true;
        }
        if (this.hooks === "all") {
            return true;
        }
        else {
            if (this.hooks === "odds") {
                return !(i % 2);
            }
            else {
                if (this.hooks === "everythird") {
                    return !(i % 3);
                }
            }
        }
    }

    braces() {
        return /* unknown node GeneratorExp */.reduce((a, b) => a + b, 0);
    }

    backCB() {
        let n = this.number;
        let ws = this.slot_width;
        let wt = this.tool_width;
        let t = this.thickness;
        let d = Math.min((2 * t), ((wt - ws) / 4.0));
        this.wallHolesAt(d, 0, this.h, 90);
        this.wallHolesAt(((n * wt) + d), 0, this.h, 90);
        for (let i = 1; i < n; i += 1) {
            if (this.brace(i)) {
                this.wallHolesAt(((i * wt) + d), 0, this.h, 90);
            }
        }
    }

    topCB() {
        let n = this.number;
        let ws = this.slot_width;
        let wt = this.tool_width;
        let t = this.thickness;
        let l = (this.additional_depth + this.slot_depth);
        let d = Math.min((2 * t), ((wt - ws) / 4.0));
        this.fingerHolesAt(d, 0, l, 90);
        this.fingerHolesAt(((n * wt) + d), 0, l, 90);
        for (let i = 1; i < n; i += 1) {
            if (this.brace(i)) {
                this.fingerHolesAt(((i * wt) + d), 0, l, 90);
            }
        }
    }

    render() {
        this.generateWallEdges();
        let t = this.thickness;
        let l1;
        let l2;
        [l1, l2] = [this.additional_depth, this.slot_depth];
        let ws = this.slot_width;
        let wt = this.tool_width;
        let n = this.number;
        let d = Math.min((2 * t), ((wt - ws) / 4.0));
        this.rectangularWall(((n * wt) + (2 * d)), this.h, "eeee", {callback: [this.backCB], move: "up"});
        this.rectangularWall(((n * wt) + (2 * d)), (l1 + l2), [FrontEdge(this, null), "e", "e", "e"], {callback: [this.topCB], move: "up"});
        this.moveTo(0, t);
        this.rectangularTriangle((l1 + l2), this.h, "fbe", {r: (3 * t), num: this.braces()});
    }

}

export { WallSlottedHolder };