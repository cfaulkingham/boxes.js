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
        this.argparser.add_argument("--size", {action: "store", type: "int", default: 8, choices: list(sorted(this.nema_sizes.keys())), help: "Nema size of the motor"});
        this.argparser.add_argument("--screwholes", {action: "store", type: "float", default: 0.0, help: "Size of the screw holes in mm - 0 for default size"});
    }

    render() {
        let motor;
        let flange;
        let holes;
        let screws;
        [motor, flange, holes, screws] = this.nema_sizes.get(this.size, this.nema_sizes[8]);
        this.NEMA(this.size, (motor / 2), (motor / 2), {screwholes: this.screwholes});
    }

}

export { NemaPattern };