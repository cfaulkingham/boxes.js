import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { _WallMountedBox  } from '../walledges.js';

class SlottedEdge extends Boxes {
    __call__(length) {
        let n = this.number;
        let t = this.thickness;
        this.polyline(t, 45);
        let l = t;
        for (let i = 0; i < n; i += 1) {
            let w = ((this.min_width * ((n - i) / n)) + (this.max_width * (i / n)));
            let s = ((this.min_strength * ((n - i) / n)) + (this.max_strength * (i / n)));
            if (i === (n - 1)) {
                this.polyline(((w - (s / 2)) + (2 * s)), [-180, (s / 2)], (w - (0.5 * s)), [180, (s / 2)]);
                l += ((s * 2) * (2 ** 0.5));
            }
            else {
                this.polyline(((w - (s / 2)) + (2 * s)), [-180, (s / 2)], (w - (0.5 * s)), [135, (s / 2)], this.extra_distance, [45, (s / 2)]);
                l += (((s * 2) * (2 ** 0.5)) + this.extra_distance);
            }
        }
        this.polyline(0, -45);
        this.edge((length - l));
    }

}

export { SlottedEdge };
class WallWrenchHolder extends _WallMountedBox {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--depth", {action: "store", type: "float", default: 30.0, help: "depth of the sides (in mm)"});
        this.argparser.add_argument("--number", {action: "store", type: "int", default: 11, help: "number of wrenches (in mm)"});
        this.argparser.add_argument("--min_width", {action: "store", type: "float", default: 8.0, help: "width of smallest wrench (in mm)"});
        this.argparser.add_argument("--max_width", {action: "store", type: "float", default: 25.0, help: "width of largest wrench (in mm)"});
        this.argparser.add_argument("--min_strength", {action: "store", type: "float", default: 3.0, help: "strength of smallest wrench (in mm)"});
        this.argparser.add_argument("--max_strength", {action: "store", type: "float", default: 5.0, help: "strength of largest wrench (in mm)"});
        this.argparser.add_argument("--extra_distance", {action: "store", type: "float", default: 0.0, help: "additional distance between wrenches (in mm)"});
    }

    render() {
        this.generateWallEdges();
        let h = (((((this.min_strength + this.max_strength) * this.number) * (2 ** 0.5)) + (this.extra_distance * (this.number - 1))) + this.max_width);
        let t = this.thickness;
        let x = (this.x - (2 * t));
        this.rectangularWall(this.depth, h, ["e", "B", "e", SlottedEdge(this, null)], {move: "right"});
        this.rectangularWall(this.depth, h, ["e", "B", "e", SlottedEdge(this, null)], {move: "right"});
        this.rectangularWall(x, h, "eDed", {move: "right"});
    }

}

export { WallWrenchHolder };