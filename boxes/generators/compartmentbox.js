import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { TypeTray  } from './typetray.js';

class CompartmentBox extends TypeTray {
    constructor() {
        super();
        this.addSettingsArgs(edges.StackableSettings);
        // this.buildArgParser("sx", "sy", "h", "outside", "bottom_edge");
        this.argparser.add_argument("--handle", {action: "store", type: "str", default: "lip", choices: /* unknown node Set */, help: "how to grab the lid to remove"});
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 10, dest: "radius", help: "radius of the grip hole in mm"});
        this.argparser.add_argument("--holes", {action: "store", type: "str", default: "70", help: "width of hole(s) in percentage of maximum hole width"});
        this.argparser.add_argument("--margin_t", {action: "store", type: "float", default: 0.1, dest: "margin_vertical", help: "vertical margin for sliding lid (multiples of thickness)"});
        this.argparser.add_argument("--margin_s", {action: "store", type: "float", default: 0.05, dest: "margin_side", help: "margin to add at both sides of sliding lid (multiples of thickness)"});
        this.argparser.add_argument("--split_lip", {action: "store", type: boolarg, default: true, help: "create two strips to reduce waste material"});
    }

    render() {
        let t = this.thickness;
        let k = this.burn;
        let b = this.bottom_edge;
        let stackable = b === "s";
        let tside;
        let tback;
        [tside, tback] = (stackable ? ["Š", "S"] : ["F", "E"]);
        let margin_side = this.margin_side;
        let margin_vertical = (this.margin_vertical * t);
        if (margin_vertical < 0) {
            ValueError("vertical margin can not be negative")
        }
        if (margin_side < 0) {
            ValueError("side margin can not be negative")
        }
        let split_lip = this.split_lip;
        if (!split_lip) {
            tback = tside;
        }
        if (this.outside) {
            this.sx = this.adjustSize(this.sx);
            this.sy = this.adjustSize(this.sy);
            this.h = ((this.adjustSize(this.h, b, tside) - (1 * t)) - margin_vertical);
        }
        this.hi = this.h;
        let x = (this.sx.reduce((a, b) => a + b, 0) + (this.thickness * (this.sx.length - 1)));
        let y = (this.sy.reduce((a, b) => a + b, 0) + (this.thickness * (this.sy.length - 1)));
        let h = this.h;
        this.ctx.save();
        let hb = ((h + t) + margin_vertical);
        if (stackable) {
            hb += (this.edges["S"].settings.holedistance + (split_lip ? t : -t));
        }
        this.rectangularWall(x, hb, [b, "F", tback, "F"], {callback: [this.xHoles], ignore_widths: [1, 2, 5, 6], move: "up", label: "back"});
        this.rectangularWall(x, h, [b, "F", "e", "F"], {callback: [this.mirrorX(this.xHoles, x)], ignore_widths: [1, 6], move: "up", label: "front"});
        if (b !== "e") {
            this.rectangularWall(x, y, "ffff", {callback: [this.xSlots, this.ySlots], move: "up", label: "bottom"});
        }
        let be = (b !== "e" ? "f" : "e");
        for (let i = 0; i < (this.sy.length - 1); i += 1) {
            let e = [edges.SlottedEdge(this, this.sx, be), "f", edges.SlottedEdge(this, this.sx.slice(0,  /* step -1 ignored */), "e"), "f"];
            this.rectangularWall(x, h, e, {move: "up", label: /* unknown node JoinedStr */});
        }
        let handle = this.handle;
        let x_compensated = (x - ((2 * margin_side) * t));
        if (handle === "lip") {
            let lip_height = ((stackable ? 0 : t) + (margin_vertical / 2));
            if (stackable) {
                lip_height += this.edges["S"].settings.holedistance;
                let s = this.edges["S"].settings;
                s.setValues(this.thickness, {width: ((this.edges["S"].settings.width / this.thickness) - margin_side)});
                s.edgeObjects(this, {chars: "aA"});
            }
            this.rectangularWall(x_compensated, y, "feee", {move: "up", label: "lid"});
            this.rectangularWall(x_compensated, lip_height, (("Fe" + (stackable ? "A" : "e")) + "e"), {move: "up", label: "lid lip"});
        }
        if (handle === "hole") {
            this.rectangularWall(x_compensated, (y + t), {move: "up", label: "lid", callback: [this.gripHole]});
        }
        if (handle === "none") {
            this.rectangularWall(x_compensated, (y + t), {move: "up", label: "lid"});
        }
        this.ctx.restore();
        this.rectangularWall(x, h, "ffff", {move: "right only"});
        let f = new edges.CompoundEdge(this, "fE", [(h + this.edges[b].startwidth()), (t + margin_vertical)]);
        this.rectangularWall(y, ((h + t) + margin_vertical), [b, f, tside, "f"], {callback: [this.yHoles], ignore_widths: [1, 5, 6], move: "up", label: "left side"});
        this.rectangularWall(y, ((h + t) + margin_vertical), [b, f, tside, "f"], {callback: [this.yHoles], ignore_widths: [1, 5, 6], move: "mirror up", label: "right side"});
        for (let i = 0; i < (this.sx.length - 1); i += 1) {
            e = [edges.SlottedEdge(this, this.sy, be), "f", "e", "f"];
            this.rectangularWall(y, h, e, {move: "up", label: /* unknown node JoinedStr */});
        }
        let lip_front_edge = (this.handle === "lip" ? "e" : "E");
        if (split_lip) {
            this.rectangularWall(y, t, ("eef" + lip_front_edge), {move: "up", label: "Lip Left"});
            this.rectangularWall(y, t, ("eef" + lip_front_edge), {move: "mirror up", label: "Lip Right"});
        }
        else {
            let tx = ((y + this.edges.get.spacing()) + this.edges.get.spacing());
            let ty = (x + (2 * this.edges.get.spacing()));
            let r = k;
            this.move(tx, ty, "up", {before: true});
            this.moveTo(this.edges.get.margin(), this.edges.get.margin());
            this.edges.get(y);
            this.edgeCorner("f", lip_front_edge);
            this.edges.get(t);
            this.edgeCorner(lip_front_edge, "e");
            this.edge(((y - t) - r));
            this.corner(-90, {radius: r});
            this.edge((x - ((t + r) * 2)));
            this.corner(-90, {radius: r});
            this.edge(((y - t) - r));
            this.edgeCorner("e", lip_front_edge);
            this.edges.get(t);
            this.edgeCorner(lip_front_edge, "f");
            this.edges.get(y);
            this.corner(90);
            this.edges.get(x);
            this.corner(90);
            this.move(tx, ty, "up", {label: "Lip"});
        }
    }

    gripHole() {
        if (!this.radius) {
            return;
        }
        let radius = this.radius;
        let t = this.thickness;
        let widths = argparseSections(this.holes);
        let x = (this.sx.reduce((a, b) => a + b, 0) + (this.thickness * (this.sx.length - 1)));
        if (widths.reduce((a, b) => a + b, 0) > 0) {
            if (widths.reduce((a, b) => a + b, 0) < 100) {
                let slot_offset = (((1 - (widths.reduce((a, b) => a + b, 0) / 100)) * (x - ((widths.length + 1) * this.thickness))) / (widths.length * 2));
            }
            else {
                slot_offset = 0;
            }
            let slot_height = (2 * radius);
            let slot_x = (this.thickness + slot_offset);
            for (let w of widths) {
                if (widths.reduce((a, b) => a + b, 0) > 100) {
                    let slotwidth = ((w / widths.reduce((a, b) => a + b, 0)) * (x - ((widths.length + 1) * this.thickness)));
                }
                else {
                    slotwidth = ((w / 100) * (x - ((widths.length + 1) * this.thickness)));
                }
                slot_x += (slotwidth / 2);
                this.ctx.save();
                this.rectangularHole(slot_x, (radius + t), slotwidth, slot_height, radius, true, true);
                this.ctx.restore();
                slot_x += ((((slotwidth / 2) + slot_offset) + this.thickness) + slot_offset);
            }
        }
    }

}

export { CompartmentBox };