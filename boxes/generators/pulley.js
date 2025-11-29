const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class Pulley extends Boxes {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--profile", {action: "store", type: "str", default: "GT2_2mm", choices: pulley.Pulley.getProfiles(), help: "profile of the teeth/belt"});
        this.argparser.add_argument("--teeth", {action: "store", type: "int", default: 20, help: "number of teeth"});
        this.argparser.add_argument("--axle", {action: "store", type: "float", default: 5, help: "diameter of the axle"});
        this.argparser.add_argument("--insideout", {action: "store", type: BoolArg(), default: false, help: "create a ring gear with the belt being pushed against from within"});
        this.argparser.add_argument("--top", {action: "store", type: "float", default: 0, help: "overlap of top rim (zero for none)"});
    }

    disk(diameter, hole, callback, move) {
        let w = (diameter + (2 * this.spacing));
        if (this.move(w, w, move)) {
            return;
        }
        this.moveTo((w / 2), (w / 2));
        this.cc(callback, null, 0.0, 0.0);
        if (hole) {
            this.hole(0, 0, (hole / 2.0));
        }
        this.moveTo(((diameter / 2) + this.burn), 0, 90);
        this.corner(360, (diameter / 2));
        this.move(w, w, move);
    }

    render() {
        let t = this.thickness;
        if (this.top) {
            this.disk((this.pulley.diameter(this.teeth, this.profile) + (2 * this.top)), this.axle, {move: "right"});
        }
        for (let i = 0; i < parseInt(Math.ceil((this.h / this.thickness))); i += 1) {
            this.pulley(this.teeth, this.profile, {insideout: this.insideout, r_axle: (this.axle / 2.0), move: "right"});
        }
    }

}

module.exports.Pulley = Pulley;