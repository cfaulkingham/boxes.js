import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { BayonetBox  } from './bayonetbox.js';

class FilamentSpool extends BayonetBox {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--outer_diameter", {action: "store", type: "float", default: 200.0, help: "diameter of the flanges"});
        this.argparser.add_argument("--inner_diameter", {action: "store", type: "float", default: 100.0, help: "diameter of the center part"});
        this.argparser.add_argument("--axle_diameter", {action: "store", type: "float", default: 50.0, help: "diameter of the axle hole"});
        this.argparser.add_argument("--sides", {action: "store", type: "int", default: 8, help: "number of pieces for the center part"});
        this.argparser.add_argument("--alignment_pins", {action: "store", type: "float", default: 1.0, help: "diameter of the alignment pins"});
    }

    leftsideCB() {
        this.hole(0, 0, {d: this.axle_diameter});
        let r;
        let h;
        let side;
        [r, h, side] = this.regularPolygon(this.sides, this.inner_diameter / 2);
        for (let i = 0; i < this.sides; i += 1) {
            this.fingerHolesAt((-side / 2), (h + (0.5 * this.thickness)), side, 0);
            this.moveTo(0, 0, (360 / this.sides));
        }
        this.outerHolesCB();
    }

    outerHolesCB() {
        let t = this.thickness;
        for (let i = 0; i < 6; i += 1) {
            for (let j = 0; j < 2; j += 1) {
                this.rectangularHole(0, ((this.outer_diameter / 2) - 7.0), (((this.outer_diameter * Math.PI) / 360) * 8), 5, {r: 2.5});
                this.moveTo(0, 0, 10);
            }
            this.moveTo(0, 0, ((360 / 6) - 20));
        }
        this.rectangularHole(((this.outer_diameter + this.inner_diameter) / 4), 0, (((this.outer_diameter - this.inner_diameter) / 2) - (4 * t)), t, {r: (t / 2)});
    }

    render() {
        let t = this.thickness;
        this.inner_diameter -= (2 * t);
        let r;
        let h;
        let side;
        [r, h, side] = this.regularPolygon(this.sides, this.inner_diameter / 2);
        this.diameter = (2 * h);
        this.lugs = this.sides;
        this.parts.disc(this.outer_diameter, {callback: () => this.leftsideCB(), move: "right"});
        this.parts.disc(this.outer_diameter, {hole: this.axle_diameter, callback: () => { this.alignmentHoles(true); this.outerHolesCB(); }, move: "right"});
        this.regularPolygonWall(this.sides, {r: (this.inner_diameter / 2), edges: "f", callback: [() => this.upperCB()], move: "right"});
        this.parts.disc(this.diameter, {callback: () => this.lowerCB(), move: "right"});
        for (let i = 0; i < this.sides; i += 1) {
            this.rectangularWall(side, (this.h - t), "feFe", {callback: [() => this.hole((side / 2), (this.h - (2 * t)))], move: "right"});
        }
    }

}

export { FilamentSpool };