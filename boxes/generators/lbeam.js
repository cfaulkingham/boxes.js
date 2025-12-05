import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class LBeam extends Boxes {
    // Default configuration for test runner and standalone usage
    static get defaultConfig() {
        return {
            x: 100.0,
            y: 100.0,
            h: 100.0,
            outside: false
        };
    }

    constructor() {
        super();
        // this.buildArgParser("x", "y", "h", "outside");
        this.addSettingsArgs(edges.FingerJointSettings);
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let t = this.thickness;
        if (this.outside) {
            x = this.adjustSize(x, false);
            y = this.adjustSize(y, false);
        }
        this.rectangularWall(x, h, "eFee", {move: "right"});
        this.rectangularWall(y, h, "eeef");
    }

}

export { LBeam };