import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Planetary2 extends Boxes {
    constructor() {
        super();
        // this.buildArgParser("nema_mount");
        this.argparser.add_argument("--profile", {action: "store", type: "str", default: "GT2_2mm", choices: pulley.Pulley.getProfiles(), help: "profile of the teeth/belt"});
        this.argparser.add_argument("--sunteeth", {action: "store", type: "int", default: 20, help: "number of teeth on sun gear"});
        this.argparser.add_argument("--planetteeth", {action: "store", type: "int", default: 20, help: "number of teeth on planets"});
        this.argparser.add_argument("--maxplanets", {action: "store", type: "int", default: 0, help: "limit the number of planets (0 for as much as fit)"});
        this.argparser.add_argument("--deltateeth", {action: "store", type: "int", default: 1, help: "enable secondary ring with given delta to the ring gear"});
        this.argparser.add_argument("--modulus", {action: "store", type: "float", default: 1.0, help: "modulus of the teeth in mm"});
        this.argparser.add_argument("--shaft", {action: "store", type: "float", default: 6.0, help: "diameter of the shaft"});
        this.argparser.add_argument("--screw1", {action: "store", type: "float", default: 2.4, help: "diameter of lower part of the screw hole"});
        this.argparser.add_argument("--screw2", {action: "store", type: "float", default: 4.0, help: "diameter of upper part of the screw hole"});
        this.argparser.add_argument("--pinsize", {action: "store", type: "float", default: 3.1, help: "diameter of alignment pins"});
    }

    pins(r, rh, nr, angle) {
        this.moveTo(0, 0, angle);
        let ang;
        if (nr < 8) {
            ang = (20 + (10 * nr));
        }
        else {
            ang = (15 + (10 * (nr - 8)));
        }
        ang = (180 - ang);
        for (let a of [0, ang, -ang]) {
            this.moveTo(0, 0, a);
            this.hole(r, 0, rh);
            this.moveTo(0, 0, -a);
        }
    }

    render() {
        let ringteeth = (this.sunteeth + (2 * this.planetteeth));
        let t = this.thickness;
        let spoke_width = (4 * t);
        let pinsize = (this.pinsize / 2.0);
        let pitch1;
        let size1;
        let xxx;
        [pitch1, size1, xxx] = this.gears.sizes();
        let pitch2;
        let size2;
        [pitch2, size2, xxx] = this.gears.sizes();
        let pitch3;
        let size3;
        [pitch3, size3, xxx] = this.gears.sizes();
        let planets = parseInt((Math.PI / Math.asin((float((this.planetteeth + 2)) / (this.planetteeth + this.sunteeth)))));
        if (this.maxplanets) {
            planets = Math.min(this.maxplanets, planets);
        }
        let ta = (this.sunteeth + ringteeth);
        let planetpositions = [];
        for (let i = 0; i < planets; i++) {
            planetpositions.push((360 * i) / planets);
        }
        let secondary_offsets = planetpositions.map(() => 0);
        let ratio = ((1 + (ringteeth / this.sunteeth)) * (-ringteeth / this.deltateeth));
        let profile_shift = 20;
        let pressure_angle = 20;
        let screw = (this.screw1 / 2);
        let belt = this.profile;
        let pulleyteeth = parseInt((((size3 - (2 * t)) * Math.PI) / pulley.Pulley.spacing[belt][1]));
        let numplanets = planets;
        let deltamodulus = ((this.modulus * ringteeth) / (ringteeth - this.deltateeth));
        const holes = (r) => {
            const h = () => {
                this.hole((2 * t), (2 * t), r);
                this.hole((size3 - (2 * t)), (2 * t), r);
                this.hole((2 * t), (size3 - (2 * t)), r);
                this.hole((size3 - (2 * t)), (size3 - (2 * t)), r);
            };

            return h;
        };

        const planets = () => {
            this.moveTo((size3 / 2), (size3 / 2));
            for (let angle of planetpositions) {
                angle += 180;
                this.moveTo(0, 0, angle);
                this.hole((pitch1 + pitch2), 0, (size2 / 2));
                this.moveTo(0, 0, -angle);
            }
        };

        this.rectangularWall(size3, size3, {callback: [() => this.NEMA(this.nema_mount, (size3 / 2), (size3 / 2)), holes(screw), planets], move: "up"});
        const gear = () => {
            this.moveTo((size3 / 2), (size3 / 2));
            this.gears({teeth: ringteeth, dimension: this.modulus, angle: pressure_angle, internal_ring: true, spoke_width: spoke_width, teeth_only: true, profile_shift: profile_shift, move: "up"});
        };

        this.rectangularWall(size3, size3, {callback: [gear, holes(screw)], move: "up"});
        let tl = (((0.5 * size3) * ((2 ** 0.5) - 1)) * (2 ** 0.5));
        screw = (this.screw2 / 2);
        this.rectangularTriangle(tl, tl, {num: 8, callback: [null, () => this.hole((2 * t), (2 * t), screw)], move: "up"});
        const ring = () => {
            this.gears({teeth: (ringteeth - this.deltateeth), dimension: deltamodulus, angle: pressure_angle, internal_ring: true, spoke_width: spoke_width, teeth_only: true, profile_shift: profile_shift});
            for (let i = 0; i < 3; i += 1) {
                this.hole((((size3 - (6 * t)) / 2) + (0.5 * pinsize)), 0, pinsize);
                this.moveTo(0, 0, 120);
            }
        };

        this.pulley(pulleyteeth, belt, {callback: ring, move: "up"});
        this.pulley(pulleyteeth, belt, {callback: ring, move: "up"});
        this.rectangularWall(size3, size3, {callback: [gear, holes(screw)], move: "up"});
        this.rectangularWall(size3, size3, {callback: [holes(screw)], move: "up"});
        const sunpins = () => {
            this.hole(((0.5 * this.shaft) + (1.5 * pinsize)), 0, pinsize);
            this.hole(((-0.5 * this.shaft) - (1.5 * pinsize)), 0, pinsize);
        };

        this.partsMatrix(4, 4, "up", this.gears, {teeth: this.sunteeth, dimension: this.modulus, callback: sunpins, angle: pressure_angle, mount_hole: this.shaft, profile_shift: profile_shift});
        for (let i = 0; i < numplanets; i += 1) {
            this.ctx.save();
            this.gears({teeth: this.planetteeth, dimension: this.modulus, angle: pressure_angle, callback: () => this.pins((0.25 * size2), pinsize, i), profile_shift: profile_shift, move: "right"});
            for (let j = 0; j < 2; j += 1) {
                this.gears({teeth: this.planetteeth, dimension: this.modulus, angle: pressure_angle, callback: () => this.pins((0.25 * size2), pinsize, i, secondary_offsets[i]), profile_shift: profile_shift, move: "right"});
                this.gears({teeth: this.planetteeth, dimension: this.modulus, angle: pressure_angle, callback: () => this.pins((0.25 * size2), pinsize, i), profile_shift: profile_shift, move: "right"});
            }
            this.ctx.restore();
            this.gears({teeth: this.planetteeth, dimension: this.modulus, angle: pressure_angle, profile_shift: profile_shift, move: "up only"});
        }
        this.text(("1:%.1f" % abs(ratio)));
    }

}

export { Planetary2 };