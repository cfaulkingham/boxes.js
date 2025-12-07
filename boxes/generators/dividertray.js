import { Boxes  } from '../boxes.js';
import { FingerJointSettings, BaseEdge  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import * as lids from '../lids.js';
import '../globals.js';

const { boolarg, list, enumerate, reversed } = global;
// dict import removed - using native JS Map instead

class NotchSettings extends Boxes {
}

export { NotchSettings };
class SlotSettings extends Boxes {
}

export { SlotSettings };
class DividerSettings extends Boxes {
}

export { DividerSettings };
class DividerTray extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.HandleEdgeSettings);
        this.addSettingsArgs(lids.LidSettings);
        // this.buildArgParser("sx", "sy", "h", "outside");
        this.addSettingsArgs(SlotSettings);
        this.addSettingsArgs(NotchSettings);
        this.addSettingsArgs(DividerSettings);
        this.argparser.add_argument("--notches_in_wall", {type: boolarg, default: true, help: "generate the same notches on the walls that are on the dividers"});
        this.argparser.add_argument("--left_wall", {type: boolarg, default: true, help: "generate wall on the left side"});
        this.argparser.add_argument("--right_wall", {type: boolarg, default: true, help: "generate wall on the right side"});
        this.argparser.add_argument("--bottom", {type: boolarg, default: false, help: "generate wall on the bottom"});
        this.argparser.add_argument("--handle", {type: boolarg, default: false, help: "add handle to the bottom"});
    }

    render() {
        let side_walls_number = ((this.sx.length - 1) + [this.left_wall, this.right_wall].reduce((a, b) => a + b, 0));
        if (side_walls_number === 0) {
            throw new Error("You need at least one side wall to generate this tray");
        }
        if (this.outside) {
            if (this.bottom) {
                this.h -= this.thickness;
            }
        }
        else {
            this.h = (this.h * Math.cos((this.Slot_angle * Math.PI / 180)));
        }
        let slot_descriptions = SlotDescriptionsGenerator.generate_all_same_angles(this.sy, this.thickness, this.Slot_extra_slack, this.Slot_depth, this.h, this.Slot_angle, this.Slot_radius);
        if (this.outside) {
            this.sx = this.adjustSize(this.sx, this.left_wall, this.right_wall);
            let side_wall_target_length = (this.sy.reduce((a, b) => a + b, 0) - (2 * this.thickness));
            slot_descriptions.adjust_to_target_length(side_wall_target_length);
        }
        this.ctx.save();
        let facing_wall_length = (this.sx.reduce((a, b) => a + b, 0) + (this.thickness * (this.sx.length - 1)));
        let side_edge = (with_wall) => (with_wall ? "F" : "e");
        let bottom_edge = (with_wall, with_handle) => (with_wall ? (with_handle ? "f" : "F") : "e");
        let upper_edge = (this.notches_in_wall ? new DividerNotchesEdge(this, list(reversed(this.sx))) : "e");
        for (let _ = 0; _ < 2; _ += 1) {
            this.rectangularWall(facing_wall_length, this.h, [bottom_edge(this.bottom, (_ && this.handle)), side_edge(this.right_wall), upper_edge, side_edge(this.left_wall)], {callback: [() => this.generate_finger_holes(this.h)], move: "up", label: (_ ? "Front" : "Back")});
        }
        let side_wall_length = slot_descriptions.total_length();
        for (let _ = 0; _ < side_walls_number; _ += 1) {
            let be;
            if (_ < (side_walls_number - (this.sx.length - 1))) {
                be = (this.bottom ? "F" : "e");
            }
            else {
                be = (this.bottom ? "f" : "e");
            }
            let se = new DividerSlotsEdge(this, slot_descriptions.descriptions);
            this.rectangularWall(side_wall_length, this.h, [be, "f", se, "f"], {move: "up", label: ("Sidepiece " + (_ + 1))});
        }
        this.lid(facing_wall_length, side_wall_length);
        this.ctx.restore();
        this.rectangularWall(Math.max(facing_wall_length, side_wall_length), this.h, "ffff", {move: "right only", label: "invisible"});
        if (this.bottom) {
            this.rectangularWall(facing_wall_length, side_wall_length, ["f", (this.right_wall ? "f" : "e"), (this.handle ? "Y" : "f"), (this.left_wall ? "f" : "e")], {callback: [() => this.generate_finger_holes(side_wall_length)], move: "up", label: "Bottom"});
        }
        let divider_height = (((this.h / Math.cos((this.Slot_angle * Math.PI / 180))) - (this.thickness * Math.tan((this.Slot_angle * Math.PI / 180)))) - this.Divider_bottom_margin);
        this.generate_divider(this.sx, divider_height, "up", {first_tab_width: (this.left_wall ? this.thickness : 0), second_tab_width: (this.right_wall ? this.thickness : 0)});
        for (let [tabs, asymmetric_tabs] of [[this.thickness, null], [(this.thickness / 2), null], [this.thickness, 0.5]]) {
            this.ctx.save();
            for (let [i, length] of enumerate(this.sx)) {
                this.generate_divider([length], divider_height, "right", {first_tab_width: ((this.left_wall || i > 0) ? tabs : 0), second_tab_width: ((this.right_wall || i < (this.sx.length - 1)) ? tabs : 0), asymmetric_tabs: asymmetric_tabs});
                if (asymmetric_tabs) {
                    this.moveTo(-tabs, this.spacing);
                }
            }
            this.ctx.restore();
            this.generate_divider(this.sx, divider_height, "up only");
        }
        if (this.debug) {
            // Debug output - simplified for JS port
            let debug_info = ["Debug"];
            debug_info.push(`Slot angle: ${this.Slot_angle}`);
            debug_info.push(`Slot depth: ${this.Slot_depth}`);
            this.text(debug_info.join("\n"), {x: 5, y: 5, align: "bottom left"});
        }
    }

    generate_finger_holes(length) {
        let posx = (-0.5 * this.thickness);
        for (let x of this.sx.slice(0, -1)) {
            posx += (x + this.thickness);
            this.fingerHolesAt(posx, 0, length);
        }
    }

    generate_divider(widths, height, move, options = {}) {
        // Extract options with defaults
        let first_tab_width = options.first_tab_width || 0;
        let second_tab_width = options.second_tab_width || 0;
        let asymmetric_tabs = options.asymmetric_tabs || null;
        
        // Ensure widths is an array
        if (!Array.isArray(widths)) {
            throw new Error("widths must be an array");
        }
        
        let total_width = (((widths.reduce((a, b) => a + b, 0) + ((widths.length - 1) * this.thickness)) + first_tab_width) + second_tab_width);
        if (this.move(total_width, height, move, true)) {
            return;
        }
        let play = this.Divider_play || 0;
        let left_tab_height = height;
        let right_tab_height = height;
        
        if (asymmetric_tabs !== null) {
            left_tab_height = ((height * asymmetric_tabs) - play);
            right_tab_height = (height * (1 - asymmetric_tabs));
        }
        
        if (asymmetric_tabs !== null) {
            this.moveTo((first_tab_width - play));
        }
        else {
            this.edge((first_tab_width - play));
        }
        for (let [nr, width] of enumerate(widths)) {
            if (nr > 0) {
                this.edge(this.thickness);
            }
            // Draw notches directly
            let upper_third = (((width - (2 * 1)) - (2 * 1)) / 3); // Using default notch radii
            if (upper_third > 0) {
                let straightHeight = ((5 - 1) - 1); // Using default notch depth
                this.polyline(
                    upper_third,
                    [90, 1],
                    straightHeight,
                    [-90, 1],
                    upper_third,
                    [-90, 1],
                    straightHeight,
                    [90, 1],
                    upper_third
                );
            }
            else {
                this.edge(width);
            }
        }
        this.polyline((second_tab_width - play), 90, left_tab_height, 90, second_tab_width, -90, (height - left_tab_height), 90);
        for (let width of reversed(widths.slice(1))) {
            this.polyline((width - (2 * play)), 90, (height - this.Slot_depth), -90, (this.thickness + (2 * play)), -90, (height - this.Slot_depth), 90);
        }
        this.polyline((widths[0] - (2 * play)), 90, (height - this.Slot_depth), -90, first_tab_width, 90, right_tab_height, 90);
        if (asymmetric_tabs !== null) {
            this.polyline((first_tab_width - play), -90, (this.Slot_depth - right_tab_height), 90);
        }
        this.move(total_width, height, move, {label: "Divider"});
    }

}

