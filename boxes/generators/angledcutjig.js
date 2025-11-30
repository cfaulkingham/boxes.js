import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class AngledCutJig extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 1.0});
        // this.buildArgParser();
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 45.0, help: "Angle of the cut"});
    }

    bottomCB() {
        let t = this.thickness;
        this.fingerHolesAt((10 - t), (4.5 * t), 20, 0);
        this.fingerHolesAt((30 + t), (4.5 * t), this.x, 0);
        this.fingerHolesAt((10 - t), (this.y - (4.5 * t)), 20, 0);
        this.fingerHolesAt((30 + t), (this.y - (4.5 * t)), this.x, 0);
    }

    render() {
        let x;
        let y;
        [x, y] = [this.x, this.y];
        let t = this.thickness;
        let th = (x * Math.tan(((90 - this.angle) * Math.PI / 180)));
        let l = (((x ** 2) + (th ** 2)) ** 0.5);
        let th2 = (20 * Math.tan((this.angle * Math.PI / 180)));
        let l2 = (((20 ** 2) + (th2 ** 2)) ** 0.5);
        this.rectangularWall(((30 + x) + (2 * t)), y, {callback: [this.bottomCB], move: "right"});
        this.rectangularWall(l, y, {callback: [() => this.fingerHolesAt(0, (4.5 * t), l, 0), null, () => this.fingerHolesAt(0, (4.5 * t), l, 0), null], move: "right"});
        this.rectangularWall(l2, y, {callback: [() => this.fingerHolesAt(0, (4.5 * t), l2, 0), null, () => this.fingerHolesAt(0, (4.5 * t), l2, 0), null], move: "right"});
        this.rectangularTriangle(x, th, "fef", {num: 2, move: "up"});
        this.rectangularTriangle(20, th2, "fef", {num: 2, move: "up"});
    }

}

export { AngledCutJig };