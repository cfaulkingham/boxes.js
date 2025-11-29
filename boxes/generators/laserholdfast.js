const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class LaserHoldfast extends Boxes {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--hookheight", {action: "store", type: "float", default: 5.0, help: "height of the top hook"});
        this.argparser.add_argument("--shaftwidth", {action: "store", type: "float", default: 5.0, help: "width of the shaft"});
    }

    render() {
        let x;
        let hh;
        let h;
        let sw;
        [x, hh, h, sw] = [this.x, this.hookheight, this.h, this.shaftwidth];
        let t = this.thickness;
        let a = 30;
        let r = (x / (a * Math.PI / 180));
        this.polyline((hh + h), [180, (sw / 2)], h, (-90 + (a / 2)), 0, [-a, r], 0, [180, (hh / 2)], 0, [a, (r + hh)], 0, (-a / 2), (sw - (Math.sin(((a / 2) * Math.PI / 180)) * hh)), 90);
    }

}

module.exports.LaserHoldfast = LaserHoldfast;