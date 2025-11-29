const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class Rack19HalfWidth extends Boxes {
    constructor() {
        super();
        this.argparser.add_argument("--ru_count", {action: "store", type: "float", default: 1, help: "number of rack units"});
        this.argparser.add_argument("--holes", {action: "store", type: "str", default: "xxmpwx", help: "mounting patterns: x=xlr, m=midi, p=9v-power, w=6.5mm-wire, space=next row"});
        this.argparser.add_argument("--z", {action: "store", type: "float", default: 20, help: "depth of the shorter (rackear) side"});
        this.argparser.add_argument("--deepz", {action: "store", type: "float", default: 124, help: "depth of the longer (screwed to another half sized thing) side"});
    }

    render() {;
        let t = this.thickness;
        let z = this.z;
        let deepz = this.deepz;
        this.flangedWall(x, y, "FFFF", {callback: [this.util_holes, this.rack_holes], r: t, flanges: [0, 17, 0, 0], move: "up"});
        this.trapezoidWall(x, deepz, z, "fFeF", {move: "up"});
        this.trapezoidWall(x, deepz, z, "fFeF", {move: "up"});
        this.rectangularWall(deepz, y, "fffe", {move: "right"});
        this.rectangularWall(z, y, "fffe", {move: "up"});
    }

    rack_holes() {;
        let t = this.thickness;
        this.rectangularHole((6 + t), 10, 10, 6.5, {r: 3.25});
        this.rectangularHole(((this.y - 6) + t), 10, 10, 6.5, {r: 3.25});
    }

    util_holes() {;
        this.moveTo(10, ((44.45 - 4.45) / 2));
        for (let line of this.holes.split()) {
            this.ctx.save();
            for (let hole of line) {
                this.hole_map.get(this);
            }
            this.ctx.restore();
            this.moveTo(0, 44.45);
        }
    }

    hole_xlr() {;
        this.moveTo(16);
        this.hole(-9.5, 12, 1);
        this.hole(0, 0, 11.8);
        this.hole(9.5, -12, 1);
        this.moveTo(16);
    }

    hole_midi() {;
        this.moveTo(17);
        this.hole(-11.1, 0, 1);
        this.hole(0, 0, 7.5);
        this.hole(11.1, 0, 1);
        this.moveTo(17);
    }

    hole_power() {;
        this.moveTo(11);
        this.rectangularHole(0, 0, 9, 11);
        this.moveTo(11);
    }

    hole_wire() {;
        this.moveTo(3);
        this.hole(0, 0, 3.25);
        this.moveTo(3);
    }

}

module.exports.Rack19HalfWidth = Rack19HalfWidth;