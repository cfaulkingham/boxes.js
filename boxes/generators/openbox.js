import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class OpenBox extends Boxes {
    // Default configuration for test runner and standalone usage
    static get defaultConfig() {
        return {
            x: 100.0,
            y: 100.0,
            h: 100.0,
            outside: false,
            edgetype: "F"
        };
    }

    constructor() {
        super();
        // this.buildArgParser("x", "y", "h", "outside");
        this.argparser.add_argument("--edgetype", {action: "store", type: ArgparseEdgeType("Fh"), choices: list("Fh"), default: "F", help: "edge type"});
        this.addSettingsArgs(edges.FingerJointSettings);
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let t = this.thickness;
        if (this.outside) {
            x = this.adjustSize(x);
            y = this.adjustSize(y, false);
            h = this.adjustSize(h, false);
        }
        let e = this.edgetype;
        this.rectangularWall(x, h, [e, e, "e", e], {move: "right"});
        this.rectangularWall(y, h, [e, "e", "e", "f"], {move: "up"});
        this.rectangularWall(y, h, [e, "e", "e", "f"]);
        this.rectangularWall(x, y, "efff", {move: "left"});
    }

}

export { OpenBox };