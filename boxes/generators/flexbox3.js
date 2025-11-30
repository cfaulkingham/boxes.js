import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class FlexBox3 extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 1});
        this.addSettingsArgs(edges.FlexSettings);
        // this.buildArgParser("x", "y", "outside");
        this.argparser.add_argument("--z", {action: "store", type: "float", default: 100.0, help: "height of the box"});
        this.argparser.add_argument("--h", {action: "store", type: "float", default: 10.0, help: "height of the lid"});
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 10.0, help: "radius of the lids living hinge"});
        this.argparser.add_argument("--c", {action: "store", type: "float", default: 1.0, dest: "d", help: "clearance of the lid"});
    }

    flexBoxSide(x, y, r, callback, move) {
        let t = this.thickness;
        if (this.move((x + (2 * t)), (y + t), move, true)) {
            return;
        }
        this.moveTo(t, t);
        this.cc(callback, 0);
        this.edges["f"](x);
        this.corner(90, 0);
        this.cc(callback, 1);
        this.edges["f"]((y - r));
        this.corner(90, r);
        this.cc(callback, 2);
        this.edge((x - r));
        this.corner(90, 0);
        this.cc(callback, 3);
        this.edges["f"](y);
        this.corner(90);
        this.move((x + (2 * t)), (y + t), move);
    }

    surroundingWall(move) {
        let x;
        let y;
        let z;
        let r;
        let d;
        [x, y, z, r, d] = [this.x, this.y, this.z, this.radius, this.d];
        let t = this.thickness;
        let tw = (((((x + y) - (2 * r)) + this.c4) + (2 * t)) + t);
        let th = ((z + (4 * t)) + (2 * d));
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(t, (d + t));
        this.edges["F"]((y - r), false);
        this.edges["X"](this.c4, (z + (2 * t)));
        this.corner(-90);
        this.edge(d);
        this.corner(90);
        this.edges["f"](((x - r) + t));
        this.corner(90);
        this.edges["f"](((z + (2 * t)) + (2 * d)));
        this.corner(90);
        this.edges["f"](((x - r) + t));
        this.corner(90);
        this.edge(d);
        this.corner(-90);
        this.edge(this.c4);
        this.edges["F"]((y - r));
        this.corner(90);
        this.edge(t);
        this.edges["f"](z);
        this.edge(t);
        this.corner(90);
        this.move(tw, th, move);
    }

    lidSide(move) {
        let x;
        let y;
        let z;
        let r;
        let d;
        let h;
        [x, y, z, r, d, h] = [this.x, this.y, this.z, this.radius, this.d, this.h];
        let t = this.thickness;
        let r2 = ((r + t) <= (h + t) ? (r + t) : (h + t));
        if (r < h) {
            r2 = (r + t);
            let base_l = (x + (2 * t));
            if (this.move((h + t), (base_l + t), move, true)) {
                return;
            }
            this.edge(((h + this.thickness) - r2));
            this.corner(90, r2);
            this.edge(((r - r2) + (1 * t)));
        }
        else {
            let a = Math.acos(((r - h) / (r + t)));
            let ang = (a * 180 / Math.PI);
            base_l = (((x + ((r + t) * Math.sin(a))) - r) + t);
            if (this.move((h + t), (base_l + t), move, true)) {
                return;
            }
            this.corner((90 - ang));
            this.corner(ang, (r + t));
        }
        this.edges["F"](((x - r) + t));
        this.edgeCorner("F", "f");
        this.edges["g"](h);
        this.edgeCorner("f", "e");
        this.edge(base_l);
        this.corner(90);
        this.move((h + t), (base_l + t), move);
    }

    render() {
        if (this.outside) {
            this.x = this.adjustSize(this.x);
            this.y = this.adjustSize(this.y);
            this.z = this.adjustSize(this.z);
        }
        let x;
        let y;
        let z;
        let d;
        let h;
        [x, y, z, d, h] = [this.x, this.y, this.z, this.d, this.h];
        let thickness = this.thickness;
        this.latchsize = (8 * thickness);
        let width = ((((((2 * x) + y) - (2 * r)) + c4) + (14 * thickness)) + (3 * h));
        let height = ((y + z) + (8 * thickness));
        let s = edges.FingerJointSettings(this.thickness);
        s.edgeObjects(this, "gGH");
        this.ctx.save();
        this.surroundingWall({move: "right"});
        this.rectangularWall(x, z, {edges: "FFFF", move: "right"});
        this.rectangularWall(h, (z + (2 * (d + this.thickness))), {edges: "GeGF", move: "right"});
        this.lidSide({move: "right"});
        this.lidSide({move: "mirror right"});
        this.ctx.restore();
        this.surroundingWall({move: "up only"});
        this.flexBoxSide(x, y, r, {move: "right"});
        this.flexBoxSide(x, y, r, {move: "mirror right"});
        this.rectangularWall(z, y, {edges: "fFeF"});
    }

}

export { FlexBox3 };