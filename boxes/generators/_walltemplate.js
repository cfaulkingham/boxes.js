import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { _WallMountedBox  } from '../walledges.js';

class WallXXX extends _WallMountedBox {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--XX", {action: "store", type: "float", default: 0.5, help: "DESCRIPTION"});
        this.argparser.add_argument("--XXX", {action: "store", type: boolarg, default: false, help: "DESCRIPTION"});
    }

    render() {
        this.generateWallEdges();
    }

}

export { WallXXX };