export { DividerTray };
class SlottedEdgeDescriptions {
    constructor() {
        this.descriptions = [];
    }

    add(description) {
        this.descriptions.push(description);
    }

    get_straight_edges() {
        // Filter descriptions to only StraightEdgeDescription instances
        return this.descriptions.filter(d => d instanceof StraightEdgeDescription);
    }

    get_last_edge() {
        return this.descriptions[this.descriptions.length - 1];
    }

    adjust_to_target_length(target_length) {
        // Sum of tracing_length() for ALL descriptions (slots and straight edges)
        let actual_length = this.descriptions.map(d => d.tracing_length()).reduce((a, b) => a + b, 0);
        let compensation = (actual_length - target_length);
        // Sum of asked_length for straight edges only (for ratio calculation)
        let straight_edges = this.get_straight_edges();
        let total_asked = straight_edges.map(d => d.asked_length).reduce((a, b) => a + b, 0);
        let compensation_ratio = (compensation / total_asked);
        for (let edge of straight_edges) {
            edge.outside_ratio = (1 - compensation_ratio);
        }
    }

    total_length() {
        // Sum of tracing_length() for all descriptions
        return this.descriptions.map(d => d.tracing_length()).reduce((a, b) => a + b, 0);
    }

}

export { SlottedEdgeDescriptions };
class StraightEdgeDescription {
    constructor(asked_length, round_edge_compensation = 0, outside_ratio = 1, angle_compensation = 0) {
        this.asked_length = asked_length;
        this.round_edge_compensation = round_edge_compensation;
        this.outside_ratio = outside_ratio;
        this.angle_compensation = angle_compensation;
    }

