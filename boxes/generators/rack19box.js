import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Rack19Box extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 0.5});
        this.argparser.add_argument("--depth", {action: "store", type: "float", default: 100.0, help: "inner depth in mm"});
        this.argparser.add_argument("--height", {action: "store", type: "int", default: 2, choices: list(range(1, 17)), help: "height in rack units"});
        this.argparser.add_argument("--triangle", {action: "store", type: "float", default: 25.0, help: "Sides of the triangles holding the lid in mm"});
        this.argparser.add_argument("--d1", {action: "store", type: "float", default: 2.0, help: "Diameter of the inner lid screw holes in mm"});
        this.argparser.add_argument("--d2", {action: "store", type: "float", default: 3.0, help: "Diameter of the lid screw holes in mm"});
    }

    wallxCB() {
        let t = this.thickness;
        this.fingerHolesAt(0, (this.h - (1.5 * t)), this.triangle, 0);
        this.fingerHolesAt(this.x, (this.h - (1.5 * t)), this.triangle, 180);
    }

    wallxfCB() {
        let t = this.thickness;
        for (let x of [8.5, (((this.x + (2 * 17.0)) + (2 * t)) - 8.5)]) {
            for (let y of [6.0, ((this.h - 6.0) + t)]) {
                this.rectangularHole(x, y, 10, 6.5, {r: 3.25});
            }
        }
        this.moveTo((t + 17.0), t);
        this.wallxCB();
    }

    wallyCB() {
        let t = this.thickness;
        this.fingerHolesAt(0, (this.h - (1.5 * t)), this.triangle, 0);
        this.fingerHolesAt(this.y, (this.h - (1.5 * t)), this.triangle, 180);
    }

    _render(type) {
        let t = this.thickness;
        if (type === 10) {
            this.x = (219.0 - (2 * t));
        }
        else {
            this.x = (448.0 - (2 * t));
        }
        let x = this.x;
        let d1;
        let d2;
        [d1, d2] = [this.d1, this.d2];
        let tr = this.triangle;
        let trh = (tr / 3.0);
        this.rectangularWall(y, h, "ffef", {callback: [this.wallyCB], move: "right", label: "right"});
        this.flangedWall(x, h, "FFEF", {callback: [this.wallxfCB], r: t, flanges: [0.0, 17.0, -t, 17.0], move: "up", label: "front"});
        this.rectangularWall(x, h, "fFeF", {callback: [this.wallxCB], label: "back"});
        this.rectangularWall(y, h, "ffef", {callback: [this.wallyCB], move: "left up", label: "left"});
        this.rectangularWall(x, y, "fFFF", {move: "up", label: "bottom"});
        this.rectangularWall(x, y, {callback: ([() => this.hole(trh, trh)] * 4), move: "right", label: "lid"});
        this.rectangularTriangle(tr, tr, "ffe", {num: 4, callback: [null, () => this.hole(trh, trh)]});
    }

    render() {
        this._render({type: 19});
    }

}

export { Rack19Box };