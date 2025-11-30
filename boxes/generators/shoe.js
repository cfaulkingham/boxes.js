import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Shoe extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.FlexSettings);
        this.argparser.add_argument("--width", {action: "store", type: "float", default: 65, help: "width of the shoe"});
        this.argparser.add_argument("--length", {action: "store", type: "float", default: 175, help: "length front to back"});
        this.argparser.add_argument("--height", {action: "store", type: "float", default: 100, help: "height at the back of the shoe"});
        this.argparser.add_argument("--frontheight", {action: "store", type: "float", default: 35, help: "height at the front of the shoe"});
        this.argparser.add_argument("--fronttop", {action: "store", type: "float", default: 20, help: "length of the flat part at the front of the shoe"});
        this.argparser.add_argument("--tophole", {action: "store", type: "float", default: 75, help: "length of the opening at the top"});
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 30, help: "radius of the bend"});
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.width, this.length, this.height];
        let t = this.thickness;
        let hf = this.frontheight;
        let yg = this.tophole;
        let tf = this.fronttop;
        let r = this.radius;
        if (hf > h) {
            ValueError("Height at front of shoe must be less than height at back of shoe.")
        }
        let stretch = this.edges["X"].settings.stretch;
        this.ctx.save();
        this.rectangularWall(y, x, "FFFF", {move: "up", label: "Bottom"});
        let lf;
        let a;
        [lf, a] = this.shoeside(y, h, hf, yg, tf, r);
        this.shoeside(y, h, hf, yg, tf, r, {move: "mirror up", label: "Side"});
        this.ctx.restore();
        this.rectangularWall(y, x, "FFFF", {move: "right only"});
        this.rectangularWall(x, h, "ffef", {move: "up", label: "Back"});
        this.rectangularWall(x, hf, "ffff", {move: "up", label: "front"});
        let dr = ((a * (r - t)) / stretch);
        this.shoelip(x, tf, dr, lf, {label: "top"});
    }

    shoelip(x, tf, dr, lf, move, label) {
        let w = this.edges["F"].spacing();
        let th = ((((tf + dr) + lf) + this.edges["F"].spacing()) + this.edges["e"].spacing());
        let tw = (x + (2 * w));
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(this.edges["F"].spacing(), this.edges["e"].spacing());
        this.edges["F"](x);
        this.edgeCorner("F", "F");
        this.edges["F"](tf);
        this.edges["X"](dr, {h: (x + (2 * w))});
        this.edges["F"](lf);
        this.edgeCorner("F", "e");
        this.edges["e"](x);
        this.edgeCorner("e", "F");
        this.edges["F"](lf);
        this.edges["E"](dr);
        this.edges["F"](tf);
        this.edgeCorner("F", "F");
        this.move(tw, th, move, {label: label});
    }

    shoeside(y, h, hf, yg, tf, r, move, label) {
        let tx = (y + (2 * this.edges.get.spacing()));
        let ty = ((h + this.edges.get.spacing()) + this.edges.get.spacing());
        if (this.move(tx, ty, move)) {
            return;
        }
        let lf = Math.sqrt((((h - hf) ** 2) + (((y - yg) - tf) ** 2)));
        let af = (90 - (Math.atan(((h - hf) / ((y - yg) - tf))) * 180 / Math.PI));
        let atemp = (Math.atan((((h - hf) - r) / ((y - yg) - tf))) * 180 / Math.PI);
        let dtemp = Math.sqrt(((((h - hf) - r) ** 2) + (((y - yg) - tf) ** 2)));
        lf = Math.sqrt(((dtemp ** 2) - (r ** 2)));
        af = ((90 - atemp) - (Math.atan((r / lf)) * 180 / Math.PI));
        this.moveTo(this.edges.get.margin(), this.edges.get.margin());
        this.edges.get(y);
        this.edgeCorner(this.edges["f"], this.edges["F"], 90);
        this.edges.get(hf);
        this.edgeCorner(this.edges["F"], this.edges["f"], 90);
        this.edges.get(tf);
        this.corner((af - 90), r);
        this.edges.get(lf);
        this.edgeCorner(this.edges["f"], this.edges["e"], (90 - af));
        this.edges.get(yg);
        this.edgeCorner(this.edges["e"], this.edges["F"], 90);
        this.edges.get(h);
        this.edgeCorner(this.edges["F"], this.edges["f"], 90);
        this.move(tx, ty, move, {label: label});
        return [lf, ((90 - af) * Math.PI / 180)];
    }

}

export { Shoe };