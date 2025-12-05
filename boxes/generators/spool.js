import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Spool extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--outer_diameter", {action: "store", type: "float", default: 200.0, help: "diameter of the flanges"});
        this.argparser.add_argument("--inner_diameter", {action: "store", type: "float", default: 80.0, help: "diameter of the center part"});
        this.argparser.add_argument("--axle_diameter", {action: "store", type: "float", default: 40.0, help: "diameter of the axle hole (axle not part of drawing)"});
        this.argparser.add_argument("--sides", {action: "store", type: "int", default: 8, help: "number of pieces for the center part"});
        this.argparser.add_argument("--reinforcements", {action: "store", type: "int", default: 8, help: "number of reinforcement ribs per side"});
        this.argparser.add_argument("--reinforcement_height", {action: "store", type: "float", default: 0.0, help: "height of reinforcement ribs on the flanges"});
    }

    sideCB() {
        this.hole(0, 0, {d: this.axle_diameter});
        let r;
        let h;
        let side;
        [r, h, side] = this.regularPolygon(this.sides);
        let t = this.thickness;
        for (let i = 0; i < this.sides; i += 1) {
            this.fingerHolesAt((-side / 2), (h + (0.5 * this.thickness)), side, 0);
            this.moveTo(0, 0, (360 / this.sides));
        }
        if (this.reinforcement_height) {
            for (let i = 0; i < this.reinforcements; i += 1) {
                this.fingerHolesAt((this.axle_diameter / 2), 0, (h - (this.axle_diameter / 2)), 0);
                this.fingerHolesAt((r + t), 0, (((this.outer_diameter / 2) - r) - t), 0);
                this.moveTo(0, 0, (360 / this.reinforcements));
            }
        }
    }

    reinforcementCB() {
        for (let i = 0; i < this.reinforcements; i += 1) {
            this.fingerHolesAt((this.axle_diameter / 2), 0, (((this.inner_diameter - this.axle_diameter) / 2) + this.thickness), 0);
            this.moveTo(0, 0, (360 / this.reinforcements));
        }
    }

    render() {
        let t = this.thickness;
        let r;
        let h;
        let side;
        [r, h, side] = this.regularPolygon(this.sides);
        for (let i = 0; i < 2; i += 1) {
            this.parts.disc(this.outer_diameter, {callback: this.sideCB, move: "right"});
        }
        for (let i = 0; i < this.sides; i += 1) {
            this.rectangularWall(side, this.h, "fefe", {move: "right"});
        }
        if (this.reinforcement_height) {
            for (let i = 0; i < (this.reinforcements * 2); i += 1) {
                let edge = new edges.CompoundEdge(this, "fef", [(((this.outer_diameter / 2) - r) - t), ((r - h) + t), (h - (this.axle_diameter / 2))]);
                this.trapezoidWall((this.reinforcement_height - t), ((this.outer_diameter - this.axle_diameter) / 2), (((this.inner_diameter - this.axle_diameter) / 2) + t), ["e", "f", "e", edge], {move: "right"});
            }
            for (let i = 0; i < 2; i += 1) {
                this.parts.disc((this.inner_diameter + (2 * t)), {hole: this.axle_diameter, callback: this.reinforcementCB, move: "right"});
            }
        }
    }

}

export { Spool };