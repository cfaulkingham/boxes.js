import { Boxes  } from '../boxes.js';
import { FingerJointSettings, BaseEdge, Settings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class InsetEdgeSettings extends Settings {
    constructor() {
        super();
        this.absolute_params = {
            thickness: 0
        };
    }
}

export { InsetEdgeSettings };
class InsetEdge extends BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'a';
    }
    
    draw(length, kw = {}) {
        let t = this.settings.thickness;
        this.boxes.corner(90);
        this.boxes.edge(t, {tabs: 2});
        this.boxes.corner(-90);
        this.boxes.edge(length, {tabs: 2});
        this.boxes.corner(-90);
        this.boxes.edge(t, {tabs: 2});
        this.boxes.corner(90);
    }
}

export { InsetEdge };
class FingerHoleEdgeSettings extends Settings {
    constructor() {
        super();
        this.absolute_params = {
            wallheight: 0,
            fingerholedepth: 0
        };
    }
}

export { FingerHoleEdgeSettings };
class FingerHoleEdge extends BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'A';
    }
    
    draw(length, kw = {}) {
        let depth = (this.settings.fingerholedepth - 10);
        this.boxes.edge(((length / 2) - 10), {tabs: 2});
        this.boxes.corner(90);
        this.boxes.edge(depth, {tabs: 2});
        this.boxes.corner(-180, 10);
        this.boxes.edge(depth, {tabs: 2});
        this.boxes.corner(90);
        this.boxes.edge(((length / 2) - 10), {tabs: 2});
    }
}

