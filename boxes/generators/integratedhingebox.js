import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class IntegratedHingeBox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.ChestHingeSettings);
        // this.buildArgParser("x", "y", "h", "outside");
        this.argparser.add_argument("--lidheight", {action: "store", type: "float", default: 20.0, help: "height of lid in mm"});
    }

    render() {
        let x;
        let y;
        let h;
        let hl;
        [x, y, h, hl] = [this.x, this.y, this.h, this.lidheight];
        if (this.outside) {
            x = this.adjustSize(x);
            y = this.adjustSize(y);
            h = this.adjustSize(h);
        }
        let t = this.thickness;
        let hy = this.edges["O"].startwidth();
        let hy2 = this.edges["P"].startwidth();
        let e1 = edges.CompoundEdge(this, "Fe", [(h - hy), hy]);
        let e2 = edges.CompoundEdge(this, "eF", [hy, (h - hy)]);
        let e_back = ["F", e1, "e", e2];
        this.rectangularWall(y, (h - hy), "FfOf", {ignore_widths: [2], move: "up"});
        this.rectangularWall(y, (hl - hy2), "pfFf", {ignore_widths: [1], move: "up"});
        this.rectangularWall(y, (h - hy), "Ffof", {ignore_widths: [5], move: "up"});
        this.rectangularWall(y, (hl - hy2), "PfFf", {ignore_widths: [6], move: "up"});
        this.rectangularWall(x, h, "FFeF", {move: "up"});
        this.rectangularWall(x, h, e_back, {move: "up"});
        this.rectangularWall(x, hl, "FFeF", {move: "up"});
        this.rectangularWall(x, (hl - hy2), "FFqF", {move: "up"});
        this.rectangularWall(y, x, "ffff", {move: "up"});
        this.rectangularWall(y, x, "ffff");
    }

}

export { IntegratedHingeBox };