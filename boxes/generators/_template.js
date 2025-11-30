import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class BOX extends Boxes {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--XX", {action: "store", type: "float", default: 0.5, help: "DESCRIPTION"});
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let t = this.thickness;
        let s = edges.FingerJointSettings(this.thickness);
        let p = edges.FingerJointEdge(this, s);
        p.char = "a";
        this.addPart(p);
    }

}

export { BOX };