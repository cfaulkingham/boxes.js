import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class PhoneHolder extends Boxes {
    constructor() {
        super();
        this.argparser.add_argument("--phone_height", {type: "float", default: 142, help: "Height of the phone."});
        this.argparser.add_argument("--phone_width", {type: "float", default: 73, help: "Width of the phone."});
        this.argparser.add_argument("--phone_depth", {type: "float", default: 11, help: "Depth of the phone. Used by the bottom support holding the phone, and the side tabs depth as well. Should be at least your material thickness for assembly reasons."});
        this.argparser.add_argument("--angle", {type: "float", default: 25, help: "angle at which the phone stands, in degrees. 0° is vertical."});
        this.argparser.add_argument("--bottom_margin", {type: "float", default: 30, help: "Height of the support below the phone"});
        this.argparser.add_argument("--tab_size", {type: "float", default: 76, help: "Length of the tabs holding the phone"});
        this.argparser.add_argument("--bottom_support_spacing", {type: "float", default: 16, help: "Spacing between the two bottom support. Choose a value big enough for the charging cable, without getting in the way of other ports."});
        this.addSettingsArgs(edges.FingerJointSettings);
    }

    render() {
        this.h = (this.phone_height + this.bottom_margin);
        let tab_start = this.bottom_margin;
        let tab_length = this.tab_size;
        let tab_depth = this.phone_depth;
        let support_depth = this.phone_depth;
        let support_spacing = this.bottom_support_spacing;
        let rad = (this.angle * Math.PI / 180);
        this.stand_depth = (this.h * Math.sin(rad));
        this.stand_height = (this.h * Math.cos(rad));
        this.render_front_plate(tab_start, tab_length, support_spacing, {move: "right"});
        this.render_back_plate({move: "right"});
        this.render_side_plate(tab_start, tab_length, tab_depth, {move: "right"});
        for (let move of ["right mirror", "right"]) {
            this.render_bottom_support(tab_start, support_depth, tab_length, {move: move});
        }
    }

    render_front_plate(tab_start, tab_length, support_spacing, support_fingers_length, move) {
        if (!support_fingers_length) {
            support_fingers_length = tab_length;
        }
        let be = BottomEdge(this, tab_start, support_spacing);
        let se1 = SideEdge(this, tab_start, tab_length);
        let se2 = SideEdge(this, tab_start, tab_length);
        this.rectangularWall(this.phone_width, this.h, [be, se1, "e", se2], {move: move, callback: [partial(() => this.front_plate_holes(tab_start, support_fingers_length, support_spacing))]});
    }

    render_back_plate(move) {
        let be = BottomEdge(this, 0, 0);
        this.rectangularWall(this.phone_width, this.stand_height, [be, "F", "e", "F"], {move: move});
    }

    front_plate_holes(support_start_height, support_fingers_length, support_spacing) {
        let margin = (((this.phone_width - support_spacing) - this.thickness) / 2);
        this.fingerHolesAt(margin, support_start_height, support_fingers_length);
        this.fingerHolesAt((this.phone_width - margin), support_start_height, support_fingers_length);
    }

    render_side_plate(tab_start, tab_length, tab_depth, move) {
        let te = TabbedEdge(this, tab_start, tab_length, tab_depth);
        this.rectangularTriangle(this.stand_depth, this.stand_height, ["e", "f", te], {move: move, num: 2});
    }

    render_bottom_support(support_start_height, support_depth, support_fingers_length, move) {
        let full_height = (support_start_height + support_fingers_length);
        let rad = (this.angle * Math.PI / 180);
        let floor_length = (full_height * Math.sin(rad));
        let angled_height = (full_height * Math.cos(rad));
        let bottom_radius = Math.min(support_start_height, ((3 * this.thickness) + support_depth));
        let smaller_radius = 0.5;
        let support_hook_height = 5;
        let full_width = (floor_length + ((support_depth + (3 * this.thickness)) * Math.cos(rad)));
        if (this.move(full_width, angled_height, move, true)) {
            return;
        }
        this.polyline(floor_length, this.angle, (((3 * this.thickness) + support_depth) - bottom_radius), [90, bottom_radius], ((support_hook_height + support_start_height) - bottom_radius), [180, this.thickness], (support_hook_height - smaller_radius), [-90, smaller_radius], ((this.thickness + support_depth) - smaller_radius), -90);
        this.edges["f"](support_fingers_length);
        this.polyline(0, (180 - this.angle), angled_height, 90);
        this.move(full_width, angled_height, move);
    }

}

export { PhoneHolder };
class BottomEdge extends Boxes {
    constructor(boxes, support_start_height, support_spacing) {
        super();
        this.support_start_height = support_start_height;
        this.support_spacing = support_spacing;
    }

    __call__(length) {
        let cable_hole_radius = 2.5;
        this.support_spacing = Math.max(this.support_spacing, (2 * cable_hole_radius));
        let side = (((length - this.support_spacing) - (2 * this.thickness)) / 2);
        let half = [side, 90, this.support_start_height, -90, this.thickness, -90, this.support_start_height, 90, ((this.support_spacing / 2) - cable_hole_radius), 90, (2 * cable_hole_radius)];
        let path = ((half + [[-180, cable_hole_radius]]) + list(reversed(half)));
        this.polyline(...path);
    }

}

export { BottomEdge };
class SideEdge extends Boxes {
    constructor(boxes, tab_start, tab_length, reverse) {
        super();
        this.tab_start = tab_start;
        this.tab_length = tab_length;
        this.reverse = reverse;
    }

    __call__(length) {
        let tab_start = this.tab_start;
        let tab_end = ((length - this.tab_start) - this.tab_length);
        if (this.reverse) {
            [tab_start, tab_end] = [tab_end, tab_start];
        }
        this.edges["F"](tab_start);
        this.polyline(0, 90, this.thickness, -90);
        this.edges["f"](this.tab_length);
        this.polyline(0, -90, this.thickness, 90);
        this.edges["F"](tab_end);
    }

    startwidth() {
        return this.boxes.thickness;
    }

}

export { SideEdge };
class TabbedEdge extends Boxes {
    constructor(boxes, tab_start, tab_length, tab_depth, reverse) {
        super();
        this.tab_start = tab_start;
        this.tab_length = tab_length;
        this.tab_depth = tab_depth;
        this.reverse = reverse;
    }

    __call__(length) {
        let tab_start = this.tab_start;
        let tab_end = ((length - this.tab_start) - this.tab_length);
        if (this.reverse) {
            [tab_start, tab_end] = [tab_end, tab_start];
        }
        this.edges["f"](tab_start);
        this.ctx.save();
        this.fingerHolesAt(0, (-this.thickness / 2), this.tab_length, 0);
        this.ctx.restore();
        this.polyline(0, -90, this.thickness, [90, this.tab_depth], (this.tab_length - (2 * this.tab_depth)), [90, this.tab_depth], this.thickness, -90);
        this.edges["f"](tab_end);
    }

    margin() {
        return (this.tab_depth + this.thickness);
    }

}

export { TabbedEdge };