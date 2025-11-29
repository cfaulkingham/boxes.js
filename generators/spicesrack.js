const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class FrontEdge extends Boxes {
    __call__(length) {
        this.ctx.save();
        let a = 90;
        let r = ((this.diameter + this.space) / 2);
        this.ctx.scale(1, (this.edge_width / r));
        for (let i = 0; i < this.numx; i += 1) {
            this.corner(-a);
            this.corner(180, r);
            this.corner(-a);
        }
        this.ctx.restore();
        this.moveTo(length);
    }

    margin() {
        return this.edge_width;
    }

}

module.exports.FrontEdge = FrontEdge;
class SpicesRack extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 1.0});
        this.argparser.add_argument("--diameter", {action: "store", type: "float", default: 55.0, help: "diameter of spice cans"});
        this.argparser.add_argument("--height", {action: "store", type: "float", default: 60.0, help: "height of the cans that needs to be supported"});
        this.argparser.add_argument("--space", {action: "store", type: "float", default: 10.0, help: "space between cans"});
        this.argparser.add_argument("--numx", {action: "store", type: "int", default: 5, help: "number of cans in a row"});
        this.argparser.add_argument("--numy", {action: "store", type: "int", default: 6, help: "number of cans in a column"});
        this.argparser.add_argument("--in_place_supports", {action: "store", type: boolarg, default: false, help: "place supports pieces in holes (check for fit yourself)"});
        this.argparser.add_argument("--feet", {action: "store", type: boolarg, default: false, help: "add feet so the rack can stand on the ground"});
    }

    support(width, height, move) {
        let t = this.thickness;
        let tw = (width + t);
        let th = height;
        let r = Math.min((width - (2 * t)), (height - (2 * t)));
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.polyline((width - r), 90, 0, [-90, r], 0, 90, (height - r), 90, width, 90);
        this.edges["f"](height);
        this.move(tw, th, move);
    }

    foot(width, height, move) {
        let t = this.thickness;
        let tw;
        let th;
        [tw, th] = [height, (width + t)];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(0, t);
        this.edges["f"](height);
        this.polyline(0, 90, width, 90, 0, [90, height], (width - height), 90);
        this.move(tw, th, move);
    }

    holes() {
        let w = (2 * this.base_r);
        let r = (this.diameter / 2);
        let a = this.base_angle;
        let l = this.hole_length;
        this.moveTo(0, this.hole_distance);
        this.ctx.save();
        this.ctx.scale(1, (l / this.base_h));
        this.moveTo((this.space / 2), 0, 90);
        for (let i = 0; i < this.numx; i += 1) {
            this.polyline(0, -a, 0, [(-180 + (2 * a)), r], 0, (-90 - a), w, -90);
            this.moveTo(0, -(this.diameter + this.space));
        }
        this.ctx.restore();
        this.ctx.stroke();
        if ((this.feet && !this.feet_done)) {
            this.feet_done = true;
            return;
        }
        if (!this.in_place_supports) {
            return;
        }
        let inner_width = (this.hole_distance + (this.hole_length / 3));
        let t = this.thickness;
        for (let i = 0; i < (this.numx - 1); i += 1) {
            this.ctx.save();
            this.moveTo((((this.diameter + this.space) * (i + 0.5)) - ((inner_width + t) / 2)), this.spacing);
            this.support(inner_width, ((this.h - t) / 2));
            this.ctx.restore();
        }
    }

    backCB() {
        let t = this.thickness;
        let dy = ((this.h / 2) - (t / 2));
        for (let i = 0; i < this.numy; i += 1) {
            this.fingerHolesAt(0, ((((i + 1) * this.h) - (0.5 * this.thickness)) - dy), this.x, 0);
            for (let j = 1; j < this.numx; j += 1) {
                this.fingerHolesAt((j * (this.diameter + this.space)), ((((i + 1) * this.h) - t) - dy), ((this.h - t) / 2), -90);
            }
        }
    }

    render() {
        this.feet_done = false;
        let t = this.thickness;
        let d = this.diameter;
        this.base_angle = 10;
        this.base_r = ((this.diameter / 2) * Math.cos((this.base_angle * Math.PI / 180)));
        this.base_h = ((this.diameter / 2) * (1 - Math.sin((this.base_angle * Math.PI / 180))));
        this.angle = (Math.atan((this.base_r / this.height)) * 180 / Math.PI);
        this.hole_length = (((this.base_h ** 2) + (this.height ** 2)) ** 0.5);
        this.hole_distance = ((this.diameter - this.base_r) * Math.sin((this.angle * Math.PI / 180)));
        this.h = ((this.space + d) / Math.cos((this.angle * Math.PI / 180)));
        let h = (((this.numy * this.h) - (this.h / 2)) + (6 * t));
        let width = ((this.hole_distance + this.hole_length) + (this.space / 2));
        let inner_width = (this.hole_distance + (this.hole_length / 3));
        this.edge_width = (width - inner_width);
        for (let i = 0; i < this.numy; i += 1) {
            this.rectangularWall(x, inner_width, ["f", "e", FrontEdge(this, this), "e"], {callback: [this.holes], move: "up"});
        }
        this.rectangularWall(x, h, {callback: [this.backCB, null, () => this.hole((3 * t), (3 * t), 1.5), () => this.hole((3 * t), (3 * t), 1.5)], move: "up"});
        if (!this.in_place_supports) {
            this.partsMatrix(((this.numx - 1) * this.numy), (this.numx - 1), "up", this.support, inner_width, ((this.h - t) / 2));
        }
        if (this.feet) {
            this.partsMatrix((this.numx - 1), (this.numx - 1), "up", this.foot, width, ((this.h - t) / 2));
        }
    }

}

module.exports.SpicesRack = SpicesRack;