    toString() {
        return `StraightEdgeDescription(${this.asked_length}, ${this.round_edge_compensation}, ${this.outside_ratio}, ${this.angle_compensation})`;
    }

    tracing_length() {
        return (((this.asked_length * this.outside_ratio) - this.round_edge_compensation) + this.angle_compensation);
    }

    useful_length() {
        return (this.asked_length * this.outside_ratio);
    }

}

export { StraightEdgeDescription };
class Memoizer extends Map {
    constructor(computation) {
        super();
        this.computation = computation;
    }

    get(key) {
        if (!super.has(key)) {
            const res = this.computation(key);
            super.set(key, res);
            return res;
        }
        return super.get(key);
    }

}

export { Memoizer };
class SlotDescription {
    constructor(width, depth = 20, angle = 0, radius = 0, start_radius = null, end_radius = null) {
        this.depth = depth;
        this.width = width;
        this.start_radius = (start_radius === null ? radius : start_radius);
        this.end_radius = (end_radius === null ? radius : end_radius);
        this.angle = angle;
    }

    toString() {
        return `SlotDescription(width=${this.width}, depth=${this.depth}, angle=${this.angle})`;
    }

    _div_by_cos() {
        // Memoization would be nice, but let's just compute
        return 1 / Math.cos(this.angle * Math.PI / 180);
    }

    _tan() {
        return Math.tan(this.angle * Math.PI / 180);
    }

    angle_corrected_width() {
        return (this.width * this._div_by_cos());
    }

    round_edge_start_correction() {
        return (this.start_radius * (this._div_by_cos() - this._tan()));
    }

    round_edge_end_correction() {
        return (this.end_radius * (this._div_by_cos() + this._tan()));
    }

    _depth_angle_correction() {
        let extra_depth = (this.width * this._tan());
        return extra_depth;
    }

    corrected_start_depth() {
        let extra_depth = this._depth_angle_correction();
        return ((this.depth + Math.max(0, extra_depth)) - this.round_edge_start_correction());
    }