export { FingerHoleEdge };
class CardBox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.buildArgParser({y: 68, h: 92, outside: false, sx: "65*4"});
        this.argparser.add_argument("--openingdirection", {action: "store", type: "str", default: "front", choices: ["front", "right"], help: "Direction in which the lid slides open. Lid length > Lid width recommended."});
        this.argparser.add_argument("--fingerhole", {action: "store", type: "str", default: "regular", choices: ["regular", "deep", "custom"], help: "Depth of cutout to grab the cards"});
        this.argparser.add_argument("--fingerhole_depth", {action: "store", type: "float", default: 20, help: "Depth of cutout if fingerhole is set to 'custom'. Disabled otherwise."});
        this.argparser.add_argument("--add_lidtopper", {action: "store", type: BoolArg(), default: false, help: "Add an additional lid topper for optical reasons and customisation"});
    }

    get fingerholedepth() {
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
            }
        }
    }

    get boxhight() {
        if (this.outside) {
            return (this.h - (3 * this.thickness));
        }
        return this.h;
    }

    get boxwidth() {
        return (((this.sx.length + 1) * this.thickness) + this.sx.reduce((a, b) => a + b, 0));
    }

    get boxdepth() {
        if (this.outside) {
            return (this.y - (2 * this.thickness));
        }
        if (this.openingdirection === "right") {
            return (this.y + (2 * this.thickness));
        }
        return this.y;
    }

    divider_bottom() {
        let t = this.thickness;
        let sx = this.sx;
        let y = this.boxdepth;
        let pos = (0.5 * t);
        for (let i of sx.slice(0, -1)) {
            pos += (i + t);
            this.fingerHolesAt(pos, 0, y, 90);
        }
    }

    divider_back_and_front() {
        let t = this.thickness;
        let sx = this.sx;
        let y = this.boxhight;
        let pos = (0.5 * t);
        for (let i of sx.slice(0, -1)) {
            pos += (i + t);
            this.fingerHolesAt(pos, 0, y, 90);
        }
    }

    render() {
        let t = this.thickness;
        let h = this.boxhight;
        let x = this.boxwidth;
        let y = this.boxdepth;
        let sx = this.sx;
        let s = new InsetEdgeSettings();
        s.thickness = t;
        let p = new InsetEdge(this, s);
        this.addPart(p);
        s = new FingerHoleEdgeSettings();
        s.wallheight = h;
        s.fingerholedepth = this.fingerholedepth;
        p = new FingerHoleEdge(this, s);
        this.addPart(p);
        if (this.openingdirection === "right") {
            this.ctx.save();
            this.rectangularWall(x, (y - (t * 0.2)), "eFee", {move: "right", label: "Lid"});
            this.rectangularWall(x, y, "ffff", {callback: [this.divider_bottom.bind(this)], move: "right", label: "Bottom"});
            this.ctx.restore();
            this.rectangularWall(x, y, "eEEE", {move: "up only"});
            this.rectangularWall(x, t, "feee", {move: "up", label: "Lip Front"});
            this.rectangularWall(x, t, "eefe", {move: "up", label: "Lip Back"});
            this.ctx.save();
            this.rectangularWall(x, (h + t), "FfFf", {callback: [this.divider_back_and_front.bind(this)], move: "right", label: "Back"});
            this.rectangularWall(x, (h + t), "FfFf", {callback: [this.divider_back_and_front.bind(this)], move: "right", label: "Front"});
            this.ctx.restore();
            this.rectangularWall(x, (h + t), "EEEE", {move: "up only"});
            this.ctx.save();
            this.rectangularWall(y, (h + t), "FFEF", {move: "right", label: "Outer Side Left"});
            this.rectangularWall(y, (h + t), "FFaF", {move: "right", label: "Outer Side Right"});
            this.ctx.restore();
            this.rectangularWall(y, (h + t), "fFfF", {move: "up only"});
            this.ctx.save();
            this.rectangularWall(y, h, "Aeee", {move: "right", label: "Inner Side Left"});
            this.rectangularWall(y, h, "Aeee", {move: "right", label: "Inner Side Right"});
            this.ctx.restore();
            this.rectangularWall(y, h, "eAee", {move: "up only"});
            this.ctx.save();
            this.rectangularWall((y - (t * 0.2)), t, "fEeE", {move: "right", label: "Lid Lip"});
            this.ctx.restore();
            this.rectangularWall(y, (t * 2), "efee", {move: "up only"});
            for (let i = 0; i < (sx.length - 1); i += 1) {
                this.rectangularWall(h, y, "fAff", {move: "right", label: "Divider"});
            }
            for (let c of sx) {
                this.rectangularWall(c, h, "eeee", {move: "right", label: "Front inlay"});
                this.rectangularWall(c, h, "eeee", {move: "right", label: "Back inlay"});
            }
            if (this.add_lidtopper) {
                this.rectangularWall(x, (y - (2.2 * t)), "eeee", {move: "right", label: "Lid topper"});
            }
        }
        else {
            if (this.openingdirection === "front") {
                this.ctx.save();
                this.rectangularWall((x - (t * 0.2)), y, "eeFe", {move: "right", label: "Lid"});
                this.rectangularWall(x, y, "ffff", {callback: [this.divider_bottom.bind(this)], move: "right", label: "Bottom"});
                this.ctx.restore();
                this.rectangularWall(x, y, "eEEE", {move: "up only"});
                this.rectangularWall((x - (t * 0.2)), t, "fEeE", {move: "up", label: "Lid Lip"});
                this.ctx.save();
                this.rectangularWall(x, (h + t), "FFEF", {callback: [this.divider_back_and_front.bind(this)], move: "right", label: "Back"});
                this.rectangularWall(x, (h + t), "FFaF", {callback: [this.divider_back_and_front.bind(this)], move: "right", label: "Front"});
                this.ctx.restore();
                this.rectangularWall(x, (h + t), "EEEE", {move: "up only"});
                this.ctx.save();
                this.rectangularWall(y, (h + t), "FfFf", {move: "right", label: "Outer Side Left"});
                this.rectangularWall(y, (h + t), "FfFf", {move: "right", label: "Outer Side Right"});
                this.ctx.restore();
                this.rectangularWall(y, (h + t), "fFfF", {move: "up only"});
                this.ctx.save();
                this.rectangularWall(y, h, "Aeee", {move: "right", label: "Inner Side Left"});
                this.rectangularWall(y, h, "Aeee", {move: "right", label: "Inner Side Right"});
                this.ctx.restore();
                this.rectangularWall(y, h, "eAee", {move: "up only"});
                this.ctx.save();
                this.rectangularWall(y, t, "eefe", {move: "right", label: "Lip Left"});
                this.rectangularWall(y, t, "feee", {move: "right", label: "Lip Right"});
                this.ctx.restore();
                this.rectangularWall(y, (t * 2), "efee", {move: "up only"});
                for (let i = 0; i < (sx.length - 1); i += 1) {
                    this.rectangularWall(h, y, "fAff", {move: "right", label: "Divider"});
                }
                if (this.add_lidtopper) {
                    this.rectangularWall((x - (2.2 * t)), y, "eeee", {move: "right", label: "Lid topper (optional)"});
                }
            }
        }
    }

}

export { CardBox };