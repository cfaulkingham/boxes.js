import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { _WallMountedBox  } from '../walledges.js';

class PinEdge extends Boxes {
    __call__(length) {
        let w2 = (this.settings.pinwidth / 2);
        let l = this.settings.pinlength;
        let s = this.settings.pinspacing;
        let inc = this.settings.pinspacing_increment;
        let t = this.settings.thickness;
        let pin = [0, -90, ((l + t) - w2), [180, w2], ((l + t) - w2), -90];
        this.edge(((s / 2) - w2));
        s += (inc / 2);
        for (let i = 0; i < (this.pins - 1); i += 1) {
            this.polyline(...pin, (s - (2 * w2)));
            s += inc;
        }
        this.polyline(...pin, (((s / 2) - w2) - (inc / 4)));
    }

    margin() {
        return (this.settings.thickness + this.settings.pinlength);
    }

}

export { PinEdge };
class WallPinRow extends _WallMountedBox {
    constructor() {
        super();
        this.argparser.add_argument("--pins", {action: "store", type: "int", default: 8, help: "number of pins"});
        this.argparser.add_argument("--pinlength", {action: "store", type: "float", default: 35, help: "length of pins (in mm)"});
        this.argparser.add_argument("--pinwidth", {action: "store", type: "float", default: 10, help: "width of pins (in mm)"});
        this.argparser.add_argument("--pinspacing", {action: "store", type: "float", default: 35, help: "space from middle to middle of pins (in mm)"});
        this.argparser.add_argument("--pinspacing_increment", {action: "store", type: "float", default: 0.0, help: "increase spacing from left to right (in mm)"});
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 20.0, help: "angle of the pins pointing up (in degrees)"});
        this.argparser.add_argument("--hooks", {action: "store", type: "int", default: 3, help: "number of hooks into the wall"});
        this.argparser.add_argument("--h", {action: "store", type: "float", default: 50.0, help: "height of the front plate (in mm) - needs to be at least 7 time the thickness"});
    }

    frontCB() {
        let s = this.pinspacing;
        let inc = this.pinspacing_increment;
        let t = this.thickness;
        let pos = (s / 2);
        s += (0.5 * inc);
        for (let i = 0; i < this.pins; i += 1) {
            this.rectangularHole(pos, (2 * t), this.pinwidth, t);
            pos += s;
            s += inc;
        }
        for (let i = 1; i < (this.hooks - 1); i += 1) {
            this.fingerHolesAt(((i * this.x) / (this.hooks - 1)), (this.h / 2), (this.h / 2));
        }
    }

    backCB() {
        let t = this.thickness;
        this.fingerHolesAt(0, (2 * t), this.x, 0);
        if (this.angle < 0.001) {
            return;
        }
        for (let i = 1; i < (this.hooks - 1); i += 1) {
            this.fingerHolesAt(((i * this.x) / (this.hooks - 1)), (3 * t), ((this.h / 2) - (3 * t)));
        }
    }

    sideWall(move) {
        let a = this.angle;
        let ar = (a * Math.PI / 180);
        let h = this.h;
        let t = this.thickness;
        let sh = (((Math.sin(ar) * 6) * t) + (Math.cos(ar) * h));
        let tw = ((this.edges["a"].margin() + (Math.sin(ar) * h)) + ((Math.cos(ar) * 6) * t));
        let th = (sh + 6);
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(this.edges["a"].margin());
        this.polyline((Math.sin(ar) * h), a, (4 * t));
        this.fingerHolesAt((-3.5 * t), 0, (h / 2), 90);
        this.edgeCorner("e", "h");
        this.edges["h"](h);
        this.polyline(0, (90 - a), ((Math.cos(ar) * 6) * t), 90);
        this.edges["a"](sh);
        this.corner(90);
        this.move(tw, th, move);
    }

    supportWall(move) {
        let a = this.angle;
        let ar = (a * Math.PI / 180);
        let h = this.h;
        let t = this.thickness;
        let sh = (((Math.sin(ar) * 6) * t) + (Math.cos(ar) * h));
        let tw = (this.edges["a"].margin() + Math.max((((Math.sin(ar) * h) / 2) + ((Math.cos(ar) * 5) * t)), (Math.sin(ar) * h)));
        let th = (sh + 6);
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(this.edges["a"].margin());
        if (a > 0.001) {
            this.polyline((Math.sin(ar) * h), (a + 90), (3 * t));
            this.edges["f"](((h / 2) - (3 * t)));
            this.polyline(0, -90);
        }
        this.polyline((4 * t), 90);
        this.edges["f"]((h / 2));
        this.polyline(((Math.sin(ar) * 2) * t), (90 - a), (((Math.cos(ar) * 4) * t) - (((Math.sin(ar) ** 2) * 2) * t)), 90);
        if (a > 0.001) {
            this.edges["a"](sh);
        }
        else {
            this.edges["a"]((h / 2));
        }
        this.corner(90);
        this.move(tw, th, move);
    }

    render() {
        this.generateWallEdges();
        let p = PinEdge(this, this);
        let n = this.pins;
        let t = this.thickness;
        if (this.h < (7 * t)) {
            this.h = (7 * t);
        }
        this.rectangularWall(x, (3 * t), [p, "e", "f", "e"], {move: "up"});
        this.rectangularWall(x, this.h, "efef", {callback: [this.frontCB], move: "up"});
        this.rectangularWall(x, (this.h / 2), "efef", {callback: [this.backCB], move: "up"});
        this.sideWall({move: "right"});
        for (let i = 0; i < (this.hooks - 2); i += 1) {
            this.supportWall({move: "right"});
        }
        this.sideWall({move: "right"});
    }

}

export { WallPinRow };