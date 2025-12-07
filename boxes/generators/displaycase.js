import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class DisplayCase extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser("x", "y", "h", "outside");
        this.argparser.add_argument("--overhang", {action: "store", type: "float", default: 2, help: "overhang for joints in mm"});
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        if (this.outside) {
            x = this.adjustSize(x);
            y = this.adjustSize(y);
            h = this.adjustSize(h);
        }
        let t = this.thickness;
        let d2 = new edges.Bolts(2);
        let d3 = new edges.Bolts(3);
        this.rectangularWall(x, h, "ffff", {bedBolts: [d2, d2, d2, d2], move: "right", label: "Wall 1"});
        this.rectangularWall(y, h, "fFfF", {bedBolts: [d3, d2, d3, d2], move: "up", label: "Wall 2"});
        this.rectangularWall(y, h, "fFfF", {bedBolts: [d3, d2, d3, d2], label: "Wall 4"});
        this.rectangularWall(x, h, "ffff", {bedBolts: [d2, d2, d2, d2], move: "left up", label: "Wall 3"});
        this.flangedWall(x, y, "FFFF", {flanges: [this.overhang, this.overhang, this.overhang, this.overhang], move: "right", label: "Top"});
        this.flangedWall(x, y, "FFFF", {flanges: [this.overhang, this.overhang, this.overhang, this.overhang], label: "Bottom"});
    }

}

export { DisplayCase };