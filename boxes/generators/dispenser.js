import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import '../globals.js';

const { boolarg, ArgparseEdgeType, list } = global;

class FrontEdge extends Boxes {
    __call__(length) {
        let depth = ((this.settings.y * 2) / 3);
        let t = this.settings.thickness;
        let r = Math.min((depth - t), (length / 4));
        this.edge(((length / 4) - t), {tabs: 2});
        this.corner(90, t);
        this.edge(((depth - t) - r), {tabs: 2});
        this.corner(-90, r);
        this.edge(((length / 2) - (2 * r)));
        this.corner(-90, r);
        this.edge(((depth - t) - r), {tabs: 2});
        this.corner(90, t);
        this.edge(((length / 4) - t), {tabs: 2});
    }

}

export { FrontEdge };
class Dispenser extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.StackableSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--slotheight", {action: "store", type: "float", default: 10.0, help: "height of the dispenser slot / items (in mm)"});
        this.argparser.add_argument("--viewingwidth", {action: "store", type: "float", default: 0.333333, help: "width of the viewing slot as part of total width (0 for closed front)"});
        this.argparser.add_argument("--bottomheight", {action: "store", type: "float", default: 0.0, help: "height underneath the dispenser (in mm)"});
        this.argparser.add_argument("--sideedges", {action: "store", type: ArgparseEdgeType("Fh"), choices: list("Fh"), default: "F", help: "edges used for holding the front panels and back"});
    }

    render() {
        let x;
        let y;
        let h;
        let hs;
        [x, y, h, hs] = [this.x, this.y, this.h, this.slotheight];
        let hb = this.bottomheight;
        let t = this.thickness;
        let se = this.sideedges;
        let fe = new FrontEdge(this, this);
        hb = Math.max(0, (hb - this.edges["š"].spacing()));
        let th = (h + (hb ? (hb + t) : 0.0));
        let hh = (hb + (0.5 * t));
        this.ctx.save();
        this.rectangularWall(x, y, [fe, "f", "f", "f"], {label: "Floor", move: "right"});
        this.rectangularWall(x, y, "eeee", {label: "Lid bottom", move: "right"});
        this.rectangularWall(x, y, "EEEE", {label: "Lid top", move: "right"});
        this.ctx.restore();
        this.rectangularWall(x, y, "ffff", {move: "up only"});
        if (hb) {
            let frontedge = new edges.CompoundEdge(this, "Ef", [((hb + t) + hs), (h - hs)]);
            this.rectangularWall(y, th, ["š", frontedge, "e", "f"], {ignore_widths: [6], callback: [() => this.fingerHolesAt(0, hh, y, 0)], label: "Left wall", move: "right mirror"});
            this.rectangularWall(x, th, ["š", se, "e", se], {ignore_widths: [1, 6], callback: [() => this.fingerHolesAt(0, hh, x, 0)], label: "Back wall", move: "right"});
            this.rectangularWall(y, th, ["š", frontedge, "e", "f"], {ignore_widths: [6], callback: [() => this.fingerHolesAt(0, hh, y, 0)], label: "Right wall", move: "right"});
        }
        else {
            frontedge = new edges.CompoundEdge(this, "Ef", [hs, (h - hs)]);
            this.rectangularWall(y, th, ["h", frontedge, "e", "f"], {label: "Left wall", ignore_widths: [6], move: "right mirror"});
            this.rectangularWall(x, th, ["h", se, "e", se], {ignore_widths: [1, 6], label: "Back wall", move: "right"});
            this.rectangularWall(y, th, ["h", frontedge, "e", "f"], {label: "Right wall", ignore_widths: [6], move: "right"});
        }
        this.viewingwidth = Math.max(Math.min(this.viewingwidth, 0.9), 0.0);
        if (this.viewingwidth === 0.0) {
            this.rectangularWall(x, (h - hs), ((("e" + se) + "e") + se), {label: "front", move: "right"});
        }
        else {
            let w = ((x * (1 - this.viewingwidth)) / 2);
            this.rectangularWall(w, (h - hs), ("eee" + se), {label: "Left front", move: "right"});
            this.rectangularWall(w, (h - hs), ("eee" + se), {label: "Right front", move: "mirror right"});
        }
    }

}

export { Dispenser };