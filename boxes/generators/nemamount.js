import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class NemaMount extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.argparser.add_argument("--size", {action: "store", type: "int", default: 8, choices: Object.keys(this.nema_sizes).map(Number).sort((a, b) => a - b), help: "Nema size of the motor"});
    }

    render() {
        let motor;
        let flange;
        let holes;
        let screws;
        [motor, flange, holes, screws] = this.nema_sizes[this.size] || this.nema_sizes[8];
        let t = this.thickness;
        this.rectangularWall(x, y, "ffef", {callback: [() => this.NEMA(this.size, (x / 2), (y / 2))], move: "right"});
        this.rectangularTriangle(x, h, "fFe", {num: 2, move: "right"});
        this.rectangularWall(x, h, "FFeF", {callback: [() => this.rectangularHole(((x - holes) / 2), (y / 2), screws, holes, (screws / 2)), null, () => this.rectangularHole(((x - holes) / 2), (y / 2), screws, holes, (screws / 2))], move: "right"});
        this.moveTo(t, 0);
        this.fingerHolesAt((0.5 * t), t, x, 90);
        this.fingerHolesAt(((1.5 * t) + x), t, x, 90);
        this.fingerHolesAt(t, (0.5 * t), x, 0);
    }

}

export { NemaMount };