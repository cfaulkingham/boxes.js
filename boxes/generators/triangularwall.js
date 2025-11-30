import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class TriangularWall extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.CabinetHingeSettings);
        this.addSettingsArgs(edges.ClickSettings);
        this.addSettingsArgs(edges.DoveTailSettings);
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.GearSettings);
        this.addSettingsArgs(edges.GripSettings);
        this.addSettingsArgs(edges.HingeSettings);
        this.addSettingsArgs(edges.ChestHingeSettings);
        this.addSettingsArgs(edges.SlideOnLidSettings);
        this.addSettingsArgs(edges.StackableSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 20, help: "radius to strengthen the corners"});
        this.argparser.add_argument("--bottom_edge", {action: "store", type: ArgparseEdgeType("cCdDeEfFghiIjJkKlLmMnNoOpPqQRsSšŠuUvV"), choices: list("cCdDeEfFghiIjJkKlLmMnNoOpPqQRsSšŠuUvV"), default: "e", help: "edge type for bottom edge"});
        this.argparser.add_argument("--right_edge", {action: "store", type: ArgparseEdgeType("cCdDeEfFghiIjJkKlLmMnNoOpPqQRsSšŠuUvV"), choices: list("cCdDeEfFghiIjJkKlLmMnNoOpPqQRsSšŠuUvV"), default: "e", help: "edge type for right edge"});
        this.argparser.add_argument("--left_edge", {action: "store", type: ArgparseEdgeType("cCdDeEfFghiIjJkKlLmMnNoOpPqQRsSšŠuUvV"), choices: list("cCdDeEfFghiIjJkKlLmMnNoOpPqQRsSšŠuUvV"), default: "e", help: "edge type for left edge"});
    }

    cb(nr) {
        let t = this.thickness;
        let x;
        let h;
        let r;
        [x, h, r] = [this.x, this.h, this.radius];
        r = Math.min(r, x, h);
        let l = [x, h, ((((x - r) ** 2) + ((h - r) ** 2)) ** 0.5)][nr];
        if (this.edgetypes[nr] === "f") {
            this.fingerHolesAt(0, (-2.5 * t), l, 0);
        }
    }

    render() {
        let t = this.thickness;
        this.edgetypes = [this.bottom_edge, this.right_edge, this.left_edge];
        this.moveTo((3 * t), (3 * t));
        this.rectangularTriangle(this.x, this.h, this.edgetypes, {callback: this.cb, r: this.radius});
    }

}

export { TriangularWall };