import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { _WallMountedBox  } from '../walledges.js';

class FrontEdge extends Boxes {
    __call__(length) {
        let td = this.tooldiameter;
        let rh = (this.holediameter / 2.0);
        let r = this.radius;
        let sw = this.slot_width;
        let a = (Math.sin(((r + (sw / 2)) / (r + rh))) * 180 / Math.PI);
        let l = (((td - sw) - (2 * r)) / 2);
        for (let i = 0; i < this.number; i += 1) {
            this.polyline(l, [(180 - a), r], 0, [(-360 + (2 * a)), rh], 0, [(180 - a), r], l);
        }
    }

}

export { FrontEdge };
class WallChiselHolder extends _WallMountedBox {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--tooldiameter", {action: "store", type: "float", default: 30.0, help: "diameter of the tool including space to grab"});
        this.argparser.add_argument("--holediameter", {action: "store", type: "float", default: 30.0, help: "diameter of the hole for the tool (handle should not fit through)"});
        this.argparser.add_argument("--slot_width", {action: "store", type: "float", default: 5.0, help: "width of slots"});
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 5.0, help: "radius at the slots"});
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
        let rt = this.holediameter;
        let wt = this.tooldiameter;
        let t = this.thickness;
        let d = Math.min((2 * t), ((wt - rt) / 4.0));
        this.wallHolesAt(d, 0, this.h, 90);
        this.wallHolesAt(((n * wt) - d), 0, this.h, 90);
        for (let i = 1; i < n; i += 1) {
            if (this.brace(i)) {
                this.wallHolesAt((i * wt), 0, this.h, 90);
            }
        }
    }

    topCB() {
        let n = this.number;
        let rt = this.holediameter;
        let wt = this.tooldiameter;
        let t = this.thickness;
        let l = this.depth;
        let d = Math.min((2 * t), ((wt - rt) / 4.0));
        this.fingerHolesAt(d, 0, l, 90);
        this.fingerHolesAt(((n * wt) - d), 0, l, 90);
        for (let i = 1; i < n; i += 1) {
            if (this.brace(i)) {
                this.fingerHolesAt((i * wt), 0, l, 90);
            }
        }
    }

    render() {
        this.generateWallEdges();
        let t = this.thickness;
        let wt = this.tooldiameter;
        let n = this.number;
        this.rectangularWall((n * wt), this.h, "eeee", {callback: [this.backCB], move: "up"});
        this.rectangularWall((n * wt), depth, [FrontEdge(this, null), "e", "e", "e"], {callback: [this.topCB], move: "up"});
        this.moveTo(0, t);
        this.rectangularTriangle(depth, this.h, "fbe", {r: (3 * t), num: this.braces()});
    }

}

export { WallChiselHolder };