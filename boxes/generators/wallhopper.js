import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { _WallMountedBox  } from '../walledges.js';

class WallHopper extends _WallMountedBox {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--hopper_depth", {action: "store", type: "float", default: 50, help: "Depth of the hopper"});
        this.argparser.add_argument("--dispenser_depth", {action: "store", type: "float", default: 45, help: "Depth of the dispenser"});
        this.argparser.add_argument("--dispenser_height", {action: "store", type: "float", default: 50, help: "Height of the dispenser"});
        this.argparser.add_argument("--slope_ratio", {action: "store", type: "float", default: 0.4, help: "Fraction of the bottom slope of the dispenser"});
        this.argparser.add_argument("--slope_angle", {action: "store", type: "float", default: 30, help: "Angle of the bottom slope of the dispenser"});
        this.argparser.add_argument("--label", {action: "store", type: boolarg, default: true, help: "include a label area on the front"});
        this.argparser.add_argument("--label_ratio", {action: "store", type: "float", default: 0.2, help: "Fraction of the label of the dispenser"});
    }

    wallCB(sx, l, wall) {
        const CB = () => {
            let t = this.thickness;
            let posx = (-0.5 * t);
            for (let x of sx.slice(0, -1)) {
                posx += (x + t);
                if (wall) {
                    this.wallHolesAt(posx, 0, l, 90);
                }
                else {
                    this.fingerHolesAt(posx, 0, l, 90);
                }
            }
        };

        return CB;
    }

    render() {
        this.generateWallEdges();
        let hd = this.hopper_depth;
        let dd = this.dispenser_depth;
        let dh = this.dispenser_height;
        let sr = (this.slope_ratio < 1 ? this.slope_ratio : 0.999);
        let a = this.slope_angle;
        let lr = (this.label_ratio < 1 ? this.label_ratio : 0.999);
        let t = this.thickness;
        let x = (this.sx.reduce((a, b) => a + b, 0) + (this.thickness * (this.sx.length - 1)));
        let h = this.h;
        let minsa = 0;
        let maxsa = (Math.tan((dd / (dh * sr))) * 180 / Math.PI);
        if (a < minsa) {
            a = minsa;
        }
        else {
            if (a > maxsa) {
                a = maxsa;
            }
        }
        let wh = this.edges["h"].startwidth();
        if (!this.label) {
            lr = 0;
        }
        if ((sr + lr) >= 1) {
            let total = (sr + lr);
            sr = ((sr / total) * 0.95);
            lr = ((lr / total) * 0.95);
        }
        let b = (Math.tan((dd / ((1 - (lr + sr)) * dh))) * 180 / Math.PI);
        let df = (dd - ((dh * sr) * Math.tan((a * Math.PI / 180))));
        let sl = ((dh * sr) / Math.cos((a * Math.PI / 180)));
        let tl = (((dd ** 2) + (((1 - (lr + sr)) * dh) ** 2)) ** 0.5);
        let angledsettings = this.edges["f"].settings;
        angledsettings.setValues(this.thickness, true, {angle: (90 - a)});
        angledsettings.edgeObjects(this, {chars: "gG"});
        angledsettings = this.edges["f"].settings;
        angledsettings.setValues(this.thickness, true, {angle: a});
        angledsettings.edgeObjects(this, {chars: "kK"});
        this.ctx.save();
        this.rectangularWall(x, (hd + df), "ffGf", {callback: [this.wallCB(this.sx, (hd + df))], label: "bottom", move: "up"});
        if (this.label) {
            this.rectangularWall(x, sl, "gfkf", {callback: [this.wallCB(this.sx, sl)], label: "slope", move: "up"});
            this.rectangularWall(x, (dh * lr), "Kfef", {callback: [this.wallCB(this.sx, (dh * lr))], label: "label", move: "up"});
        }
        else {
            this.rectangularWall(x, sl, "gfef", {callback: [this.wallCB(this.sx, sl)], label: "slope", move: "up"});
        }
        this.rectangularWall(x, h, "hCec", {callback: [this.wallCB(this.sx, h, true)], label: "back", move: "up"});
        this.rectangularWall(x, (h - dh), "efef", {callback: [this.wallCB(this.sx, (h - dh))], label: "front", move: "up"});
        this.ctx.restore();
        this.rectangularWall(x, 3, "DDDD", {label: "movement", move: "right only"});
        let sideEdges = [t, 0, (hd + df), [(90 - a), wh], sl, [a, wh], (dh * lr), b, tl, -b, (h - dh), 90, ((hd + wh) + t), 90, h, 0, wh, 90];
        let middleEdges = [t, 0, (hd + df), (90 - a), sl, a, (dh * lr), b, tl, -b, (h - dh), 90, (hd + t), 90, h, 0, 0, 90];
        this.polygonWall(sideEdges, "ehhhehebe", {correct_corners: false, label: "left", move: "up"});
        this.polygonWall(sideEdges, "ehhhehebe", {correct_corners: false, label: "right", move: "up mirror"});
        for (let i = 0; i < (this.sx.length - 1); i += 1) {
            this.polygonWall(middleEdges, "efffefebe", {correct_corners: false, label: "divider", move: "up"});
        }
    }

}

export { WallHopper };