import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class StackableBinEdge extends Boxes {
    __call__(length) {
        let f = this.settings.front;
        let a1 = (Math.tan((f / (1 - f))) * 180 / Math.PI);
        let a2 = (45 + a1);
        this.corner(-a1);
        this.edges["e"]((this.settings.h * (((f ** 2) + ((1 - f) ** 2)) ** 0.5)));
        this.corner(a2);
        this.edges["f"](((this.settings.h * f) * (2 ** 0.5)));
        this.corner(-45);
    }

    margin() {
        return (this.settings.h * this.settings.front);
    }

}

export { StackableBinEdge };
class StackableBinSideEdge extends StackableBinEdge {
}

export { StackableBinSideEdge };
class StackableBin extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.StackableSettings, {bottom_stabilizers: 2.4});
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 0.5});
        // this.buildArgParser("outside");
        // this.buildArgParser();
        this.argparser.add_argument("--d", {action: "store", type: "float", default: 100, help: "bin (d)epth"});
        this.argparser.add_argument("--front", {action: "store", type: "float", default: 0.4, help: "fraction of bin height covered with slope"});
    }

    wallCB(sx, l) {
        const CB = () => {
            let t = this.thickness;
            let posx = (-0.5 * t);
            for (let x of sx.slice(0, -1)) {
                posx += (x + t);
                this.fingerHolesAt(posx, 0, l, 90);
            }
        };

        return CB;
    }

    render() {
        this.front = Math.min(this.front, 0.999);
        this.addPart(new StackableBinEdge(this, this));
        this.addPart(StackableBinSideEdge(this, this));
        let angledsettings = this.edges["f"].settings;
        angledsettings.setValues(this.thickness, true, {angle: 45});
        angledsettings.edgeObjects(this, {chars: "gGH"});
        if (this.outside) {
            this.sx = this.adjustSize(this.sx);
            this.h = this.adjustSize(this.h, "s", "S");
            this.d = this.adjustSize(this.d, "h", "b");
        }
        let x = (this.sx.reduce((a, b) => a + b, 0) + (this.thickness * (this.sx.length - 1)));
        this.ctx.save();
        this.rectangularWall(x, this.d, "ffGf", {callback: [this.wallCB(this.sx, this.d)], label: "bottom", move: "up"});
        this.rectangularWall(x, this.h, "hfef", {callback: [this.wallCB(this.sx, this.h)], label: "back", move: "up "});
        this.rectangularWall(x, ((this.h * this.front) * (2 ** 0.5)), "gFeF", {callback: [this.wallCB(this.sx, ((this.h * this.front) * (2 ** 0.5)))], label: "retainer", move: "up"});
        this.rectangularWall(x, 3, "EEEE", {label: "for label (optional)"});
        this.ctx.restore();
        this.rectangularWall(x, 3, "EEEE", {label: "movement", move: "right only"});
        this.rectangularWall(this.d, this.h, "shSb", {label: "left", move: "up"});
        this.rectangularWall(this.d, this.h, "shSb", {label: "right", move: "mirror up"});
        for (let i = 0; i < (this.sx.length - 1); i += 1) {
            this.rectangularWall(this.d, this.h, "ffSb", {label: "left", move: "up"});
        }
    }

}

export { StackableBin };