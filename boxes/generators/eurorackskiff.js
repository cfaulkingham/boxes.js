import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class EuroRackSkiff extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser("h");
        this.argparser.add_argument("--hp", {action: "store", type: "int", default: 84, help: "Width of the case in HP"});
    }

    wallxCB(x) {
        let t = this.thickness;
    }

    wallyCB(y) {
        let t = this.thickness;
        this.fingerHolesAt(0, (this.h - (1.5 * t)), y, 0);
    }

    railHoles() {
        for (let i = 0; i < this.hp; i += 1) {
            this.hole(((i * 5.08) + 2.54), 3, {d: 3.0});
        }
    }

    render() {
        let t = this.thickness;
        let h = this.h;
        let y = (this.hp * 5.08);
        let x = 128.5;
        this.rectangularWall(y, 6, "feee", {callback: [this.railHoles], move: "up"});
        this.rectangularWall(y, 6, "feee", {callback: [this.railHoles], move: "up"});
        this.rectangularWall(x, h, "fFeF", {callback: [() => this.wallxCB(x)], move: "right"});
        this.rectangularWall(y, h, "ffef", {callback: [() => this.wallyCB(y)], move: "up"});
        this.rectangularWall(y, h, "ffef", {callback: [() => this.wallyCB(y)]});
        this.rectangularWall(x, h, "fFeF", {callback: [() => this.wallxCB(x)], move: "left up"});
        this.rectangularWall(x, y, "FFFF", {callback: [], move: "right"});
    }

}

export { EuroRackSkiff };