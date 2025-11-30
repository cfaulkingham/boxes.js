import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class StorageShelf extends _TopEdge {
    constructor() {
        super();
        this.addTopEdgeSettings({fingerjoint: /* unknown node Dict */, roundedtriangle: /* unknown node Dict */});
        // this.buildArgParser("x", "sy", "sh", "outside", "bottom_edge", "top_edge");
        this.argparser.add_argument("--retainer", {action: "store", type: "float", default: 0.0, help: "height of retaining wall at the front edges"});
        this.argparser.add_argument("--retainer_hole_edge", {action: "store", type: boolarg, default: false, help: "use finger hole edge for retainer walls"});
    }

    ySlots() {
        let posy = (-0.5 * this.thickness);
        let h = (this.sh.reduce((a, b) => a + b, 0) + (this.thickness * (this.sh.length - 1)));
        for (let y of this.sy.slice(0, -1)) {
            posy += (y + this.thickness);
            this.fingerHolesAt(posy, 0, h, 90);
        }
    }

    hSlots() {
        let posh = (-0.5 * this.thickness);
        for (let h of this.sh.slice(0, -1)) {
            posh += (h + this.thickness);
            let posy = 0;
            for (let y of reversed(this.sy)) {
                this.fingerHolesAt(posh, posy, y);
                posy += (y + this.thickness);
            }
        }
    }

    yHoles() {
        let posy = (-0.5 * this.thickness);
        for (let y of this.sy.slice(0, -1)) {
            posy += (y + this.thickness);
            this.fingerHolesAt(posy, 0, this.x);
        }
    }

    hHoles() {
        let posh = (-0.5 * this.thickness);
        for (let h of this.sh.slice(0, -1)) {
            posh += (h + this.thickness);
            this.fingerHolesAt(posh, 0, this.x);
        }
    }

    render() {
        if (this.outside) {
            this.sy = this.adjustSize(this.sy);
            this.sh = this.adjustSize(this.sh, this.top_edge, this.bottom_edge);
            this.x = this.adjustSize(this.x);
        }
        let y = (this.sy.reduce((a, b) => a + b, 0) + (this.thickness * (this.sy.length - 1)));
        let h = (this.sh.reduce((a, b) => a + b, 0) + (this.thickness * (this.sh.length - 1)));
        let x = this.x;
        let t = this.thickness;
        let b = this.bottom_edge;
        let t1;
        let t2;
        let t3;
        let t4;
        [t1, t2, t3, t4] = this.topEdges(this.top_edge);
        if (this.top_edge === "t") {
            [t1, t2, t3, t4] = [t2, t1, t4, t3];
        }
        this.closedtop = "fFhŠY".includes(this.top_edge);
        this.ctx.save();
        this.rectangularWall(x, h, [b, "F", t1, "e"], {callback: [null, this.hHoles], move: "up", label: "left"});
        this.rectangularWall(x, h, [b, "e", t3, "F"], {callback: [null, this.hHoles], move: "up", label: "right"});
        if (b !== "e") {
            let e = "fffe";
            if (this.retainer) {
                e = "ffff";
            }
            this.rectangularWall(x, y, e, {callback: [null, this.yHoles], move: "up", label: "bottom"});
        }
        let be = (b !== "e" ? "f" : "e");
        for (let i = 0; i < (this.sh.length - 1); i += 1) {
            e = ["f", edges.SlottedEdge(this, this.sy.slice(0,  /* step -1 ignored */), "f"), "f", "e"];
            if (this.retainer) {
            }
            this.rectangularWall(x, y, e, {move: "up", label: ("inner horizontal " + str((i + 1)))});
        }
        if (this.closedtop) {
            e = (this.top_edge === "f" ? "FFFe" : "fffe");
            this.rectangularWall(x, y, e, {callback: [null, this.yHoles], move: "up", label: "top"});
        }
        else {
            this.drawLid(x, y, this.top_edge);
        }
        this.ctx.restore();
        this.rectangularWall(x, h, "ffff", {move: "right only", label: "invisible"});
        this.rectangularWall(y, h, [b, "f", t2, "f"], {callback: [this.ySlots, this.hSlots], move: "up", label: "back"});
        for (let i = 0; i < (this.sy.length - 1); i += 1) {
            e = [be, edges.SlottedEdge(this, this.sh, "e"), "e", "f"];
            if (this.closedtop) {
                e = [be, edges.SlottedEdge(this, this.sh, "e"), "f", "f"];
            }
            this.rectangularWall(x, h, e, {move: "up", label: ("inner vertical " + str((i + 1)))});
        }
        if (this.retainer) {
            for (let i = 0; i < this.sh.length; i += 1) {
                e = "FEeE";
                if ((this.retainer_hole_edge || (i === 0 && b === "h"))) {
                    e = "hEeE";
                }
                this.rectangularWall(y, this.retainer, e, {move: "up", label: ("retainer " + str((i + 1)))});
            }
        }
    }

}

export { StorageShelf };