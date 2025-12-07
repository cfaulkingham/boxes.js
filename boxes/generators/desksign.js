import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import '../globals.js';

const { boolarg } = global;

class Desksign extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.StackableSettings, {width: 2.0});
        this.argparser.add_argument("--width", {action: "store", type: "float", default: 150, help: "plate width in mm (excluding holes)"});
        this.argparser.add_argument("--height", {action: "store", type: "float", default: 80, help: "plate height in mm"});
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 60, help: "plate angle in degrees (90 is vertical)"});
        this.argparser.add_argument("--label", {action: "store", type: "str", default: "DeskSign\nBoxes.py", help: "optional text to engrave (leave blank to omit)"});
        this.argparser.add_argument("--fontsize", {action: "store", type: "float", default: 20, help: "height of text"});
        this.argparser.add_argument("--feet", {action: "store", type: boolarg, default: false, help: "add raised feet"});
        this.argparser.add_argument("--mirror", {action: "store", type: boolarg, default: true, help: "mirrors one of the stand so the same side of the material can be placed on the outside"});
        this.argparser.add_argument("--verticaltextoffset", {action: "store", type: "float", default: 0, help: "vertical offset of text in mm from the default centered location"});
    }

    render() {
        let width = this.width;
        let height = this.height;
        let angle = this.angle;
        let feet = this.feet;
        let mirror = this.mirror;
        let label = this.label;
        let verticaltextoffset = this.verticaltextoffset;
        let t = this.thickness;
        if (!(0 < angle && angle < 90)) {
            ValueError("angle has to between 0 and 90 degrees")
        }
        let base = (Math.cos((angle * Math.PI / 180)) * height);
        let h = (Math.sin((angle * Math.PI / 180)) * height);
        let fontsize = this.fontsize;
        if ((label && fontsize)) {
            this.rectangularWall(width, height, "eheh", {move: "right", callback: [() => this.text(label, (width / 2), ((height / 2) + verticaltextoffset))]});
        }
        else {
            this.rectangularWall(width, height, "eheh", {move: "right"});
        }
        let edge = (feet ? "šef" : "eef");
        if (mirror) {
            this.rectangularTriangle(base, h, edge, {num: 1, move: "right"});
            this.rectangularTriangle(base, h, edge, {num: 1, move: "mirror right"});
        }
        else {
            this.rectangularTriangle(base, h, edge, {num: 2, move: "right"});
        }
    }

}

export { Desksign };