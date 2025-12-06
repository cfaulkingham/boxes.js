import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import '../globals.js';

const { boolarg } = global;

class DiceTower extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.argparser.add_argument("--width", {action: "store", type: "float", default: 80.0, help: "width of the tower (side where the dice fall out)"});
        this.argparser.add_argument("--depth", {action: "store", type: "float", default: 80.0, help: "depth of the tower"});
        this.argparser.add_argument("--height", {action: "store", type: "float", default: 170.0, help: "height of the tower"});
        // this.buildArgParser("outside");
        this.argparser.add_argument("--bottom", {action: "store", type: boolarg, default: true, help: "include bottom piece"});
        this.argparser.add_argument("--ramps", {action: "store", type: "int", default: 3, help: "number of ramps in the tower"});
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 30.0, help: "angle of the ramps in the tower"});
    }

    side() {
        let a = (this.angle * Math.PI / 180);
        let pos_x = this.left_ramp_cutoff;
        let pos_y = ((this.depth - this.left_ramp_cutoff) * Math.tan(a));
        this.fingerHolesAt(pos_x, pos_y, this.ramp_len, -this.angle);
        let top_gap = (4 * this.thickness);
        let section_height = (((this.height - pos_y) - top_gap) / (this.ramps - 1));
        for (let i = 0; i < (this.ramps - 1); i += 1) {
            let pos_y_i = (pos_y + (section_height * (i + 1)));
            this.ramp(pos_x, pos_y_i, (i % 2) === 0);
        }
    }

    ramp(pos_x, pos_y, mirror) {
        if (mirror) {
            this.fingerHolesAt((this.depth - pos_x), pos_y, (0.5 * this.ramp_len), (180 + this.angle));
        }
        else {
            this.fingerHolesAt(pos_x, pos_y, (0.5 * this.ramp_len), -this.angle);
        }
    }

    render() {
        if (this.outside) {
            this.width = this.adjustSize(this.width);
            this.depth = this.adjustSize(this.depth);
            this.height = this.adjustSize(this.height);
        }
        let a = (this.angle * Math.PI / 180);
        this.left_ramp_cutoff = ((0.5 * this.thickness) * Math.sin(a));
        this.right_ramp_cutoff = (((0.5 * this.thickness) / Math.tan(a)) * Math.cos(a));
        this.ramp_len = (((this.depth - this.left_ramp_cutoff) - this.right_ramp_cutoff) / Math.cos(a));
        let front_gap = (this.depth * Math.tan(a));
        let front_edge = new edges.CompoundEdge(this, "Ef", [front_gap, (this.height - front_gap)]);
        let bottom_edge = (this.bottom ? "F" : "e");
        this.rectangularWall(this.depth, this.height, [bottom_edge, front_edge, "e", "f"], {callback: [this.side], move: "mirror right", label: "side"});
        this.rectangularWall(this.width, this.height, [bottom_edge, "F", "e", "F"], {move: "right", label: "back"});
        this.rectangularWall(this.depth, this.height, [bottom_edge, front_edge, "e", "f"], {callback: [this.side], move: "right", label: "side"});
        this.rectangularWall(this.width, (this.height - front_gap), ["e", "F", "e", "F"], {move: "right", label: "front"});
        if (this.bottom) {
            this.rectangularWall(this.width, this.depth, "Efff", {move: "right", label: "bottom"});
        }
        this.rectangularWall(this.width, this.ramp_len, "efef", {move: "up", label: "ramp"});
        for (let _ = 0; _ < (this.ramps - 1); _ += 1) {
            this.rectangularWall(this.width, (0.5 * this.ramp_len), "efef", {move: "up", label: "ramp"});
        }
    }

}

export { DiceTower };