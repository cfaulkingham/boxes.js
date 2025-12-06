import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Planetary extends Boxes {
    constructor() {
        super();
        this.argparser.add_argument("--sunteeth", {action: "store", type: "int", default: 8, help: "number of teeth on sun gear"});
        this.argparser.add_argument("--planetteeth", {action: "store", type: "int", default: 20, help: "number of teeth on planets"});
        this.argparser.add_argument("--maxplanets", {action: "store", type: "int", default: 0, help: "limit the number of planets (0 for as much as fit)"});
        this.argparser.add_argument("--deltateeth", {action: "store", type: "int", default: 0, help: "enable secondary ring with given delta to the ring gear"});
        this.argparser.add_argument("--modulus", {action: "store", type: "float", default: 3, help: "modulus of the theeth in mm"});
        this.argparser.add_argument("--shaft", {action: "store", type: "float", default: 6.0, help: "diameter of the shaft"});
    }

    render() {
        let ringteeth = (this.sunteeth + (2 * this.planetteeth));
        let spoke_width = (3 * this.shaft);
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
        let t = this.thickness;
        let planets = parseInt((Math.PI / Math.asin((float((this.planetteeth + 2)) / (this.planetteeth + this.sunteeth)))));
        if (this.maxplanets) {
            planets = Math.min(this.maxplanets, planets);
        }
        let ta = (this.sunteeth + ringteeth);
        let planetpositions;
        if ((ta % planets)) {
            // Generate positions for planets when not evenly divisible
            planetpositions = [];
            for (let i = 0; i < planets; i++) {
                planetpositions.push((360 * i) / planets);
            }
        }
        else {
            planetpositions = planets;
        }
        let profile_shift = 20;
        let pressure_angle = 20;
        this.parts.disc(size3, {callback: () => this.hole(0, 0, (this.shaft / 2)), move: "up"});
        this.gears({teeth: ringteeth, dimension: this.modulus, angle: pressure_angle, internal_ring: true, spoke_width: spoke_width, mount_hole: this.shaft, profile_shift: profile_shift, move: "up"});
        this.gears.gearCarrier((pitch1 + pitch2), spoke_width, planetpositions, (2 * spoke_width), (this.shaft / 2), {move: "up"});
        this.gears({teeth: this.sunteeth, dimension: this.modulus, angle: pressure_angle, mount_hole: this.shaft, profile_shift: profile_shift, move: "up"});
        let numplanets = planets;
        if (this.deltateeth) {
            numplanets += planets;
            let deltamodulus = ((this.modulus * ringteeth) / (ringteeth - this.deltateeth));
            this.gears({teeth: (ringteeth - this.deltateeth), dimension: deltamodulus, angle: pressure_angle, internal_ring: true, spoke_width: spoke_width, mount_hole: this.shaft, profile_shift: profile_shift, move: "up"});
        }
        for (let i = 0; i < numplanets; i += 1) {
            this.gears({teeth: this.planetteeth, dimension: this.modulus, angle: pressure_angle, mount_hole: this.shaft, profile_shift: profile_shift, move: "up"});
        }
    }

}

export { Planetary };