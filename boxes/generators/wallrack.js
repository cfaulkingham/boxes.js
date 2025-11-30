import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class WallRack extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 1.0});
        this.addSettingsArgs(edges.MountingSettings);
        this.addSettingsArgs(edges.HandleEdgeSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--top_edge", {action: "store", type: ArgparseEdgeType("eEGy"), choices: list("eEGy"), default: "G", help: "edge type for top edge"});
        this.argparser.add_argument("--full_height_top", {type: boolarg, default: true, help: "Add full height of topmost rack to the back panel"});
        this.argparser.add_argument("--wall_height", {action: "store", type: "float", default: 20.0, help: "height of walls"});
        this.argparser.add_argument("--back_height", {action: "store", type: "float", default: 1.5, help: "height of the back as fraction of the front height"});
        this.argparser.add_argument("--side_edges", {action: "store", type: ArgparseEdgeType("Fh"), choices: list("Fh"), default: "h", help: "edge type holding the shelves together"});
        this.argparser.add_argument("--flat_bottom", {type: boolarg, default: false, help: "Make bottom Flat, so that the rack can also stand"});
    }

    generate_shelves(x, y, front_height, back_height) {
        let se = this.side_edges;
        for (let i = 0; i < this.sh.length; i += 1) {
            this.rectangularWall(x, y, "ffff", {move: "up", label: /* unknown node JoinedStr */});
            this.rectangularWall(x, front_height, (se + "fef"), {move: "up", label: /* unknown node JoinedStr */});
            this.trapezoidWall(y, front_height, back_height, ((se + "fe") + se), {move: "right", label: /* unknown node JoinedStr */});
            this.trapezoidWall(y, front_height, back_height, ((se + "fe") + se), {move: "up", label: /* unknown node JoinedStr */});
            this.move((y + (this.thickness * 2)), back_height, "left", {before: true});
        }
    }

    generate_finger_holes(x, back_height) {
        let t = this.thickness;
        let pos_y = 0;
        for (let h of this.sh) {
            this.fingerHolesAt((t * 0.5), (pos_y + (0.5 * t)), x, 0);
            this.fingerHolesAt(0, (pos_y + t), back_height, 90);
            this.fingerHolesAt((x + t), (pos_y + t), back_height, 90);
            pos_y += h;
        }
    }

    render() {
        let x;
        let y;
        let front_height;
        [x, y, front_height] = [this.x, this.y, this.wall_height];
        let back_height = (front_height * this.back_height);
        let t = this.thickness;
        if (this.outside) {
            x = this.adjustSize(x, "h", "f");
            y = this.adjustSize(y);
            front_height = this.adjustSize(front_height);
            back_height = this.adjustSize(back_height);
        }
        if (this.full_height_top) {
            let total_height = this.sh.reduce((a, b) => a + b, 0);
        }
        else {
            total_height = (this.sh.slice(0, -1).reduce((a, b) => a + b, 0) + back_height);
        }
        for (let h of (this.full_height_top ? this.sh : this.sh.slice(0, -1))) {
            if (h < back_height) {
                ValueError(/* unknown node JoinedStr */)
            }
        }
        let be = ((this.flat_bottom && this.side_edges === "F") ? "e" : "E");
        if ((be === "E" && this.full_height_top)) {
            total_height -= t;
        }
        this.rectangularWall((x + this.thickness), total_height, (((be + "E") + this.top_edge) + "E"), {callback: [partial(this.generate_finger_holes, x, back_height)], label: "back wall", move: "right"});
        this.generate_shelves(x, y, front_height, back_height);
    }

}

export { WallRack };