import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Display extends Boxes {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 5.0, help: "radius of the corners in mm"});
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 0.0, help: "greater zero for top wider as bottom"});
    }

    render() {
        let x;
        let h;
        let r;
        [x, h, r] = [this.x, this.h, this.radius];
        let a = this.angle;
        let t = this.thickness;
        this.roundedPlate((0.7 * x), x, r, "e", {extend_corners: false, move: "up"});
        let oh = ((1.2 * h) - (2 * r));
        if (a > 0) {
            this.moveTo((Math.sin((a * Math.PI / 180)) * oh));
        }
        this.rectangularHole((x / 2), (h * 0.2), ((0.7 * x) + (0.1 * t)), (1.3 * t));
        this.moveTo(r);
        this.polyline((x - (2 * r)), [(90 - a), r], oh, [(90 + a), r], ((x - (2 * r)) + ((2 * Math.sin((a * Math.PI / 180))) * oh)), [(90 + a), r], oh, [(90 - a), r]);
    }

}

export { Display };