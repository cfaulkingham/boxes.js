const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class Stachel extends Boxes {
    constructor() {
        super();
        this.argparser.add_argument("--flutediameter", {action: "store", type: "float", default: 115.0, help: "diameter of the flutes bottom in mm"});
        this.argparser.add_argument("--polediameter", {action: "store", type: "float", default: 25.0, help: "diameter if the pin in mm"});
        this.argparser.add_argument("--wall", {action: "store", type: "float", default: 7.0, help: "width of the surrounding wall in mm"});
    }

    layer(ri, ro, rp, holes, move) {
        let r = 2.5;
        let l = 25;
        let w = 20;
        let wp = (rp + 8);
        let tw = ((2 * ro) + (2 * rp));
        let th = ((2 * ro) + l);
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(ro, r, 90);
        let a1 = (Math.asin((w / ro)) * 180 / Math.PI);
        let a2 = (Math.asin((wp / ro)) * 180 / Math.PI);
        let l1 = (ro * (1 - Math.cos((a1 * Math.PI / 180))));
        let a3 = (Math.asin((1.0 / rp)) * 180 / Math.PI);
        this.polyline((((ro - ri) + l) - r), 90, 0, [-355, ri], 0, 90, (((ro - ri) + l) - r), [90, r], (w - (2 * r)), [90, r]);
        if (holes) {
            let poly1 = [((((l + l1) - 2) / 2) - r), 90, (w - 2), -90, 2, -90, (w - 2), 90, (((l + l1) - 2) / 2)];
            this.polyline(...poly1);
        }
        else {
            this.polyline(((l + l1) - r));
        }
        this.polyline(0, (-90 + a1), 0, [((90 - a1) - a2), ro], 0, (-90 + a2));
        if (holes) {
            let poly2 = [((2 * rp) + 15), 90, (wp - 2), -90, 2, -90, (wp - 2), 90, ((10 - 2) - r)];
            this.polyline(...poly2);
        }
        else {
            this.polyline(((25 + (2 * rp)) - r));
        }
        this.polyline(0, [90, r], ((wp - 1) - r), 90, 20, (90 - a3), 0, [(-360 + (2 * a3)), rp], 0, (90 - a3), 20, 90, ((wp - 1) - r), [90, r]);
        if (holes) {
            this.polyline(...list(reversed(poly2)));
        }
        else {
            this.polyline(((25 + (2 * rp)) - r));
        }
        this.polyline(0, (-90 + a2), 0, [(((270 - a2) - a1) - 5), ro], 0, (-90 + a1));
        if (holes) {
            this.polyline(...list(reversed(poly1)));
        }
        else {
            this.polyline(((l + l1) - r));
        }
        this.polyline(0, [90, r], (w - (2 * r)), [90, r]);
        this.move(tw, th, move);
    }

    render() {
        let ri = (this.flutediameter / 2.0);
        let ro = (ri + this.wall);
        let rp = (this.polediameter / 2.0);
        let w = this.wall;
        this.layer((ri - 20), ro, rp, {move: "up"});
        this.layer(ri, ro, rp, true, {move: "up"});
        this.layer(ri, ro, rp, {move: "up"});
    }

}

module.exports.Stachel = Stachel;