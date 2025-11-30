import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { _WallMountedBox  } from '../walledges.js';

class WallTypeTray extends _WallMountedBox {
    constructor() {
        super();
        this.addSettingsArgs(edges.StackableSettings);
        // this.buildArgParser("sx", "sy", "h", "hi", "outside", "bottom_edge");
        this.argparser.add_argument("--back_height", {action: "store", type: "float", default: 0.0, help: "additional height of the back wall"});
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 0.0, help: "radius for strengthening walls with the hooks"});
    }

    xSlots() {
        let posx = (-0.5 * this.thickness);
        for (let x of this.sx.slice(0, -1)) {
            posx += (x + this.thickness);
            let posy = 0;
            for (let y of this.sy) {
                this.fingerHolesAt(posx, posy, y);
                posy += (y + this.thickness);
            }
        }
    }

    ySlots() {
        let posy = (-0.5 * this.thickness);
        for (let y of this.sy.slice(0, -1)) {
            posy += (y + this.thickness);
            let posx = 0;
            for (let x of reversed(this.sx)) {
                this.fingerHolesAt(posy, posx, x);
                posx += (x + this.thickness);
            }
        }
    }

    xHoles() {
        let posx = (-0.5 * this.thickness);
        for (let x of this.sx.slice(0, -1)) {
            posx += (x + this.thickness);
            this.fingerHolesAt(posx, 0, this.hi);
        }
    }

    yHoles() {
        let posy = (-0.5 * this.thickness);
        for (let y of this.sy.slice(0, -1)) {
            posy += (y + this.thickness);
            this.fingerHolesAt(posy, 0, this.hi);
        }
    }

    render() {
        this.generateWallEdges();
        let b = this.bottom_edge;
        if (this.outside) {
            this.sx = this.adjustSize(this.sx);
            this.sy = this.adjustSize(this.sy);
            this.h = this.adjustSize(this.h, b);
            if (this.hi) {
                this.hi = this.adjustSize(this.hi, b);
            }
        }
        let x = (this.sx.reduce((a, b) => a + b, 0) + (this.thickness * (this.sx.length - 1)));
        let y = (this.sy.reduce((a, b) => a + b, 0) + (this.thickness * (this.sy.length - 1)));
        let h = this.h;
        let bh = this.back_height;
        let sameh = !this.hi;
        let t = this.thickness;
        this.ctx.save();
        this.rectangularWall(x, h, [b, "f", "e", "f"], {callback: [this.xHoles], move: "up"});
        this.rectangularWall(x, (h + bh), [b, "C", "e", "c"], {callback: [this.mirrorX(this.xHoles, x)], move: "up"});
        if (b !== "e") {
            this.rectangularWall(x, y, "ffff", {callback: [this.xSlots, this.ySlots], move: "up"});
        }
        let be = (b !== "e" ? "f" : "e");
        for (let i = 0; i < (this.sy.length - 1); i += 1) {
            let e = [edges.SlottedEdge(this, this.sx, be), "f", edges.SlottedEdge(this, this.sx.slice(0,  /* step -1 ignored */), "e"), "f"];
            this.rectangularWall(x, hi, e, {move: "up"});
        }
        this.trapezoidSideWall(y, h, (h + bh), [b, "B", "e", "h"], {radius: this.radius, callback: [this.yHoles], move: "up"});
        this.moveTo(0, 8);
        this.trapezoidSideWall(y, (h + bh), h, [b, "h", "e", "b"], {radius: this.radius, callback: [this.mirrorX(this.yHoles, y)], move: "up"});
        this.moveTo(0, 8);
        for (let i = 0; i < (this.sx.length - 1); i += 1) {
            e = [edges.SlottedEdge(this, this.sy, be), "f", "e", "f"];
            this.rectangularWall(y, hi, e, {move: "up"});
        }
    }

}

export { WallTypeTray };