    corrected_end_depth() {
        let extra_depth = this._depth_angle_correction();
        return ((this.depth + Math.max(0, -extra_depth)) - this.round_edge_end_correction());
    }

    tracing_length() {
        return ((this.round_edge_start_correction() + this.angle_corrected_width()) + this.round_edge_end_correction());
    }

}

export { SlotDescription };
class SlotDescriptionsGenerator {
    generate_all_same_angles(sections, thickness, extra_slack, depth, height, angle, radius = 2) {
        let width = (thickness + extra_slack);
        let descriptions = new SlottedEdgeDescriptions();
        let first_correction = 0;
        let current_section = 0;
        let slot;
        if (sections[0] === 0) {
            slot = new SlotDescription(width, depth, angle, radius, 0, radius);
            descriptions.add(slot);
            first_correction = slot.round_edge_end_correction();
            current_section += 1;
        }
        let first_length = sections[current_section];
        current_section += 1;
        descriptions.add(new StraightEdgeDescription(first_length, first_correction));
        for (let l of sections.slice(current_section)) {
            slot = new SlotDescription(width, depth, angle, radius);
            let previous_edge = descriptions.get_last_edge();
            previous_edge.round_edge_compensation += slot.round_edge_start_correction();
            descriptions.add(slot);
            descriptions.add(new StraightEdgeDescription(l, slot.round_edge_end_correction()));
        }
        let end_length = (height * Math.tan((angle * Math.PI / 180)));
        descriptions.get_last_edge().angle_compensation += end_length;
        return descriptions;
    }

}

export { SlotDescriptionsGenerator };
class DividerNotchesEdge extends BaseEdge {
    constructor(boxes, sx) {
        super(boxes, null);
        this.sx = sx;
        // Default notch settings
        this.Notch_upper_radius = 1;
        this.Notch_lower_radius = 1;
        this.Notch_depth = 5;
    }

    draw(_, kw = {}) {
        let first = true;
        for (let width of this.sx) {
            if (first) {
                first = false;
            }
            else {
                this.boxes.edge(this.boxes.thickness);
            }
            this.edge_with_notch.call(this, width);
        }
    }

    edge_with_notch(width) {
        let upper_third = (((width - (2 * this.Notch_upper_radius)) - (2 * this.Notch_lower_radius)) / 3);
        if (upper_third > 0) {
            let straightHeight = ((this.Notch_depth - this.Notch_upper_radius) - this.Notch_lower_radius);
            this.boxes.polyline(
                upper_third,
                [90, this.Notch_upper_radius],
                straightHeight,
                [-90, this.Notch_lower_radius],
                upper_third,
                [-90, this.Notch_lower_radius],
                straightHeight,
                [90, this.Notch_upper_radius],
                upper_third
            );
        }
        else {
            this.boxes.edge(width);
        }
    }

}

export { DividerNotchesEdge };
class DividerSlotsEdge extends BaseEdge {
    constructor(boxes, descriptions) {
        super(boxes, null);
        this.descriptions = descriptions;
    }

    draw(length, kw = {}) {
        this.boxes.ctx.save();
        for (let description of this.descriptions) {
            if (description instanceof SlotDescription) {
                this.do_slot(description);
            }
            else if (description instanceof StraightEdgeDescription) {
                this.do_straight_edge(description);
            }
        }
        this.boxes.ctx.restore();
        this.boxes.moveTo(length);
    }

    do_straight_edge(straight_edge) {
        this.boxes.edge(straight_edge.tracing_length());
    }

    do_slot(slot) {
        this.boxes.ctx.save();
        this.boxes.polyline(
            0,
            [(90 - slot.angle), slot.start_radius],
            slot.corrected_start_depth(),
            -90,
            slot.width,
            -90,
            slot.corrected_end_depth(),
            [(90 + slot.angle), slot.end_radius]
        );
        this.boxes.ctx.restore();
        this.boxes.moveTo(slot.tracing_length());
    }

}

export { DividerSlotsEdge };