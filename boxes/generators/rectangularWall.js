import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class RectangularWall extends Boxes {
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
        this.argparser.add_argument("--bottom_edge", {action: "store", type: ArgparseEdgeType("cCdDeEfFghiIjJkKlLmMnNoOpPqQRsSšŠuUvV"), choices: list("cCdDeEfFghiIjJkKlLmMnNoOpPqQRsSšŠuUvV"), default: "e", help: "edge type for bottom edge"});
        this.argparser.add_argument("--right_edge", {action: "store", type: ArgparseEdgeType("cCdDeEfFghiIjJkKlLmMnNoOpPqQRsSšŠuUvV"), choices: list("cCdDeEfFghiIjJkKlLmMnNoOpPqQRsSšŠuUvV"), default: "e", help: "edge type for right edge"});
        this.argparser.add_argument("--top_edge", {action: "store", type: ArgparseEdgeType("cCdDeEfFghiIjJkKlLmMnNoOpPqQRsSšŠuUvV"), choices: list("cCdDeEfFghiIjJkKlLmMnNoOpPqQRsSšŠuUvV"), default: "e", help: "edge type for top edge"});
        this.argparser.add_argument("--left_edge", {action: "store", type: ArgparseEdgeType("cCdDeEfFghiIjJkKlLmMnNoOpPqQRsSšŠuUvV"), choices: list("cCdDeEfFghiIjJkKlLmMnNoOpPqQRsSšŠuUvV"), default: "e", help: "edge type for left edge"});
    }

    cb(nr) {
        let t = this.thickness;
        if (this.edgetypes[nr] === "f") {
            this.fingerHolesAt(0, (-2.5 * t), ((nr % 2) ? this.h : this.x), 0);
        }
    }

    render() {
        let t = this.thickness;
        this.edgetypes = [this.bottom_edge, this.right_edge, this.top_edge, this.left_edge];
        this.moveTo((3 * t), (3 * t));
        this.rectangularWall(this.x, this.h, this.edgetypes, {callback: this.cb});
    }

}

export { RectangularWall };