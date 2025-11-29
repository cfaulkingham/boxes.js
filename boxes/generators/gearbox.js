const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class GearBox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.argparser.add_argument("--teeth1", {action: "store", type: "int", default: 8, help: "number of teeth on ingoing shaft"});
        this.argparser.add_argument("--teeth2", {action: "store", type: "int", default: 20, help: "number of teeth on outgoing shaft"});
        this.argparser.add_argument("--modulus", {action: "store", type: "float", default: 3, help: "modulus of the teeth in mm"});
        this.argparser.add_argument("--shaft", {action: "store", type: "float", default: 6.0, help: "diameter of the shaft"});
        this.argparser.add_argument("--stages", {action: "store", type: "int", default: 4, help: "number of stages in the gear reduction"});
    }

    render() {
        if (this.teeth2 < this.teeth1) {
            [] = [this.teeth1, this.teeth2];
        }
        let pitch1;
        let size1;
        let xxx;
        [pitch1, size1, xxx] = this.gears.sizes();
        let pitch2;
        let size2;
        [pitch2, size2, xxx] = this.gears.sizes();
        let t = this.thickness;
        let x = ((1.1 * t) * this.stages);
        if (this.stages === 1) {
            let y = (size1 + size2);
            let y1 = (((y / 2) - (pitch1 + pitch2)) + pitch1);
            let y2 = (((y / 2) + (pitch1 + pitch2)) - pitch2);
        }
        else {
            y = (2 * size2);
            y1 = ((y / 2) - ((pitch1 + pitch2) / 2));
            y2 = ((y / 2) + ((pitch1 + pitch2) / 2));
        }
        let h = (Math.max(size1, size2) + t);
        let b = "F";
        t = "e";
        let mh = this.shaft;
        const sideCB = () => {
            this.hole(y1, (h / 2), (mh / 2));
            this.hole(y2, (h / 2), (mh / 2));
        };

        this.moveTo(this.thickness, this.thickness);
        this.rectangularWall(y, h, [b, "f", t, "f"], {callback: [sideCB], move: "right"});
        this.rectangularWall(x, h, [b, "F", t, "F"], {move: "up"});
        this.rectangularWall(x, h, [b, "F", t, "F"]);
        this.rectangularWall(y, h, [b, "f", t, "f"], {callback: [sideCB], move: "left"});
        this.rectangularWall(x, h, [b, "F", t, "F"], {move: "up only"});
        this.rectangularWall(x, y, "ffff", {move: "up"});
        let profile_shift = 20;
        let pressure_angle = 20;
        for (let i = 0; i < (this.stages - 1); i += 1) {
            this.gears({teeth: this.teeth2, dimension: this.modulus, angle: pressure_angle, mount_hole: mh, profile_shift: profile_shift, move: "up"});
        }
        this.gears({teeth: this.teeth2, dimension: this.modulus, angle: pressure_angle, mount_hole: mh, profile_shift: profile_shift, move: "right"});
        for (let i = 0; i < this.stages; i += 1) {
            this.gears({teeth: this.teeth1, dimension: this.modulus, angle: pressure_angle, mount_hole: mh, profile_shift: profile_shift, move: "down"});
        }
    }

}

module.exports.GearBox = GearBox;