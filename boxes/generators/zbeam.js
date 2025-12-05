import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class ZBeam extends Boxes {
    // Default configuration for test runner and standalone usage
    static get defaultConfig() {
        return {
            x: 100.0,
            y: 100.0,
            z: 100.0,
            h: 100.0,
            outside: false,
            top_edge: "e",
            bottom_edge: "e",
            flanged_ubeam: false
        };
    }

    constructor() {
        super();
        this.argparser.add_argument("--top_edge", {action: "store", type: ArgparseEdgeType("Ffe"), choices: list("Ffe"), default: "e", help: "edge type for top edge"});
        this.argparser.add_argument("--bottom_edge", {action: "store", type: ArgparseEdgeType("Ffe"), choices: list("Ffe"), default: "e", help: "edge type for bottom edge"});
        // this.buildArgParser("x", "y");
        this.argparser.add_argument("--z", {action: "store", type: "float", default: 100.0, help: "inner depth in mm"});
        this.argparser.add_argument("--flanged_ubeam", {action: "store", type: boolarg, default: false, help: "Add a fourth piece to make a U-Beam with a flange"});
        // this.buildArgParser("h", "outside");
        this.addSettingsArgs(edges.FingerJointSettings);
    }

    render() {
        let x;
        let y;
        let z;
        let h;
        [x, y, z, h] = [this.x, this.y, this.z, this.h];
        let t = this.thickness;
        if (this.outside) {
            x = this.adjustSize(x, false);
            y = this.adjustSize(y, false);
            z = this.adjustSize(z, false);
        }
        this.rectangularWall(x, h, (((this.bottom_edge + "F") + this.top_edge) + "e"), {move: "right"});
        this.rectangularWall(y, h, (((this.bottom_edge + "f") + this.top_edge) + "f"), {move: "right"});
        if (this.flanged_ubeam) {
            this.rectangularWall(z, h, (((this.bottom_edge + "F") + this.top_edge) + "F"), {move: "right"});
            this.rectangularWall((y + this.thickness), h, (((this.bottom_edge + "e") + this.top_edge) + "f"));
        }
        else {
            this.rectangularWall(z, h, (((this.bottom_edge + "e") + this.top_edge) + "F"));
        }
    }

}

export { ZBeam };