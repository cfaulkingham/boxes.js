import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class PaperBox extends Boxes {
    constructor() {
        super();
        // this.buildArgParser("x", "y", "h");
        this.argparser.add_argument("--design", {action: "store", type: "str", default: "automatic", choices: ["automatic", "widebox", "tuckbox"], help: "different design for paper consumption optimization. The tuckbox also has locking cut for its lid."});
        this.argparser.add_argument("--lid_height", {type: "float", default: 15, help: "Height of the lid (part which goes inside the box)"});
        this.argparser.add_argument("--lid_radius", {type: "float", default: 7, help: "Angle, in radius, of the round corner of the lid"});
        this.argparser.add_argument("--lid_sides", {type: "float", default: 20, help: "Width of the two sides upon which goes the lid"});
        this.argparser.add_argument("--margin", {type: "float", default: 0, help: "Margin for the glued sides"});
        this.argparser.add_argument("--mark_length", {type: "float", default: 1.5, help: "Length of the folding outside mark"});
        this.argparser.add_argument("--tab_angle_rad", {type: "float", default: Math.atan((2 / 25)), help: "Angle (in radian) of the sides which are to be glued inside the box"});
        this.argparser.add_argument("--finger_hole_diameter", {type: "float", default: 15, help: "Diameter of the hole to help catch the lid"});
    }

    render() {
        if (this.design === "automatic") {
            this.design = this.h > this.y ? "tuckbox" : "widebox";
        }
        let path = this.design === "tuckbox" 
            ? this.tuckbox(this.x, this.y, this.h) 
            : this.widebox(this.x, this.y, this.h);
        this.polyline(...path);
    }

    tuckbox(width, length, height) {
        let lid_cut_length = Math.min(10, length / 2, width / 5);
        let half_side = [
            ...this.mark(this.mark_length),
            0,
            90,
            ...this.ear_description(length, lid_cut_length),
            0,
            -90,
            length,
            0,
            ...this.lid_cut(lid_cut_length),
            ...this.lid_tab(width - 2 * this.thickness),
            0,
            ...this.lid_cut(lid_cut_length, true),
            length,
            -90,
            ...this.ear_description(length, lid_cut_length, true),
            ...this.mark(this.mark_length)
        ];
        return [
            height,
            0,
            ...half_side,
            ...this.side_with_finger_hole(width, this.finger_hole_diameter),
            ...this.mark(this.mark_length),
            0,
            90,
            ...this.tab_description(length - this.margin - this.thickness, height),
            0,
            90,
            ...this.mark(this.mark_length),
            width,
            ...half_side.slice().reverse()
        ];
    }

    widebox(width, length, height) {
        let half_side = [
            ...this.mark(this.mark_length),
            0,
            90,
            ...this.tab_description(length / 2 - this.margin, height),
            0,
            -90,
            height,
            0,
            ...this.mark(this.mark_length),
            0,
            90,
            ...this.tab_description(this.lid_sides, length),
            0,
            90,
            ...this.mark(this.mark_length),
            height,
            -90,
            ...this.tab_description(length / 2 - this.margin, height),
            length,
            0,
            ...this.mark(this.mark_length)
        ];
        return [
            ...this.side_with_finger_hole(width, this.finger_hole_diameter),
            ...half_side,
            ...this.lid_tab(width),
            ...half_side.slice().reverse()
        ];
    }

    lid_tab(width) {
        return [
            this.lid_height - this.lid_radius,
            [90, this.lid_radius],
            width - 2 * this.lid_radius,
            [90, this.lid_radius],
            this.lid_height - this.lid_radius
        ];
    }

    mark(length) {
        if (length === 0) {
            return [];
        }
        return [
            0,
            -90,
            length,
            180,
            length,
            -90
        ];
    }

    lid_cut(length, reverse = false) {
        let path = [90, length + this.thickness, -180, length, 90];
        return [0, ...(reverse ? path.slice().reverse() : path)];
    }

    side_with_finger_hole(width, finger_hole_diameter) {
        let half_width = (width - finger_hole_diameter) / 2;
        return [
            half_width,
            90,
            0,
            [-180, finger_hole_diameter / 2],
            0,
            90,
            half_width,
            0
        ];
    }

    tab_description(height, width) {
        let deg = this.tab_angle_rad * 180 / Math.PI;
        let side = height / Math.cos(this.tab_angle_rad);
        let end_width = width - 2 * height * Math.tan(this.tab_angle_rad);
        return [
            0,
            deg - 90,
            side,
            90 - deg,
            end_width,
            90 - deg,
            side,
            deg - 90
        ];
    }

    ear_description(length, lid_cut_length, reverse = false) {
        let ear_depth = Math.max(lid_cut_length, this.lid_height);
        let radius = Math.min(this.lid_radius, ear_depth - lid_cut_length);
        let start_margin = this.thickness;
        let end_margin = 2 * this.burn;
        let path = [
            start_margin,
            -90,
            lid_cut_length,
            90,
            0,
            [-90, radius],
            0,
            90,
            length - radius - start_margin - end_margin,
            90,
            ear_depth,
            -90,
            end_margin
        ];
        return [...(reverse ? path.slice().reverse() : path), 0];
    }

}

export { PaperBox };