import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Console extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 0.5});
        this.addSettingsArgs(edges.StackableSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--front_height", {action: "store", type: "float", default: 30, help: "height of the front below the panel (in mm)"});
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 50, help: "angle of the front panel (90°=upright)"});
    }

    render() {
        let x;
        let y;
        let h;
        let hf;
        [x, y, h, hf] = [this.x, this.y, this.h, this.front_height];
        let t = this.thickness;
        if (this.outside) {
        }
        let panel = Math.min(((h - hf) / Math.cos(((90 - this.angle) * Math.PI / 180))), (y / Math.cos((this.angle * Math.PI / 180))));
        let top = (y - (panel * Math.cos((this.angle * Math.PI / 180))));
        h = (hf + (panel * Math.sin((this.angle * Math.PI / 180))));
        let borders;
        if (top > (0.1 * t)) {
            borders = [y, 90, hf, (90 - this.angle), panel, this.angle, top, 90, h, 90];
        }
        else {
            borders = [y, 90, hf, (90 - this.angle), panel, (this.angle + 90), h, 90];
        }
        if (hf < (0.01 * t)) {
        }
        this.polygonWall(borders, "f", {move: "right"});
        this.polygonWall(borders, "f", {move: "right"});
        this.polygonWalls(borders, x);
    }

}

export { Console };