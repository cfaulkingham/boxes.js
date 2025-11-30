import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class HingeBox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.CabinetHingeSettings);
        // this.buildArgParser("x", "y", "h", "outside");
        this.argparser.add_argument("--lidheight", {action: "store", type: "float", default: 20.0, help: "height of lid in mm"});
        this.argparser.add_argument("--splitlid", {action: "store", type: "float", default: 0.0, help: "split the lid in y direction (mm)"});
    }

    render() {
        let x;
        let y;
        let h;
        let hl;
        [x, y, h, hl] = [this.x, this.y, this.h, this.lidheight];
        let s = this.splitlid;
        if (this.outside) {
            x = this.adjustSize(x);
            y = this.adjustSize(y);
            h = this.adjustSize(h);
            s = this.adjustSize(s, null);
        }
        if ((s > x || s < 0.0)) {
            s = 0.0;
        }
        let t = this.thickness;
        if (s) {
            this.rectangularWall(x, h, "FFuF", {move: "right"});
        }
        else {
            this.rectangularWall(x, h, "FFeF", {move: "right"});
        }
        this.rectangularWall(y, h, "Ffef", {move: "up"});
        this.rectangularWall(y, h, "Ffef");
        this.rectangularWall(x, h, "FFuF", {move: "left up"});
        this.rectangularWall(x, hl, "UFFF", {move: "right"});
        if (s) {
            this.rectangularWall(s, hl, "eeFf", {move: "right"});
            this.rectangularWall((y - s), hl, "efFe", {move: "up"});
            this.rectangularWall((y - s), hl, "eeFf");
            this.rectangularWall(s, hl, "efFe", {move: "left"});
            this.rectangularWall(x, hl, "UFFF", {move: "left up"});
        }
        else {
            this.rectangularWall(y, hl, "efFf", {move: "up"});
            this.rectangularWall(y, hl, "efFf");
            this.rectangularWall(x, hl, "eFFF", {move: "left up"});
        }
        this.rectangularWall(x, y, "ffff", {move: "right only"});
        this.rectangularWall(x, y, "ffff");
        if (s) {
            this.rectangularWall(x, s, "ffef", {move: "left up"});
            this.rectangularWall(x, (y - s), "efff", {move: "up"});
        }
        else {
            this.rectangularWall(x, y, "ffff", {move: "left up"});
        }
        this.edges["u"].parts({move: "up"});
        if (s) {
            this.edges["u"].parts({move: "up"});
        }
    }

}

export { HingeBox };