import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class NemaPattern extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.argparser.add_argument("--size", {action: "store", type: "int", default: 8, choices: Object.keys(this.nema_sizes).map(Number).sort((a, b) => a - b), help: "Nema size of the motor"});
        this.argparser.add_argument("--screwholes", {action: "store", type: "float", default: 0.0, help: "Size of the screw holes in mm - 0 for default size"});
    }

    render() {
        let motor;
        let flange;
        let holes;
        let screws;
        [motor, flange, holes, screws] = this.nema_sizes[this.size] || this.nema_sizes[8];
        this.NEMA(this.size, (motor / 2), (motor / 2), 0, this.screwholes);
    }

}

export { NemaPattern };