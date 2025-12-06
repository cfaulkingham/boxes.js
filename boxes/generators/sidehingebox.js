import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class SideHingeBox extends Boxes {
    constructor() {
        super();
        // this.buildArgParser("x", "y", "h", "outside");
        this.addSettingsArgs(edges.FingerJointSettings, {finger: 2.0, space: 2.0});
        this.argparser.add_argument("--play", {action: "store", type: "float", default: 0.15, help: "play between the two sides as multiple of the wall thickness"});
        this.argparser.add_argument("--hinge_center", {action: "store", type: "float", default: 0.0, help: "distance between the hinge center and adjacent sides (0.0 for default)"});
        this.argparser.add_argument("--hinge_radius", {action: "store", type: "float", default: 5.5, help: "radius of the hinge inner circle"});
        this.argparser.add_argument("--cherrymx_latches", {action: "store", type: "int", default: 0, choices: [0, 1, 2], help: "add one or two latches, based on 3D printing and a cherry mx compatible mechanical keyboard switch"});
    }

    render() {
        let x;
        let yi;
        let hi;
        [x, yi, hi] = [this.x, this.y, this.h];
        let t = this.thickness;
        let p = (this.play * t);
        let hinge_radius = this.hinge_radius;
        let hinge_center = (this.hinge_center ? this.hinge_center : ((2 * t) + hinge_radius));
        let latches = this.cherrymx_latches;
        this.mx_width = 15.4;
        this.mx_length = ((t + 16.4) + 2.8);
        if (this.outside) {
            x -= (2 * t);
            yi -= ((4 * t) + (2 * p));
            hi -= (2 * t);
        }
        let yo = (yi + (2 * (t + p)));
        let ho = (hi + t);
        let fingered_hi = ((2 * hinge_center) - t);
        let gap = (Math.sqrt(Math.abs((Math.pow((hinge_center * Math.sqrt(2)), 2) - Math.pow((hinge_center - t), 2)))) - hinge_center);
        let fingered_ho = ((ho - gap) - (2 * hinge_center));
        this.ctx.save();
        this.inner_side(x, hi, hinge_center, hinge_radius, fingered_hi, latches, {reverse: true});
        this.rectangularWall(yi, hi, "fFeF", {callback: [() => this.back_cb(yi, latches)], move: "right", label: "inner - full side D"});
        this.inner_side(x, hi, hinge_center, hinge_radius, fingered_hi, latches);
        this.ctx.restore();
        this.rectangularWall(0, hi, "ffef", {move: "up only"});
        this.ctx.save();
        this.outer_side(x, ho, hinge_center, hinge_radius, fingered_ho, latches);
        this.ctx.save();
        this.rectangularWall(yo, fingered_ho, "fFeF", {move: "up", label: "outer - small side B"});
        this.moveTo((t + p), 0);
        this.rectangularWall(yi, fingered_hi, "eFfF", {move: "right", label: "inner - small side B"});
        this.ctx.restore();
        this.rectangularWall(yo, 0, "fFeF", {move: "right only"});
        this.outer_side(x, ho, hinge_center, hinge_radius, fingered_ho, latches, {reverse: true});
        this.ctx.restore();
        this.rectangularWall(0, ho, "ffef", {move: "up only"});
        let bottom_callback = (latches ? [() => this.fingerHolesAt(((x - this.mx_width) - (t / 2)), 0, this.mx_length), () => this.back_cb(yi, latches), () => (latches > 1 ? this.fingerHolesAt((this.mx_width + (t / 2)), 0, this.mx_length) : null)] : null);
        this.rectangularWall(x, yi, "FFFF", {callback: bottom_callback, move: "right", label: "inner - bottom"});
        this.rectangularWall(x, yo, "FEFF", {move: "right", label: "outer - upper lid"});
        for (let _ = 0; _ < 2; _ += 1) {
            this.rectangularWall((2 * t), (1.5 * t), "eeee", {move: "right"});
        }
        if (latches) {
            for (let _ = 0; _ < latches; _ += 1) {
                this.ctx.save();
                this.rectangularWall(this.mx_width, this.mx_width, "eeee", {move: "right"});
                this.rectangularWall(this.mx_width, this.mx_width, "ffef", {move: "right"});
                this.rectangularWall(this.mx_length, this.mx_width, "ffeF", {move: "right"});
                this.ctx.restore();
                this.rectangularWall(this.mx_length, this.mx_width, "ffeF", {move: "up only"});
            }
            this.text(/* unknown node JoinedStr */);
        }
    }

    back_cb(y, latches) {
        if (latches > 0) {
            this.fingerHolesAt((this.mx_length + (this.thickness / 2)), 0, this.mx_width);
        }
        if (latches > 1) {
            this.fingerHolesAt(((y - this.mx_length) - (this.thickness / 2)), 0, this.mx_width);
        }
    }

    inner_side_cb(x, reverse) {
        if (reverse) {
            this.fingerHolesAt(((x - this.mx_width) - (this.thickness / 2)), 0, this.mx_width);
            this.circle((x - (this.mx_width / 2)), (this.mx_width / 2), (5.7 + this.burn));
        }
        else {
            this.fingerHolesAt((this.mx_width + (this.thickness / 2)), 0, this.mx_width);
            this.circle((this.mx_width / 2), (this.mx_width / 2), (5.7 + this.burn));
        }
    }

    inner_side(x, h, hinge_center, hinge_radius, fingered_h, latches, reverse) {
        let sides = Inner2SidesEdge(this, x, h, hinge_center, hinge_radius, fingered_h, reverse);
        let noop_edge = edges.NoopEdge(this);
        this.rectangularWall(x, h, (reverse ? ["f", "f", sides, noop_edge] : ["f", sides, noop_edge, "f"]), {move: "right", label: ("inner - hinge side " + (reverse ? "A" : "C")), callback: (((latches && reverse) || latches > 1) ? [() => this.inner_side_cb(x, reverse)] : null)});
    }

    outer_side(x, h, hinge_center, hinge_radius, fingered_h, latches, reverse) {
        let t = this.thickness;
        let sides = Outer2SidesEdge(this, x, h, hinge_center, hinge_radius, fingered_h, reverse);
        let noop_edge = edges.NoopEdge(this);
        let latch_x;
        let latch_y;
        [latch_x, latch_y] = [(t + (this.mx_width / 2)), (this.mx_width / 2)];
        if (reverse) {
            [latch_x, latch_y] = [latch_y, latch_x];
        }
        this.rectangularWall(x, h, (reverse ? ["f", "E", sides, noop_edge] : ["f", sides, noop_edge, "E"]), {move: "right", label: ("outer - hinge side " + (reverse ? "C" : "A")), callback: (((latches && !reverse) || latches > 1) ? [null, null, () => this.circle(latch_x, latch_y, (5.7 + this.burn))] : null)});
    }

}

