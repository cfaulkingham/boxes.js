import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Gears extends Boxes {
    constructor() {
        super();
        this.argparser.add_argument("--teeth1", {action: "store", type: "int", default: 12, help: "number of teeth"});
        this.argparser.add_argument("--shaft1", {action: "store", type: "float", default: 6.0, help: "diameter of the shaft 1"});
        this.argparser.add_argument("--dpercentage1", {action: "store", type: "float", default: 75, help: "percent of the D section of shaft 1 (100 for round shaft)"});
        this.argparser.add_argument("--teeth2", {action: "store", type: "int", default: 32, help: "number of teeth in the other size of gears"});
        this.argparser.add_argument("--shaft2", {action: "store", type: "float", default: 0.0, help: "diameter of the shaft2 (zero for same as shaft 1)"});
        this.argparser.add_argument("--dpercentage2", {action: "store", type: "float", default: 0, help: "percent of the D section of shaft 1 (0 for same as shaft 1)"});
        this.argparser.add_argument("--modulus", {action: "store", type: "float", default: 2, help: "size of teeth (diameter / #teeth) in mm"});
        this.argparser.add_argument("--pressure_angle", {action: "store", type: "float", default: 20, help: "angle of the teeth touching (in degrees)"});
        this.argparser.add_argument("--profile_shift", {action: "store", type: "float", default: 20, help: "in percent of the modulus"});
    }

    render() {
        let t = this.thickness;
        this.teeth1 = Math.max(2, this.teeth1);
        this.teeth2 = Math.max(2, this.teeth2);
        if (!this.shaft2) {
            this.shaft2 = this.shaft1;
        }
        if (!this.dpercentage2) {
            this.dpercentage2 = this.dpercentage1;
        }
        this.gears({teeth: this.teeth2, dimension: this.modulus, angle: this.pressure_angle, profile_shift: this.profile_shift, callback: () => this.dHole(0, 0), move: "up"});
        let r2;
        let d2;
        let d2;
        [r2, d2, d2] = this.gears.sizes();
        this.gears({teeth: this.teeth1, dimension: this.modulus, angle: this.pressure_angle, profile_shift: this.profile_shift, callback: () => this.dHole(0, 0), move: "up"});
        let r1;
        let d1;
        let d1;
        [r1, d1, d1] = this.gears.sizes();
        let r = (Math.max(this.shaft1, this.shaft2) / 2);
        this.hole((t + r), (t + r), (this.shaft1 / 2));
        this.hole((((t + r) + r1) + r2), (t + r), (this.shaft2 / 2));
        this.moveTo(0, ((2 * r) + t));
        this.text(/* unknown node JoinedStr */, {align: "bottom left"});
    }

}

export { Gears };