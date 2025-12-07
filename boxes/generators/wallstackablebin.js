import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { _WallMountedBox  } from '../walledges.js';

class StackableBinEdge extends Boxes {
    __call__(length) {
        let a = this.settings.angle;
        let f = this.settings.front;
        let l = this.settings.label_height;
        let label = this.settings.label;
        let h = this.settings.h;
        if (!label) {
            l = 0;
        }
        let w = ((h * f) * Math.tan((a * Math.PI / 180)));
        let hyp1 = ((h * f) / Math.cos((a * Math.PI / 180)));
        let hyp2 = Math.sqrt(((w ** 2) + (((1 - (l + f)) * h) ** 2)));
        let b = (Math.tan((w / (((1 - l) - f) * h))) * 180 / Math.PI);
        this.corner(-b);
        this.edges["e"](hyp2);
        this.corner(b);
        this.edges["f"]((l * h));
        this.corner(a);
        this.edges["f"](hyp1);
        this.corner(-a);
    }

    margin() {
        let t = (this.settings.label ? this.settings.thickness : 0);
        return (((this.settings.h * this.settings.front) * Math.tan((this.settings.angle * Math.PI / 180))) + t);
    }

}

export { StackableBinEdge };
class WallStackableBin extends _WallMountedBox {
    constructor() {
        super();
        this.addSettingsArgs(edges.StackableSettings, {bottom_stabilizers: 2.4});
        // this.buildArgParser("outside");
        // this.buildArgParser();
        this.argparser.add_argument("--front", {action: "store", type: "float", default: 0.3, help: "fraction of bin height covered with slope"});
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 30, help: "angle of the bottom slope"});
        this.argparser.add_argument("--label", {action: "store", type: boolarg, default: true, help: "include a label area on the front"});
        this.argparser.add_argument("--label_height", {action: "store", type: "float", default: 0.2, help: "fraction of bin height covered with label (if label is enabled)"});
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
        this.addPart(new StackableBinEdge(this, this));
        let angledsettings = this.edges["f"].settings;
        angledsettings.setValues(this.thickness, true, {angle: (90 - this.angle)});
        angledsettings.edgeObjects(this, {chars: "gG"});
        angledsettings = this.edges["f"].settings;
        angledsettings.setValues(this.thickness, true, {angle: this.angle});
        angledsettings.edgeObjects(this, {chars: "kK"});
        if (this.outside) {
            this.sx = this.adjustSize(this.sx);
            this.h = this.adjustSize(this.h, "s", "S");
            this.y = this.adjustSize(this.y, "h", "b");
        }
        let x = (this.sx.reduce((a, b) => a + b, 0) + (this.thickness * (this.sx.length - 1)));
        this.ctx.save();
        this.rectangularWall(x, this.y, "ffGf", {callback: [this.wallCB(this.sx, this.y)], label: "bottom", move: "up"});
        let hs = ((this.h * this.front) / Math.cos((this.angle * Math.PI / 180)));
        if (this.label) {
            this.rectangularWall(x, hs, "gFkF", {callback: [this.wallCB(this.sx, hs)], label: "slope", move: "up"});
            this.rectangularWall(x, (this.h * this.label_height), "KFeF", {callback: [this.wallCB(this.sx, (this.h * this.label_height))], label: "label", move: "up"});
        }
        else {
            this.rectangularWall(x, hs, "gFeF", {callback: [this.wallCB(this.sx, hs)], label: "slope", move: "up"});
        }
        this.rectangularWall(x, this.h, "hCec", {callback: [this.wallCB(this.sx, this.h, true)], label: "back", move: "up"});
        this.ctx.restore();
        this.rectangularWall(x, 3, "DDDD", {label: "movement", move: "right only"});
        this.rectangularWall(this.y, this.h, "sBSj", {label: "left side", move: "up"});
        this.rectangularWall(this.y, this.h, "sBSj", {label: "right side", move: "mirror up"});
        for (let i = 0; i < (this.sx.length - 1); i += 1) {
            this.rectangularWall(this.y, this.h, "fBSj", {label: "dividers", move: "up"});
        }
    }

}

export { WallStackableBin };