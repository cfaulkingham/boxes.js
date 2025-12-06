import { Boxes } from '../boxes.js';
import { edges } from '../edges.js';
import { Color } from '../Color.js';

class BurnTest extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.buildArgParser({x: 100});
        this.argparser.add_argument("--step", {action: "store", type: "float", default: 0.01, help: "increases in burn value between the sides"});
        this.argparser.add_argument("--pairs", {action: "store", type: "int", default: 2, help: "number of pairs (each testing four burn values)"});
        this.argparser.add_argument("--date", {action: "store", type: boolarg, default: false, help: "add current date etching to each piece"});
        this.argparser.add_argument("--id", {action: "store", type: "str", default: "", help: "add identifier etching to each piece"});
    }

    render() {
        // Font settings: text(text, x, y, angle, align, fontsize, color, font)
        const fontsize = this.x < 81 ? 12.5 * this.x / 100 : 10;
        const fontsize_meta = fontsize * 0.75;
        const align = "center";
        const color = Color.ETCHING;

        const today = new Date().toISOString().slice(0, 10);  // Format: YYYY-MM-DD

        const x = this.x;
        const s = this.step;
        const t = this.thickness;

        this.moveTo(t, t);

        for (let cnt = 0; cnt < this.pairs; cnt++) {
            for (let i = 0; i < 4; i++) {
                this.text(`${this.burn.toFixed(3)}mm`, x / 2, t, 0, align, fontsize, color);
                if (this.date && i === 3) {
                    this.text(today, x / 2, 20, 0, align, fontsize_meta, color);
                }
                if (this.id && i === 1) {
                    this.text(this.id, x / 2, 20, 0, align, fontsize_meta, color);
                }
                this.edges["f"].draw(x);
                this.corner(90);
                this.burn += s;
            }

            this.burn -= 4 * s;
            this.moveTo(x + 2 * t + this.spacing, -t);

            for (let i = 0; i < 4; i++) {
                this.text(`${this.burn.toFixed(3)}mm`, x / 2, t, 0, align, fontsize, color);
                if (this.date && i === 3) {
                    this.text(today, x / 2, 20, 0, align, fontsize_meta, color);
                }
                if (this.id && i === 1) {
                    this.text(this.id, x / 2, 20, 0, align, fontsize_meta, color);
                }
                this.edges["F"].draw(x);
                this.polyline(t, 90, t);
                this.burn += s;
            }

            this.moveTo(x + 2 * t + this.spacing, t);
        }
    }
}

export { BurnTest };