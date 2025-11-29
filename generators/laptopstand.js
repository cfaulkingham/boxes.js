const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class LaptopStand extends Boxes {
    constructor() {
        super();
        this.argparser.add_argument("--l_depth", {action: "store", type: "float", default: 250, help: "laptop depth - front to back (mm)"});
        this.argparser.add_argument("--l_thickness", {action: "store", type: "float", default: 10, help: "laptop thickness (mm)"});
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 15, help: "desired tilt of keyboard (deg)"});
        this.argparser.add_argument("--ground_offset", {action: "store", type: "float", default: 10, help: "desired height between bottom of laptop and ground at lowest point (front of laptop stand)"});
        this.argparser.add_argument("--nub_size", {action: "store", type: "float", default: 10, help: "desired thickness of the supporting edge"});
    }

    render() {
        let calcs = this.perform_calculations();
        this.laptopstand_triangles(calcs, {move: "up"});
    }

    perform_calculations() {
        let angle_rads_a = (this.angle * Math.PI / 180);
        let height = (this.l_depth * Math.sin(angle_rads_a));
        let base = ((sqrt(2) * this.l_depth) * Math.cos(angle_rads_a));
        let hyp = (this.l_depth * sqrt((Math.pow(Math.cos(angle_rads_a), 2) + 1)));
        let angle_rads_b = Math.atan((Math.tan(angle_rads_a) / Math.sqrt(2)));
        let base_extra = ((1 / Math.cos(angle_rads_b)) * (this.nub_size - (this.ground_offset * Math.sin(angle_rads_b))));
        let lip_outer = (((this.ground_offset / Math.cos(angle_rads_b)) + this.l_thickness) - (this.nub_size * Math.tan(angle_rads_b)));
        let bottom_slot_depth = ((height / 4) + (this.ground_offset / 2));
        let top_slot_depth_big = (((height / 4) + (this.ground_offset / 2)) + ((this.thickness * height) / (2 * base)));
        let top_slot_depth_small = (((height / 4) + (this.ground_offset / 2)) - ((this.thickness * height) / (2 * base)));
        let half_hyp = ((hyp * (base - this.thickness)) / (2 * base));
        return dict();
    }

    laptopstand_triangles(calcs, move) {
        let tw = ((calcs["base"] + this.spacing) + (2 * (calcs["base_extra"] + (Math.sin((calcs["angle"] * Math.PI / 180)) * (calcs["lip_outer"] + 1)))));
        let th = ((calcs["height"] + (2 * this.ground_offset)) + this.spacing);
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(((calcs["base_extra"] + this.spacing) + (Math.sin((calcs["angle"] * Math.PI / 180)) * (calcs["lip_outer"] + 1))));
        this.draw_triangle(calcs, {top: false});
        this.moveTo((calcs["base"] - this.spacing), th, 180);
        this.draw_triangle(calcs, {top: true});
        this.move(tw, th, move);
    }

    draw_triangle(calcs, top) {
        this.moveTo(0, (calcs["height"] + this.ground_offset), -90);
        this.edge((calcs["height"] + this.ground_offset));
        this.corner(90);
        let foot_length = (10 + this.nub_size);
        let base_length_without_feet = ((calcs["base"] - (foot_length * 2)) - 7);
        if (top) {
            this.polyline(foot_length, 45, 5, -45, base_length_without_feet, -45, 5, 45, (foot_length + calcs["base_extra"]), 0);
        }
        else {
            this.polyline(foot_length, 45, 5, -45, ((base_length_without_feet - this.thickness) / 2), 90, (calcs["bottom_slot_depth"] - 3.5), -90, this.thickness, -90, (calcs["bottom_slot_depth"] - 3.5), 90, ((base_length_without_feet - this.thickness) / 2), -45, 5, 45, (foot_length + calcs["base_extra"]), 0);
        }
        this.corner((90 - calcs["angle"]));
        this.edge(calcs["lip_outer"]);
        this.corner(90, 1);
        this.edge((this.nub_size - 2));
        this.corner(90, 1);
        this.edge(this.l_thickness);
        this.corner(-90);
        if (top) {
            this.edge(calcs["half_hyp"]);
            this.corner((90 + calcs["angle"]));
            this.edge(calcs["top_slot_depth_small"]);
            this.corner(-90);
            this.edge(this.thickness);
            this.corner(-90);
            this.edge(calcs["top_slot_depth_big"]);
            this.corner((90 - calcs["angle"]));
            this.edge(calcs["half_hyp"]);
        }
        else {
            this.edge(calcs["hyp"]);
        }
        this.corner((90 + calcs["angle"]));
    }

}

module.exports.LaptopStand = LaptopStand;