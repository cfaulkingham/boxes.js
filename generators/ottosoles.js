const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class OttoSoles extends Boxes {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--width", {action: "store", type: "float", default: 4.0, help: "width of sole stripe"});
        this.argparser.add_argument("--chamfer", {action: "store", type: "float", default: 5.0, help: "chamfer at the corners"});
        this.argparser.add_argument("--num", {action: "store", type: "int", default: 2, help: "number of soles"});
    }

    render() {
        let x;
        let y;
        [x, y] = [this.x, this.y];
        let c = this.chamfer;
        let c2 = (c * (2 ** 0.5));
        let w = Math.min(this.width, ((c2 / 2.0) / Math.tan((22.5 * Math.PI / 180))));
        w = this.width;
        let w2 = ((w * (2 ** 0.5)) - (c2 / 2));
        let d = (w * Math.tan((22.5 * Math.PI / 180)));
        this.edges["d"].settings.setValues(w, {size: 0.4, depth: 0.3, radius: 0.05});
        this.moveTo(0, y, -90);
        for (let i = 0; i < (this.num * 2); i += 1) {
            if (c2 >= (2 * d)) {
                this.polyline([c2, 1], 45, [(y - (2 * c)), 1], 45, (c2 / 2.0), 90);
                this.edges["d"](w);
                this.polyline(0, 90, ((c2 / 2) - d), -45, [((y - (2 * c)) - (2 * d)), 1], -45, [(c2 - (2 * d)), 1], -45, [((x - (2 * c)) - (2 * d)), 1], -45, ((c2 / 2) - d), 90);
                this.edges["D"](w);
                this.polyline(0, 90, (c2 / 2.0), 45, [(x - (2 * c)), 1], 45);
                this.moveTo(0, ((w + (c2 / 2.0)) + ((2 * (2 ** 0.5)) * this.burn)));
            }
            else {
                this.polyline([c2, 1], 45, [(y - (2 * c)), 1], 45, (c2 / 2.0), 90);
                this.edges["d"](w2);
                this.polyline(0, 45, [(y - (2 * w)), 1], -90, [(x - (2 * w)), 1], 45);
                this.edges["D"](w2);
                this.polyline(0, 90, (c2 / 2.0), 45, [(x - (2 * c)), 3], 45);
                this.moveTo(0, ((w * (2 ** 0.5)) + ((2 * (2 ** 0.5)) * this.burn)));
            }
        }
    }

}

module.exports.OttoSoles = OttoSoles;