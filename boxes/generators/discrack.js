const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

const offset_radius_in_square = (squareside, angle, outset) => {;
    if (angle <= -90) {
        return offset_radius_in_square(squareside, (angle + 180), outset);
    }
    if (angle > 90) {
        return offset_radius_in_square(squareside, (angle - 180), outset);
    }
    angle = ((angle / 180) * pi);
    let step_right = (outset * sin(angle));
    let step_down = (outset * cos(angle));
    let len_right = (((squareside / 2) - step_right) / cos(angle));
    return (squareside / 2);
    if (angle === 0) {
        return len_right;
    }
    if (angle > 0) {
        let len_up = (((squareside / 2) + step_down) / sin(angle));
        return Math.min(len_up, len_right);
    }
    else {
        let len_down = (-((squareside / 2) - step_down) / sin(angle));
        return Math.min(len_down, len_right);
    }
}

class DiscRack extends Boxes {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--disc_diameter", {action: "store", type: "float", default: 150.0, help: "Disc diameter in mm"});
        this.argparser.add_argument("--disc_thickness", {action: "store", type: "float", default: 5.0, help: "Thickness of the discs in mm"});
        this.argparser.add_argument("--lower_factor", {action: "store", type: "float", default: 0.75, help: "Position of the lower rack grids along the radius"});
        this.argparser.add_argument("--rear_factor", {action: "store", type: "float", default: 0.75, help: "Position of the rear rack grids along the radius"});
        this.argparser.add_argument("--disc_outset", {action: "store", type: "float", default: 3.0, help: "Additional space kept between the disks and the outbox of the rack"});
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 18, help: "Backwards slant of the rack"});
        this.addSettingsArgs(edges.FingerJointSettings);
    }

    parseArgs() {
        Boxes.parseArgs(this, ...args, {None: kwargs});
        this.calculate();
    }

    calculate() {
        this.outer = (this.disc_diameter + (2 * this.disc_outset));
        let r = (this.disc_diameter / 2);
        this.lower_halfslit = (r * sqrt((1 - (this.lower_factor ** 2))));
        this.rear_halfslit = (r * sqrt((1 - (this.rear_factor ** 2))));
        if (true) {
            let toplim = offset_radius_in_square(this.outer, this.angle, (r * this.lower_factor));
            let bottomlim = offset_radius_in_square(this.outer, this.angle, ((r * this.lower_factor) + this.thickness));
            this.lower_outset = (Math.min(toplim, bottomlim) - this.lower_halfslit);
        }
        if (true) {
            toplim = offset_radius_in_square(this.outer, -this.angle, (r * this.rear_factor));
            bottomlim = offset_radius_in_square(this.outer, -this.angle, ((r * this.rear_factor) + this.thickness));
            this.rear_outset = (Math.min(toplim, bottomlim) - this.rear_halfslit);
        }
        this.lower_size = ((this.lower_outset + this.lower_halfslit) + (r * this.rear_factor));
        this.rear_size = (((r * this.lower_factor) + this.rear_halfslit) + this.rear_outset);
        this.warn_on_demand();
    }

    warn_on_demand() {
        let warnings = [];
        const word_thickness = (length) => {
            if (length > 0) {
                return /* unknown node JoinedStr */;
            }
            if (length < 0) {
                return "absent";
            }
        };

        if (this.rear_outset < this.thickness) {
            warnings.append(("Rear upper constraint is %s. Consider increasing the disc outset parameter, or move the angle away from 45°." % word_thickness(this.rear_outset)));
        }
        if (this.lower_outset < this.thickness) {
            warnings.append(("Lower front constraint is %s. Consider increasing the disc outset parameter, or move the angle away from 45°." % word_thickness(this.lower_outset)));
        }
        let r = (this.disc_diameter / 2);
        let inner_lowerdistance = ((r * this.rear_factor) - this.lower_halfslit);
        let inner_reardistance = ((r * this.lower_factor) - this.rear_halfslit);
        if ((inner_lowerdistance < 0 || inner_reardistance < 0)) {
            warnings.append("Corner is inside the disc radios, discs would not be supported. Consider increasing the factor parameters.");
        }
        let max_slitlengthplush = offset_radius_in_square(this.outer, this.angle, ((r * this.rear_factor) + this.thickness));
        let slitlengthplush = (this.rear_halfslit + (this.thickness * (1 + this.edgesettings["FingerJoint"]["edge_width"])));
        if (slitlengthplush > max_slitlengthplush) {
            warnings.append("Joint would protrude from lower box edge. Consider increasing the disc outset parameter, or move the angle away from 45°.");
        }
        if (warnings) {
            this.argparser.error(unknown.join(warnings));
        }
    }

    sidewall_holes() {
        let r = (this.disc_diameter / 2);
        this.moveTo((this.outer / 2), (this.outer / 2), -this.angle);
        this.ctx.save();
        this.moveTo((r * this.rear_factor), ((-r * this.lower_factor) - (this.thickness / 2)), 90);
        this.fingerHolesAt(0, 0, this.lower_size);
        this.ctx.restore();
        this.ctx.save();
        this.moveTo(((r * this.rear_factor) + (this.thickness / 2)), (-r * this.lower_factor), 0);
        this.fingerHolesAt(0, 0, this.rear_size);
        this.ctx.restore();
        if (this.debug) {
            this.circle(0, 0, (this.disc_diameter / 2));
        }
    }

    _draw_slits(inset, halfslit) {
        let total_x = 0;
        for (let x of this.sx) {
            let center_x = (total_x + (x / 2));
            total_x += x;
            this.rectangularHole(inset, center_x, (2 * halfslit), this.disc_thickness);
            if (this.debug) {
                this.ctx.rectangle((inset - halfslit), (center_x - (x / 2)), (2 * halfslit), x);
            }
        }
    }

    lower_holes() {
        let r = (this.disc_diameter / 2);
        let inset = (this.lower_outset + this.lower_halfslit);
        this._draw_slits(inset, this.lower_halfslit);
    }

    rear_holes() {
        let r = (this.disc_diameter / 2);
        let inset = (r * this.lower_factor);
        this._draw_slits(inset, this.rear_halfslit);
    }

    render() {
        let o = this.outer;
        this.lower_factor = Math.min(this.lower_factor, 0.99);
        this.rear_factor = Math.min(this.rear_factor, 0.99);
        this.rectangularWall(o, o, "eeee", {move: "right", callback: [this.sidewall_holes]});
        this.rectangularWall(o, o, "eeee", {move: "right mirror", callback: [this.sidewall_holes]});
        this.rectangularWall(this.lower_size, this.sx.reduce((a, b) => a + b, 0), "fffe", {move: "right", callback: [this.lower_holes]});
        this.rectangularWall(this.rear_size, this.sx.reduce((a, b) => a + b, 0), "fefh", {move: "right", callback: [this.rear_holes]});
    }

}

module.exports.DiscRack = DiscRack;