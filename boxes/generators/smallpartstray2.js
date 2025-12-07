import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class TopEdge extends Boxes {
    constructor(boxes, lengths, h) {
        super();
        this.lengths = lengths;
        this.h = h;
    }

    __call__(length) {
        let h = this.h;
        let t = this.boxes.thickness;
        let t2 = (t * (2 ** 0.5));
        let slot = ((h / (2 ** 0.5)) + (t / 2));
        this.polyline(0, 90, t2, -45, (slot - t), -90, t, -90, slot, 135, (this.lengths[0] - (t2 / 2)));
        for (let l of this.lengths.slice(1)) {
            this.polyline(0, 45, t, 45, ((h / 2) - (t2 / 2)), -90, t, -90, ((h / 2) - t2), 135, (slot - t), -90, t, -90, slot, 135, (l - (t2 / 2)));
        }
        this.polyline((t2 / 2));
    }

}

export { TopEdge };
class SmallPartsTray2 extends _TopEdge {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 1.0});
        this.addSettingsArgs(LidSettings);
        // this.buildArgParser("sx", "sy", "hi", "outside");
        this.argparser.add_argument("--back_height", {action: "store", type: "float", default: 0.0, help: "additional height of the back wall - e top edge only"});
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 0.0, help: "radius for strengthening side walls with back_height"});
        this.argparser.add_argument("--handle", {type: boolarg, default: false, help: "add handle to the bottom (changes bottom edge in the front)"});
    }

    fingerHolesCB(sections, height) {
        const CB = () => {
            let posx = (-0.5 * this.thickness);
            for (let x of sections.slice(0, -1)) {
                posx += (x + this.thickness);
                this.fingerHolesAt(posx, 0, height);
            }
        };

        return CB;
    }

    fingerHoleLineCB(posx, posy, sections) {
        const CB = () => {
            this.moveTo(posx, posy, 90);
            for (let l of sections) {
                this.fingerHolesAt(0, 0, l, 0);
                this.moveTo((l + this.thickness));
            }
        };

        return CB;
    }

    xHoles() {
        let posx = (-0.5 * this.thickness);
        for (let x of this.sx.slice(0, -1)) {
            posx += (x + this.thickness);
            this.fingerHolesAt(posx, 0, this.hi);
        }
    }

    yHoles() {
        let t = this.thickness;
        let posy = (-0.5 * this.thickness);
        for (let y of this.sy.slice(0, -1)) {
            posy += (y + this.thickness);
            this.fingerHolesAt(posy, 0, (this.hi - (t * (2 ** 0.5))));
            this.ctx.save();
            this.moveTo((posy - (0.5 * t)), this.hi, 135);
            this.fingerHolesAt((-0.5 * t), 0, ((this.hi * (2 ** 0.5)) + (t / 2)));
            this.ctx.restore();
        }
        this.moveTo(((posy + this.sy[-1]) + (0.5 * t)), this.hi, 135);
        this.fingerHolesAt((-0.5 * t), 0, ((this.hi * (2 ** 0.5)) + (t / 2)));
    }

    render() {
        this.top_edge = "e";
        this.bottom_edge = "F";
        if (this.outside) {
            this.sx = this.adjustSize(this.sx);
            this.sy = this.adjustSize(this.sy);
            this.h = this.adjustSize(this.h);
            if (this.hi) {
                this.hi = this.adjustSize(this.hi);
            }
        }
        let x = (this.sx.reduce((a, b) => a + b, 0) + (this.thickness * (this.sx.length - 1)));
        let y = (this.sy.reduce((a, b) => a + b, 0) + (this.thickness * (this.sy.length - 1)));
        let h = this.h;
        let sameh = !this.hi;
        let t = this.thickness;
        let b = this.bottom_edge;
        let tl;
        let tb;
        let tr;
        let tf;
        [tl, tb, tr, tf] = this.topEdges(this.top_edge);
        this.closedtop = "fFhŠ".includes(this.top_edge);
        let bh = (this.top_edge === "e" ? this.back_height : 0.0);
        this.ctx.save();
        if (bh) {
            this.rectangularWall(x, (h + bh), [b, "f", tb, "f"], {callback: [this.xHoles], move: "up", label: "back"});
            this.rectangularWall(x, h, [(this.handle ? "f" : b), "f", "e", "f"], {callback: [this.fingerHolesCB(this.sx.slice(0,  /* step -1 ignored */), h)], move: "up", label: "front"});
        }
        else {
            this.rectangularWall(x, h, [b, "F", tb, "F"], {callback: [this.xHoles], move: "up", label: "back"});
            this.rectangularWall(x, (hi - (t * (2 ** 0.5))), [(this.handle ? "f" : b), "F", "e", "F"], {callback: [this.fingerHolesCB(this.sx.slice(0,  /* step -1 ignored */), (hi - (t * (2 ** 0.5))))], move: "up", label: "front"});
        }
        let t2 = (t * (2 ** 0.5));
        let dy = (hi + (t2 / 2));
        let slot = (t + (t2 / 2));
        let floors = [(((this.sy[0] - hi) - slot) + t2), slot];
        this.rectangularWall(x, floors[0], "ffef", {callback: [this.fingerHolesCB(this.sx, floors[0])], move: "up", label: "floor back side"});
        for (let y_ of this.sy.slice(1)) {
            this.rectangularWall(x, ((y_ - slot) + t), "efef", {callback: [this.fingerHolesCB(this.sx, ((y_ - slot) + t)), this.fingerHoleLineCB(((hi - t2) + (t / 2)), 0, this.sx.slice(0,  /* step -1 ignored */))], move: "up", label: "floor"});
            floors.extend([((y_ - slot) + t), slot]);
        }
        this.rectangularWall(x, (hi - t2), (this.handle ? "efYf" : "efff"), {callback: [this.fingerHolesCB(this.sx, (hi - t2))], move: "up", label: "floor front side"});
        floors.append((hi - t2));
        let be = (b !== "e" ? "f" : "e");
        for (let i = 0; i < (this.sy.length - 1); i += 1) {
            let e = [new edges.SlottedEdge(this, this.sx, be), "f", new edges.SlottedEdge(this, this.sx.slice(0,  /* step -1 ignored */), "e"), "f"];
            this.rectangularWall(x, (hi - t2), e, {move: "up", label: `inner wall ${i}`});
        }
        for (let i of this.sy) {
            this.rectangularWall(x, ((hi * (2 ** 0.5)) + (t / 2)), [new edges.SlottedEdge(this, this.sx, "e"), "f", new edges.SlottedEdge(this, this.sx.slice(0,  /* step -1 ignored */), "e"), "f"], {move: "up", label: "slope"});
        }
        this.ctx.restore();
        this.rectangularWall(x, hi, "ffff", {move: "right only"});
        for (let move of ["up", "up mirror"]) {
            if (bh) {
                this.trapezoidSideWall(y, (h + bh), (hi - (t * (2 ** 0.5))), [new edges.CompoundEdge(this, (("FE".repeat(this.sy.length)) + "F"), floors), "h", "e", "h"], {radius: this.radius, callback: [this.yHoles], move: move, label: "side"});
            }
            else {
                this.rectangularWall(y, h, [new edges.CompoundEdge(this, (("FE".repeat(this.sy.length)) + "F"), floors), new edges.CompoundEdge(this, "fE", [(hi - (t * (2 ** 0.5))), ((h - hi) + (t * (2 ** 0.5)))]), tl, "f"], {callback: [this.yHoles], move: move, label: "side"});
            }
        }
        for (let i = 0; i < (this.sx.length - 1); i += 1) {
            e = [new edges.CompoundEdge(this, (("fE".repeat(this.sy.length)) + "f"), floors), new edges.CompoundEdge(this, "fe", [(hi - (t * (2 ** 0.5))), (t * (2 ** 0.5))]), TopEdge(this, this.sy.slice().reverse(), hi), "f"];
            this.rectangularWall(y, hi, e, {move: "up", label: `divider ${i}`});
        }
    }

}

export { SmallPartsTray2 };