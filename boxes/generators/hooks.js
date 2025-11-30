import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Hook extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 0.5});
        this.argparser.add_argument("--width", {action: "store", type: "float", default: 40.0, help: "width of the hook (back plate is a bit wider)"});
        this.argparser.add_argument("--height", {action: "store", type: "float", default: 40.0, help: "inner height of the hook"});
        this.argparser.add_argument("--depth", {action: "store", type: "float", default: 40.0, help: "inner depth of the hook"});
        this.argparser.add_argument("--strength", {action: "store", type: "float", default: 20.0, help: "width of the hook from the side"});
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 45.0, help: "angle of the support underneath"});
    }

    render() {
        this.angle = Math.min(this.angle, 80);
        let t = this.thickness;
        let w = (this.width - (2 * t));
        let d;
        let h;
        let s;
        [d, h, s] = [this.depth, this.height, this.strength];
        this.rectangularWall((w + (4 * t)), this.height_back, "Eeee", {callback: this.back_callback, move: "right"});
        this.sidewall(d, h, s, this.angle, {move: "right"});
        this.sidewall(d, h, s, this.angle, {move: "right"});
        this.rectangularWall(d, w, "FFFf", {move: "right"});
        this.rectangularWall((h - t), w, "FFFf", {move: "right", callback: [() => this.hole(((h - t) / 2), (w / 2))]});
        this.rectangularWall((s - t), w, "FeFf", {move: "right"});
    }

    back_callback(n) {
        if (n !== 0) {
            return;
        }
        let t = this.thickness;
        let h = (this.h_a + this.strength);
        this.fingerHolesAt((1.5 * t), 0, h);
        this.fingerHolesAt((this.width + (0.5 * t)), 0, h);
        this.fingerHolesAt((2 * t), (h + (t / 2)), (this.width - (2 * t)), 0);
        let x_h = ((this.width / 2) + t);
        let y1 = (h + (this.height / 2));
        let y2 = (this.strength / 2);
        let y3 = ((y1 + y2) / 2);
        this.hole(x_h, y1, {d: 3});
        this.hole(x_h, y2, {d: 3});
        this.hole(x_h, y3, {d: 3});
    }

    height_back() {
        return ((this.strength + this.height) + this.h_a);
    }

    h_a() {
        return (this.depth * Math.tan((this.angle * Math.PI / 180)));
    }

    sidewall(depth, height, strength, angle, move) {
        let t = this.thickness;
        let h_a = (depth * Math.tan((angle * Math.PI / 180)));
        let l_a = (depth / Math.cos((angle * Math.PI / 180)));
        let f_edge = this.edges["f"];
        let x_total = ((depth + strength) + f_edge.margin());
        let y_total = ((strength + height) + h_a);
        if (this.move(x_total, y_total, move)) {
            return;
        }
        this.moveTo(f_edge.margin());
        this.polyline(strength, angle, l_a, (90 - angle), (height + strength), 90);
        f_edge((strength - t));
        this.corner(90);
        f_edge((height - t));
        this.polyline(t, -90, t);
        f_edge(depth);
        this.corner(90);
        f_edge((h_a + strength));
        this.corner(90);
        this.move(x_total, y_total, move);
    }

}

export { Hook };