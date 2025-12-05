import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { Console2  } from './console2.js';

class SideDoorHousing extends Console2 {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 0.5});
        this.addSettingsArgs(edges.StackableSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--double_door", {action: "store", type: boolarg, default: true, help: "allow removing the backwall, too"});
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let t = this.thickness;
        let bottom = this.edges.get(this.bottom_edge);
        this.rectangularWall(x, y, "ffff", {move: "right"});
        if (this.double_door) {
            this.rectangularWall(x, y, "EFEF", {move: "right"});
        }
        else {
            this.rectangularWall(x, y, "EFFF", {move: "right"});
        }
        for (let move of ["right", "mirror right"]) {
            let re = new edges.CompoundEdge(this, ["f", "e"], [(bottom.endwidth() + t), (h - t)]);
            if (this.double_door) {
                let le = new edges.CompoundEdge(this, ["e", "f"], [(h - t), (bottom.endwidth() + t)]);
            }
            else {
                le = "f";
            }
            this.rectangularWall(y, h, [bottom, re, "f", le], {ignore_widths: [1, 6], callback: [null, null, () => [this.rectangularHole((1.55 * t), latchpos, (1.1 * t), (1.1 * t)), (this.double_door && this.rectangularHole((y - (1.55 * t)), latchpos, (1.1 * t), (1.1 * t)))]], move: move});
        }
        for (let i = 0; i < (this.double_door ? 2 : 1); i += 1) {
            this.rectangularWall(x, t, [bottom, "F", "e", "F"], {ignore_widths: [1, 6], move: "up"});
            this.rectangularWall(x, (h - (1.1 * t)), "eEeE", {callback: [() => this.fingerHolesAt((0.5 * t), 0, ((h - (4.05 * t)) - latchpos)), () => this.latch_hole(((h - (1.2 * t)) - latchpos)), () => this.fingerHolesAt((0.5 * t), ((3.05 * t) + latchpos), ((h - (4.05 * t)) - latchpos)), () => this.latch_hole(latchpos)], move: "right"});
            this.rectangularWall(x, t, [bottom, "F", "e", "F"], {ignore_widths: [1, 6], move: "down only"});
        }
        if (!this.double_door) {
            this.rectangularWall(x, h, [bottom, "F", "f", "F"], {ignore_widths: [1, 6], move: "right"});
        }
        if (this.double_door) {
            let latches = 4;
        }
        else {
            latches = 2;
        }
        this.partsMatrix(latches, 0, "right", this.rectangularWall, (2 * t), ((h - (4.05 * t)) - latchpos), "EeEf");
        this.partsMatrix(latches, 2, "up", this.latch);
        this.partsMatrix((2 * latches), 2, "up", this.latch_clamp);
    }

}

export { SideDoorHousing };