import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class FingerHoleEdgeSettings extends Boxes {
}

export { FingerHoleEdgeSettings };
class FingerHoleEdge extends Boxes {
    __call__(length) {
        let width = Math.min((this.settings.absolute_width + (length * this.settings.relative_width)), length);
        let depth = Math.min((this.settings.absolute_depth + (this.settings.wallheight * this.settings.relative_depth)), this.settings.wallheight);
        let r = Math.min((width / 2), depth, this.settings.radius);
        if ((depth < 1e-09 || width < 1e-09)) {
            this.boxes.edge(length, {tabs: 2});
            return;
        }
        let poly = [[((length - width) / 2), 1], 90, (depth - r), [-90, r]];
        this.polyline(...poly, [(width - (2 * r)), 1], ...reversed(poly));
    }

}

export { FingerHoleEdge };
class TypeTray extends _TopEdge {
    constructor() {
        super();
        this.addTopEdgeSettings({fingerjoint: {}, roundedtriangle: {}});
        this.addSettingsArgs(LidSettings);
        // this.buildArgParser("sx", "sy", "h", "hi", "outside", "bottom_edge", "top_edge");
        this.argparser.add_argument("--back_height", {action: "store", type: "float", default: 0.0, help: "additional height of the back wall - e top edge only"});
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 0.0, help: "radius for strengthening side walls with back_height"});
        this.argparser.add_argument("--gripheight", {action: "store", type: "float", default: 30, dest: "gh", help: "height of the grip hole in mm"});
        this.argparser.add_argument("--gripwidth", {action: "store", type: "float", default: 70, dest: "gw", help: "width of th grip hole in mm (zero for no hole)"});
        this.argparser.add_argument("--handle", {type: boolarg, default: false, help: "add handle to the bottom (changes bottom edge in the front)"});
        this.argparser.add_argument("--fingerholes", {action: "store", type: "str", default: "none", choices: ["none", "inside-only", "front", "back", "front-and-back"], help: "Decide which outer walls should have finger hole, too"});
        let label_group = this.argparser.add_argument_group("Compartment Labels");
        label_group.add_argument("--text_size", {action: "store", type: "int", default: 12, help: "Textsize in mm for the traycontent"});
        label_group.add_argument("--text_alignment", {action: "store", type: "str", default: "left", choices: ["left", "center", "right"], help: "Text Alignment"});
        label_group.add_argument("--text_distance_x", {action: "store", type: "float", default: 2.0, help: "Distance in X from edge of tray in mm. Has no effect when text is centered."});
        label_group.add_argument("--text_distance_y", {action: "store", type: "float", default: 2.0, help: "Distance in Y from edge of tray in mm."});
        label_group.add_argument("--text_at_front", {action: "store", type: boolarg, default: false, help: "Start compartement labels on the front"});
        if (this.UI === "web") {
            label_group.add_argument("--label_text", {action: "store", type: "str", default: "\n", help: "Every line is the text for one compartment. Beginning with front left"});
        }
        else {
            label_group.add_argument("--label_file", {action: "store", type: "str", help: "file with compartment labels. One line per compartment"});
        }
        this.addSettingsArgs(FingerHoleEdgeSettings);
    }

    fingerholedepth() {
        if (this.fingerhole === "custom") {
            return this.fingerhole_depth;
        }
        else {
            if (this.fingerhole === "regular") {
                let a = (this.h / 4);
                if (a < 35) {
                    return a;
                }
                else {
                    return 35;
                }
            }
            else {
                if (this.fingerhole === "deep") {
                    return ((this.h - this.thickness) - 10);
                }
                else {
                    if (this.fingerhole === "none") {
                        return 0;
                    }
                }
            }
        }
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
            this.fingerHolesAt(posx, 0, Math.min(this.h, this.hi));
        }
    }

    yHoles() {
        let posy = (-0.5 * this.thickness);
        for (let y of this.sy.slice(0, -1)) {
            posy += (y + this.thickness);
            this.fingerHolesAt(posy, 0, Math.min(this.h, this.hi));
        }
    }

    gripHole() {
        if (!this.gw) {
            return;
        }
        let x = (this.sx.reduce((a, b) => a + b, 0) + (this.thickness * (this.sx.length - 1)));
        let r = (Math.min(this.gw, this.gh) / 2.0);
        this.rectangularHole((x / 2.0), (this.gh * 1.5), this.gw, this.gh, r);
    }

    textCB() {
        let textsize = this.text_size;
        let texty = ((this.hi - textsize) - this.text_distance_y);
        if (this.text_alignment === "center") {
            texty -= this.fingerholedepth;
        }
        let textdistance = (this.sx[0] + this.thickness);
        for (let n = 0; n < this.sx.length; n += 1) {
            if (this.textnumber >= this.textcontent.length) {
            }
            let textx = (n * (this.sx[0] + this.thickness));
            if (this.text_alignment === "left") {
                textx += this.text_distance_x;
            }
            else {
                if (this.text_alignment === "center") {
                    textx += (this.sx[0] / 2);
                }
                else {
                    if (this.text_alignment === "right") {
                        textx += (this.sx[0] - this.text_distance_x);
                    }
                }
            }
            this.text(this.textcontent[this.textnumber], textx, texty, 0, {align: this.text_alignment, fontsize: textsize, color: Color.ETCHING});
            this.textnumber += 1;
        }
    }

    render() {
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
        let s = FingerHoleEdgeSettings(this.thickness, true);
        s.wallheight = (this.fingerholes === "none" ? 0 : this.hi);
        let p = FingerHoleEdge(this, s);
        this.addPart(p);
        let b = this.bottom_edge;
        let tl;
        let tb;
        let tr;
        let tf;
        [tl, tb, tr, tf] = this.topEdges(this.top_edge);
        this.closedtop = "fFh\u0160".includes(this.top_edge);
        let ignore_widths = [1, 6];
        if ("ik".includes(this.top_edge)) {
            this.edges[this.top_edge].settings.style = "flush_inset";
            ignore_widths = [1, 3, 4, 6];
        }
        let bh = (this.top_edge === "e" ? this.back_height : 0.0);
        this.textcontent = [];
        if (hasattr(this, "label_text")) {
            this.textcontent = this.label_text.split("\\n");
        }
        else {
            if (this.label_file) {
                // with open {
                this.textcontent = f.readlines();
                // }
            }
        }
        this.textnumber = 0;
        this.ctx.save();
        if (b !== "e") {
            if (this.handle) {
                this.rectangularWall(x, y, "ffYf", {callback: [this.xSlots, this.ySlots], move: "up", label: "bottom"});
            }
            else {
                this.rectangularWall(x, y, "ffff", {callback: [this.xSlots, this.ySlots], move: "up", label: "bottom"});
            }
        }
        if (this.text_at_front) {
            let frontCBs = [() => [this.textCB(), this.mirrorX()], null, this.gripHole];
        }
        else {
            frontCBs = [this.mirrorX(this.xHoles, x), null, this.gripHole];
        }
        if ((!this.closedtop && ["front", "front-and-back"].includes(this.fingerholes))) {
            tf = new edges.SlottedEdge(this, this.sx.slice().reverse(), "A");
        }
        if (bh) {
            this.rectangularWall(x, h, [(this.handle ? "f" : b), "f", tf, "f"], {callback: frontCBs, move: "up", label: "front"});
        }
        else {
            this.rectangularWall(x, h, [(this.handle ? "f" : b), "F", tf, "F"], {callback: frontCBs, ignore_widths: (this.handle ? [] : ignore_widths), move: "up", label: "front"});
        }
        let be = (b !== "e" ? "f" : "e");
        let le = (this.hi <= this.h ? "f" : new edges.CompoundEdge(this, "ef", [(this.hi - this.h), this.h]));
        let re = (this.hi <= this.h ? "f" : new edges.CompoundEdge(this, "fe", [this.h, (this.hi - this.h)]));
        for (let i = 0; i < (this.sy.length - 1); i += 1) {
            let e = [new edges.SlottedEdge(this, this.sx, be), re, new edges.SlottedEdge(this, this.sx.slice().reverse(), "A"), le];
            if ((this.closedtop && sameh)) {
                e = [new edges.SlottedEdge(this, this.sx, be), re, new edges.SlottedEdge(this, this.sx.slice().reverse(), "f"), le];
            }
            this.rectangularWall(x, hi, e, {move: "up", callback: [this.textCB], label: `inner x ${i + 1}`});
        }
        if ((!this.closedtop && ["back", "front-and-back"].includes(this.fingerholes))) {
            tb = new edges.SlottedEdge(this, this.sx, "A");
        }
        if (bh) {
            this.rectangularWall(x, (h + bh), [b, "f", tb, "f"], {callback: [this.xHoles], ignore_widths: [], move: "up", label: "back"});
        }
        else {
            this.rectangularWall(x, h, [b, "F", tb, "F"], {callback: [this.xHoles], ignore_widths: ignore_widths, move: "up", label: "back"});
        }
        if ((this.closedtop && sameh)) {
            e = (this.top_edge === "f" ? "FFFF" : "ffff");
            this.rectangularWall(x, y, e, {callback: [this.xSlots, this.ySlots], move: "up", label: "top"});
        }
        else {
            this.drawLid(x, y, this.top_edge);
        }
        this.lid(x, y, this.top_edge);
        this.ctx.restore();
        this.rectangularWall(x, hi, "ffff", {move: "right only"});
        if (bh) {
            this.trapezoidSideWall(y, h, (h + bh), [b, "h", "e", "h"], {radius: this.radius, callback: [this.yHoles], move: "up", label: "left side"});
            this.trapezoidSideWall(y, (h + bh), h, [b, "h", "e", "h"], {radius: this.radius, callback: [this.mirrorX(this.yHoles, y)], move: "up", label: "right side"});
        }
        else {
            this.rectangularWall(y, h, [b, "f", tl, "f"], {callback: [this.yHoles], ignore_widths: (this.handle ? [6] : [1, 6]), move: "up", label: "left side"});
            this.rectangularWall(y, h, [b, "f", tr, "f"], {callback: [this.mirrorX(this.yHoles, y)], ignore_widths: (this.handle ? [1] : [1, 6]), move: "up", label: "right side"});
        }
        for (let i = 0; i < (this.sx.length - 1); i += 1) {
            e = [new edges.SlottedEdge(this, this.sy, be), re, "e", le];
            if ((this.closedtop && sameh)) {
                e = [new edges.SlottedEdge(this, this.sy, be), re, new edges.SlottedEdge(this, this.sy.slice().reverse(), "f"), le];
            }
            this.rectangularWall(y, hi, e, {move: "up", label: `inner y ${i + 1}`});
        }
    }

}

export { TypeTray };