export { SideHingeBox };
class Inner2SidesEdge extends Boxes {
    constructor(boxes, length, height, hinge_center, hinge_radius, fingered_h, reverse) {
        super();
        this.length = length;
        this.height = height;
        this.hinge_center = hinge_center;
        this.hinge_radius = hinge_radius;
        this.fingered_h = fingered_h;
        this.reverse = reverse;
    }

    __call__(_) {
        let actions = [this.hinge_hole, this.fingers, this.smooth_corner];
        actions = (this.reverse ? list(reversed(actions)) : actions);
        for (let action of actions) {
            action();
        }
    }

    fingers() {
        this.boxes.edges["f"](this.fingered_h);
    }

    smooth_corner() {
        let hinge_to_lid = ((this.height + this.boxes.thickness) - this.hinge_center);
        let hinge_to_side = (this.hinge_center - this.boxes.thickness);
        let corner_height = (hinge_to_lid - Math.sqrt((Math.pow(hinge_to_lid, 2) - Math.pow(hinge_to_side, 2))));
        let angle = (Math.asin((hinge_to_side / hinge_to_lid)) * 180 / Math.PI);
        let path = [((this.height - this.fingered_h) - corner_height), [(90 - angle), 0], 0, [angle, hinge_to_lid], ((this.boxes.thickness + this.length) - this.hinge_center)];
        path = (this.reverse ? list(reversed(path)) : path);
        this.polyline(...path);
    }

    hinge_hole() {
        let direction = (this.reverse ? -1 : 1);
        let x = (direction * ((this.hinge_center - this.boxes.thickness) - this.boxes.burn));
        let y = (this.hinge_center - this.boxes.thickness);
        let t = this.boxes.thickness;
        this.boxes.rectangularHole(x, y, (1.5 * t), t);
    }

    margin() {
        return (this.reverse ? 0 : this.boxes.edges["f"].margin());
    }

}

export { Inner2SidesEdge };
class Outer2SidesEdge extends Boxes {
    constructor(boxes, length, height, hinge_center, hinge_radius, fingered_h, reverse) {
        super();
        this.length = length;
        this.height = height;
        this.hinge_center = hinge_center;
        this.hinge_radius = hinge_radius;
        this.fingered_h = fingered_h;
        this.reverse = reverse;
    }

    __call__(_) {
        let actions = [this.fingers, this.smooth_corner, this.hinge_hole];
        actions = (this.reverse ? list(reversed(actions)) : actions);
        for (let action of actions) {
            action();
        }
    }

    fingers() {
        this.boxes.edges["f"](this.fingered_h);
    }

    smooth_corner() {
        let path = [0, [-90, 0], this.boxes.thickness, [90, 0], ((this.height - this.fingered_h) - this.hinge_center), [90, this.hinge_center], ((this.boxes.thickness + this.length) - this.hinge_center)];
        path = (this.reverse ? list(reversed(path)) : path);
        this.polyline(...path);
    }

    hinge_hole() {
        let direction = (this.reverse ? -1 : 1);
        let x = (direction * (((this.hinge_center - this.length) - this.boxes.thickness) - this.boxes.burn));
        let y = this.hinge_center;
        let t = this.boxes.thickness;
        this.boxes.circle(x, y, this.hinge_radius);
        this.boxes.rectangularHole(x, y, t, (1.5 * t));
    }

    margin() {
        return (this.reverse ? 0 : this.boxes.edges["f"].margin());
    }

}

export { Outer2SidesEdge };