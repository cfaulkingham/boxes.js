import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class SkadisBoard extends Boxes {
    constructor() {
        super();
        this.argparser.add_argument("--columns", {action: "store", type: "int", default: 17, help: "Number of holes left to right counting both even and odd rows"});
        this.argparser.add_argument("--rows", {action: "store", type: "int", default: 27, help: "Number of rows of holes top to bottom"});
    }

    CB() {
        for (let r = 0; r < this.rows; r += 1) {
            for (let c = 0; c < this.columns; c += 1) {
                if (((r + c) % 2) === 0) {
                }
                this.rectangularHole((((c + 1) * 20) - 8), ((r + 1) * 20), 5, 15, {r: 2.5});
            }
        }
    }

    render() {
        this.roundedPlate(((this.columns + 1) * 20), ((this.rows + 1) * 20), {edge: "e", r: 8, extend_corners: false, callback: [this.CB], move: "up"});
        this.partsMatrix(8, 4, "up", this.parts.disc, 15, 5);
    }

}

export { SkadisBoard };