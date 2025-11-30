import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class BurnTest extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--step", {action: "store", type: "float", default: 0.01, help: "increases in burn value between the sides"});
        this.argparser.add_argument("--pairs", {action: "store", type: "int", default: 2, help: "number of pairs (each testing four burn values)"});
        this.argparser.add_argument("--date", {action: "store", type: boolarg, default: false, help: "add current date etching to each piece"});
        this.argparser.add_argument("--id", {action: "store", type: "str", default: "", help: "add identifier etching to each piece"});
    }

    render() {
        let font = /* unknown node Dict */;
        let font_meta = font.copy();
        let today = date.today.strftime("%Y-%m-%d");
        let x;
        let s;
        [x, s] = [this.x, this.step];
        let t = this.thickness;
        this.moveTo(t, t);
        for (let cnt = 0; cnt < this.pairs; cnt += 1) {
            for (let i = 0; i < 4; i += 1) {
                this.text(("%.3fmm" % this.burn), (x / 2), t, {None: font});
                if ((this.date && i === 3)) {
                    this.text(today, (x / 2), 20, {None: font_meta});
                }
                if ((this.id && i === 1)) {
                    this.text(this.id, (x / 2), 20, {None: font_meta});
                }
                this.edges["f"](x);
                this.corner(90);
                this.burn += s;
            }
            this.burn -= (4 * s);
            this.moveTo(((x + (2 * t)) + this.spacing), -t);
            for (let i = 0; i < 4; i += 1) {
                this.text(("%.3fmm" % this.burn), (x / 2), t, {None: font});
                if ((this.date && i === 3)) {
                    this.text(today, (x / 2), 20, {None: font_meta});
                }
                if ((this.id && i === 1)) {
                    this.text(this.id, (x / 2), 20, {None: font_meta});
                }
                this.edges["F"](x);
                this.polyline(t, 90, t);
                this.burn += s;
            }
            this.moveTo(((x + (2 * t)) + this.spacing), t);
        }
    }

}

export { BurnTest };