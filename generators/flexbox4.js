const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class FlexBox4 extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.FlexSettings);
        // this.buildArgParser("x", "y", "h", "outside");
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 15, help: "Radius of the corners in mm"});
        this.argparser.add_argument("--latchsize", {action: "store", type: "float", default: 8, help: "size of latch in multiples of thickness"});
    }

    flexBoxSide(x, y, r, callback, move) {
        let t = this.thickness;
        if (this.move((x + (2 * t)), (y + t), move, true)) {
            return;
        }
        this.moveTo(t, t);
        this.cc(callback, 0);
        this.edges["f"](x);
        this.corner(90, 0);
        this.cc(callback, 1);
        this.edges["f"]((y - r));
        this.corner(90, r);
        this.cc(callback, 2);
        this.edge((x - (2 * r)));
        this.corner(90, r);
        this.cc(callback, 3);
        this.edges["e"](((y - r) - this.latchsize));
        this.cc(callback, 4);
        this.latch(this.latchsize);
        this.corner(90);
        this.move((x + (2 * t)), (y + t), move);
    }

    surroundingWall(move) {
        let x;
        let y;
        let h;
        let r;
        [x, y, h, r] = [this.x, this.y, this.h, this.radius];
        let c4 = this.c4;
        let t = this.thickness;
        let tw;
        let th;
        [tw, th] = [(((((2 * c4) + (2 * y)) + x) - (4 * r)) + (2 * t)), (h + (2.5 * t))];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(t, (0.25 * t));
        this.edges["F"]((y - r), false);
        if ((x - (2 * r)) < this.thickness) {
            this.edges["X"]((((2 * c4) + x) - (2 * r)), (h + (2 * this.thickness)));
        }
        else {
            this.edges["X"](c4, (h + (2 * this.thickness)));
            this.edge((x - (2 * r)));
            this.edges["X"](c4, (h + (2 * this.thickness)));
        }
        this.edge(((y - r) - this.latchsize));
        this.latch(this.latchsize, false, {extra_length: t});
        this.edge((h + (2 * this.thickness)));
        this.latch(this.latchsize, false, true, {extra_length: t});
        this.edge(((y - r) - this.latchsize));
        this.edge(c4);
        this.edge((x - (2 * r)));
        this.edge(c4);
        this.edges["F"]((y - r));
        this.corner(90);
        this.edge(this.thickness);
        this.edges["f"](h);
        this.edge(this.thickness);
        this.corner(90);
        this.move(tw, th, move);
    }

    render() {
        if (this.outside) {
            this.x = this.adjustSize(this.x);
            this.y = this.adjustSize(this.y);
            this.h = this.adjustSize(this.h);
        }
        this.latchsize *= this.thickness;
        this.radius = (this.radius || Math.min((this.x / 2.0), (this.y - this.latchsize)));
        this.radius = Math.min(this.radius, (this.x / 2.0));
        this.radius = Math.min(this.radius, Math.max(0, (this.y - this.latchsize)));
        this.surroundingWall({move: "up"});
        this.flexBoxSide(this.x, this.y, this.radius, {move: "right"});
        this.flexBoxSide(this.x, this.y, this.radius, {move: "mirror right"});
        this.rectangularWall(this.x, this.h, {edges: "FeFF"});
    }

}

module.exports.FlexBox4 = FlexBox4;