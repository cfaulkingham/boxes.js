const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class FanHole extends Boxes {
    constructor() {
        super();
        this.argparser.add_argument("--diameter", {action: "store", type: "float", default: 80, help: "diameter of the fan hole"});
        this.argparser.add_argument("--mounting_holes", {action: "store", type: "float", default: 3, help: "diameter of the fan mounting holes"});
        this.argparser.add_argument("--mounting_holes_inset", {action: "store", type: "float", default: 5, help: "distance of the fan mounting holes from the outside"});
        this.argparser.add_argument("--arms", {action: "store", type: "int", default: 10, help: "number of arms"});
        this.argparser.add_argument("--inner_disc", {action: "store", type: "float", default: 0.2, help: "relative size of the inner disc"});
        this.argparser.add_argument("--style", {action: "store", type: "str", default: "CW Swirl", choices: ["CW Swirl", "CCW Swirl", "Hole"], help: "Style of the fan hole"});
    }

    arc(d, a) {
        let r = abs((((1 / Math.cos(((90 - (a / 2)) * Math.PI / 180))) * d) / 2));
        this.corner((-a / 2));
        this.corner(a, r);
        this.corner((-a / 2));
    }

    swirl(r, ri_rel, n) {
        let d = (2 * r);
        let ri = (ri_rel * r);
        let ai = 90;
        let ao = ((360 / n) * 0.8);
        let a1 = (Math.atan(((ri * Math.sin((ai * Math.PI / 180))) / (r - (ri * Math.cos((ai * Math.PI / 180)))))) * 180 / Math.PI);
        let d1 = (((ri * (Math.sin((ai * Math.PI / 180)) ** 2)) + ((r - (ri * Math.cos((ai * Math.PI / 180)))) ** 2)) ** 0.5);
        let d2 = (((ri * (Math.sin(((ai - ao) * Math.PI / 180)) ** 2)) + ((r - (ri * Math.cos(((ai - ao) * Math.PI / 180)))) ** 2)) ** 0.5);
        let a_i2 = (Math.atan((((r * Math.sin((ao * Math.PI / 180))) - (ri * Math.sin((ai * Math.PI / 180)))) / ((r * Math.cos((ao * Math.PI / 180))) - (ri * Math.cos((ai * Math.PI / 180)))))) * 180 / Math.PI);
        let a3 = (a1 + a_i2);
        let a2 = ((90 + a_i2) - ao);
        this.moveTo(0, -r, 180);
        for (let i = 0; i < n; i += 1) {
            this.ctx.save();
            this.corner(-ao, r);
            this.corner(-a2);
            this.arc(d2, -90);
            this.corner((-180 + a3));
            this.arc(d1, 85);
            this.corner((-90 - a1));
            this.ctx.restore();
            this.moveArc((-360.0 / n), r);
        }
    }

    render() {
        let r_h = (this.mounting_holes / 2);
        let d = this.diameter;
        let inset = this.mounting_holes_inset;
        for (let px of [inset, (d - inset)]) {
            for (let py of [inset, (d - inset)]) {
                this.hole(px, py, r_h);
            }
        }
        this.moveTo((d / 2), (d / 2));
        if (this.style === "CW Swirl") {
            this.ctx.scale(-1, 1);
            this.swirl((d / 2), this.inner_disc, this.arms);
        }
        else {
            if (this.style === "CCW Swirl") {
                this.swirl((d / 2), this.inner_disc, this.arms);
            }
            else {
                this.hole(0, 0, {d: d});
            }
        }
    }

}

module.exports.FanHole = FanHole;