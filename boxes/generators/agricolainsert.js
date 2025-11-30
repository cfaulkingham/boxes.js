import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class AgricolaInsert extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 1.0});
    }

    render() {
        let player_box_height = 34.5;
        let player_box_inner_width = 50.5;
        let bigger_box_inner_height = 36.7;
        let row_width = 37.2;
        let tray_inner_height = 17;
        let box_width = 218;
        let card_tray_height = (((this.thickness * 2) + tray_inner_height) + bigger_box_inner_height);
        let card_tray_width = (((305.35 - (player_box_inner_width * 2)) - (row_width * 2)) - (9 * this.thickness));
        this.render_card_divider_tray(card_tray_height, box_width, card_tray_width);
        this.render_upper_token_trays(tray_inner_height, box_width);
        let wood_room_box_width = 39.8;
        this.render_room_box(wood_room_box_width, bigger_box_inner_height, row_width);
        let stone_room_box_width = 26.7;
        this.render_room_box(stone_room_box_width, bigger_box_inner_height, row_width);
        let moor_box_length = 84.6;
        this.render_moor_box(bigger_box_inner_height, player_box_height, row_width, moor_box_length);
        let horse_box_margin = 0.5;
        let horse_box_length = (((((box_width - wood_room_box_width) - stone_room_box_width) - moor_box_length) - (6 * this.thickness)) - horse_box_margin);
        this.render_horse_box(player_box_height, row_width, horse_box_length);
        for (let _ = 0; _ < 6; _ += 1) {
            this.render_player_box(player_box_height, player_box_inner_width);
        }
    }

    render_card_divider_tray(card_tray_height, card_tray_length, card_tray_width) {;
        this.ctx.save();
        let tray_inner_length = (card_tray_length - this.thickness);
        let margin_for_score_sheet = 0;
        let sleeved_cards_width = (62 + margin_for_score_sheet);
        let rad = Math.acos((card_tray_height / sleeved_cards_width));
        let angle = (rad * 180 / Math.PI);
        let cos = Math.cos(rad);
        let tan = Math.tan(rad);
        let sin = Math.sin(rad);
        let slots_number = 19;
        let slot_depth = 30;
        let slot_descriptions = SlotDescriptionsGenerator.generate_all_same_angles(/* unknown node ListComp */, this.thickness, 0.2, slot_depth, card_tray_height, angle);
        slot_descriptions.adjust_to_target_length(tray_inner_length);
        let sloped_wall_height = (sleeved_cards_width - (this.thickness * (tan + (1 / tan))));
        let sloped_wall_posx_at_y0 = ((tray_inner_length - (sloped_wall_height * tan)) - (cos * this.thickness));
        let sloped_wall_posx = (sloped_wall_posx_at_y0 + ((cos * this.thickness) / 2));
        let sloped_wall_posy = ((sin * this.thickness) / 2);
        let dse = DividerSlotsEdge(this, slot_descriptions.descriptions);
        for (let _ = 0; _ < 2; _ += 1) {
            this.rectangularWall(tray_inner_length, card_tray_height, ["e", "e", dse, "f"], {move: "up", callback: [partial(() => this.fingerHolesAt(sloped_wall_posx, sloped_wall_posy, sloped_wall_height))]});
        }
        let spacer_height = (card_tray_height / 2);
        let spacer_spacing = (card_tray_width - 99.8);
        let spacer_upper_width = (sloped_wall_posx_at_y0 + (spacer_height * tan));
        this.trapezoidWall(spacer_height, spacer_upper_width, sloped_wall_posx_at_y0, "fefe", {move: "up rotated"});
        this.rectangularWall(card_tray_width, card_tray_height, "eFeF", {move: "up", callback: [partial(() => this.fingerHolesAt((spacer_spacing - (this.thickness / 2)), 0, spacer_height))]});
        this.rectangularWall(card_tray_width, sloped_wall_height, "efef", {move: "up", callback: [partial(this.generate_card_tray_sloped_wall_holes, card_tray_width, sloped_wall_height, spacer_height, spacer_spacing, rad)]});
        this.ctx.restore();
        this.rectangularWall(card_tray_length, 0, "FFFF", {move: "right only"});
        this.ctx.save();
        let divider_height = (sleeved_cards_width - (this.thickness * tan));
        this.generate_divider(card_tray_width, divider_height, slot_depth, spacer_spacing, "up");
        this.explain(["Wood divider", "Hard separation to keep the card", "from slipping in empty space left.", "Takes more space, but won't move.", "Duplicate as much as you want", "(I use 2)."]);
        this.ctx.restore();
        this.rectangularWall(card_tray_width, 0, "ffff", {move: "right only"});
        this.ctx.save();
        this.generate_paper_divider(card_tray_width, sleeved_cards_width, slot_depth, spacer_spacing, "up");
        this.explain(["Paper divider", "Soft separation to search easily", "the card group you need", "(by expansion, number of player,", "etc.).", "Duplicate as much as you want", "(I use 7)."]);
        this.ctx.restore();
        this.rectangularWall(card_tray_width, 0, "ffff", {move: "right only"});
    }

    explain(strings) {
        this.text(str.join("
", strings), {fontsize: 7, align: "bottom left"});
    }

    generate_sloped_wall_holes(side_wall_length, rad, sloped_wall_height) {
        let cos = Math.cos(rad);
        let tan = Math.tan(rad);
        let sin = Math.sin(rad);
        let posx_at_y0 = (side_wall_length - (sloped_wall_height * tan));
        let posx = (posx_at_y0 - ((cos * this.thickness) / 2));
        let posy = ((sin * this.thickness) / 2);
        this.fingerHolesAt(posx, posy, sloped_wall_height, {angle: (90 - (rad * 180 / Math.PI))});
    }

    generate_card_tray_sloped_wall_holes(side_wall_length, sloped_wall_height, spacer_height, spacer_spacing, rad) {
        this.fingerHolesAt((side_wall_length - (spacer_spacing - (this.thickness / 2))), (-this.thickness * Math.tan(rad)), (spacer_height / Math.cos(rad)));
        let radius = 5;
        let padding = 8;
        let total_loss = ((2 * radius) + (2 * padding));
        this.moveTo((radius + padding), padding);
        this.polyline((side_wall_length - total_loss), [90, radius], (sloped_wall_height - total_loss), [90, radius], (side_wall_length - total_loss), [90, radius], (sloped_wall_height - total_loss), [90, radius]);
    }

    generate_paper_divider(width, height, slot_depth, spacer_spacing, move) {;
        if (this.move(width, height, move, true)) {
            return;
        }
        let margin = 0.5;
        let actual_width = (width - margin);
        this.polyline((actual_width - spacer_spacing), 90, (height - slot_depth), -90, spacer_spacing, 90, slot_depth, 90, actual_width, 90, height, 90);
        this.move(width, height, move);
    }

    generate_divider(width, height, slot_depth, spacer_spacing, move) {;
        let total_width = (width + (2 * this.thickness));
        if (this.move(total_width, height, move, true)) {
            return;
        }
        let radius = 16;
        let padding = 20;
        let divider_notch_depth = 35;
        this.polyline((((this.thickness + spacer_spacing) + padding) - radius), [90, radius], ((divider_notch_depth - radius) - radius), [-90, radius], (((width - (2 * radius)) - (2 * padding)) - spacer_spacing), [-90, radius], ((divider_notch_depth - radius) - radius), [90, radius], ((this.thickness + padding) - radius), 90, slot_depth, 90, this.thickness, -90, (height - slot_depth), 90, (width - spacer_spacing), 90, (height - slot_depth), -90, (this.thickness + spacer_spacing), 90, slot_depth);
        this.move(total_width, height, move);
    }

    render_horse_box(player_box_height, row_width, width) {;
        let length = ((2 * row_width) + (3 * this.thickness));
        this.render_simple_tray(width, length, player_box_height);
    }

    render_moor_box(bigger_box_inner_height, player_box_height, row_width, length) {;
        this.ctx.save();
        let height = bigger_box_inner_height;
        let lowered_height = (player_box_height - this.thickness);
        let lowered_corner_height = (height - lowered_height);
        let corner_length = 53.5;
        this.rectangularWall(length, ((2 * row_width) + this.thickness), "FfFf", {move: "up", callback: [partial(() => this.fingerHolesAt(0, (row_width + (0.5 * this.thickness)), length, 0))]});
        for (let i = 0; i < 2; i += 1) {
            this.rectangularWall(length, lowered_height, ["f", "f", MoorBoxSideEdge(this, corner_length, lowered_corner_height, (i % 2) === 0), "f"], {move: "up"});
        }
        this.rectangularWall(length, (height / 2), "ffef", {move: "up"});
        for (let i = 0; i < 2; i += 1) {
            this.rectangularWall(((2 * row_width) + this.thickness), lowered_height, ["F", "F", MoorBoxHoleEdge(this, height, lowered_corner_height, (i % 2) === 0), "F"], {move: "up", callback: [partial(this.generate_side_finger_holes, row_width, (height / 2))]});
        }
        this.ctx.restore();
        this.rectangularWall(length, 0, "FFFF", {move: "right only"});
    }

    generate_side_finger_holes(row_width, height) {
        this.fingerHolesAt((row_width + (0.5 * this.thickness)), 0, height);
    }

    render_room_box(width, height, row_width) {;
        let border_height = 12;
        let room_box_length = ((row_width * 2) + this.thickness);
        this.ctx.save();
        this.rectangularWall(room_box_length, height, "eFfF", {move: "up", callback: [partial(this.generate_side_finger_holes, row_width, height)]});
        this.rectangularWall(room_box_length, width, "FFfF", {move: "up", callback: [partial(this.generate_side_finger_holes, row_width, width)]});
        this.rectangularWall(room_box_length, border_height, "FFeF", {move: "up", callback: [partial(this.generate_side_finger_holes, row_width, border_height)]});
        for (let _ = 0; _ < 3; _ += 1) {
            this.trapezoidWall(width, height, border_height, "ffef", {move: "up"});
        }
        this.ctx.restore();
        this.rectangularWall(room_box_length, 0, "FFFF", {move: "right only"});
    }

    render_player_box(player_box_height, player_box_inner_width) {;
        this.ctx.save();
        let bed_inner_height = (player_box_height - this.thickness);
        let bed_inner_length = 66.75;
        let bed_inner_width = player_box_inner_width;
        let cardboard_bed_foot_height = 6.5;
        let cardboard_bed_hole_margin = 5;
        let cardboard_bed_hole_length = 12;
        let bed_head_length = 20;
        let bed_foot_height = 18;
        let support_length = 38;
        let bed_edge = Bed2SidesEdge(this, bed_inner_length, bed_head_length, bed_foot_height);
        let noop_edge = edges.NoopEdge(this);
        this.ctx.save();
        let optim_180_x = (((bed_inner_length + this.thickness) + bed_head_length) + (2 * this.spacing));
        let optim_180_y = (((2 * bed_foot_height) - player_box_height) + (2 * this.spacing));
        for (let _ = 0; _ < 2; _ += 1) {
            this.rectangularWall(bed_inner_length, bed_inner_height, ["F", bed_edge, noop_edge, "F"], {move: "up"});
            this.moveTo(optim_180_x, optim_180_y, -180);
        }
        this.ctx.restore();
        this.moveTo(0, (((bed_inner_height + this.thickness) + this.spacing) + optim_180_y));
        this.rectangularWall(bed_inner_length, bed_inner_width, "feff", {move: "up", callback: [partial(this.generate_bed_holes, bed_inner_width, cardboard_bed_hole_margin, cardboard_bed_hole_length, support_length)]});
        this.ctx.save();
        this.rectangularWall(bed_inner_width, bed_inner_height, ["F", "f", BedHeadEdge(this, (bed_inner_height - 15)), "f"], {move: "right"});
        for (let _ = 0; _ < 2; _ += 1) {
            this.rectangularWall((cardboard_bed_foot_height - this.thickness), support_length, "efee", {move: "right"});
        }
        this.ctx.restore();
        this.rectangularWall(bed_inner_width, bed_inner_height, "Ffef", {move: "up only"});
        this.ctx.restore();
        this.rectangularWall((((bed_inner_length + bed_head_length) + this.spacing) - this.thickness), 0, "FFFF", {move: "right only"});
    }

    generate_bed_holes(width, margin, hole_length, support_length) {
        let support_start = (margin + hole_length);
        let bed_width = 29.5;
        let bed_space_to_wall = ((width - bed_width) / 2);
        let bed_feet_width = 3;
        let posy_1 = bed_space_to_wall;
        let posy_2 = (width - bed_space_to_wall);
        for (let [y, direction] of [[posy_1, 1], [posy_2, -1]]) {
            let bed_feet_middle_y = (y + ((direction * bed_feet_width) / 2));
            let support_middle_y = (y + ((direction * this.thickness) / 2));
            this.rectangularHole(margin, bed_feet_middle_y, hole_length, bed_feet_width, {center_x: false});
            this.fingerHolesAt(support_start, support_middle_y, support_length, {angle: 0});
            this.rectangularHole((support_start + support_length), bed_feet_middle_y, hole_length, bed_feet_width, {center_x: false});
        }
    }

    render_upper_token_trays(tray_inner_height, box_width) {;
        let tray_height = (tray_inner_height + this.thickness);
        let upper_level_width = 196;
        let upper_level_length = box_width;
        let row_width = (upper_level_width / 3);
        this.render_simple_tray(row_width, upper_level_length, tray_height, 3);
        this.render_simple_tray(row_width, ((upper_level_length * 2) / 3), tray_height, 2);
        this.render_simple_tray(row_width, ((upper_level_length * 2) / 3), tray_height, 1);
        this.render_simple_tray((upper_level_length / 3), (row_width * 2), tray_height, 1);
    }

    render_simple_tray(outer_width, outer_length, outer_height, dividers) {;
        let width = (outer_width - (2 * this.thickness));
        let length = (outer_length - (2 * this.thickness));
        let height = (outer_height - this.thickness);
        this.ctx.save();
        this.rectangularWall(width, length, "FFFF", {move: "up"});
        for (let _ = 0; _ < 2; _ += 1) {
            this.rectangularWall(width, height, "ffef", {move: "up"});
        }
        this.ctx.restore();
        this.rectangularWall(width, length, "FFFF", {move: "right only"});
        for (let _ = 0; _ < 2; _ += 1) {
            this.rectangularWall(height, length, "FfFe", {move: "right"});
        }
        if (dividers) {
            this.ctx.save();
            for (let _ = 0; _ < dividers; _ += 1) {
                this.render_simple_tray_divider(width, height, "up");
            }
            this.ctx.restore();
            this.render_simple_tray_divider(width, height, "right only");
        }
    }

    render_simple_tray_divider(width, height, move) {;
        if (this.move(height, width, move, true)) {
            return;
        }
        let t = this.thickness;
        this.polyline((height - t), 90, t, -90, t, 90, (width - (2 * t)), 90, t, -90, t, 90, (height - t), 90, width, 90);
        this.move(height, width, move);
        this.render_simple_tray_divider_feet(width, height, move);
    }

    render_simple_tray_divider_feet(width, height, move) {
        let sqr2 = Math.sqrt(2);
        let t = this.thickness;
        let divider_foot_width = (2 * t);
        let full_width = (t + (2 * divider_foot_width));
        let move_length = (this.spacing + (full_width / sqr2));
        let move_width = (this.spacing + Math.max(full_width, height));
        if (this.move(move_width, move_length, move, true)) {
            return;
        }
        this.ctx.save();
        this.polyline((sqr2 * divider_foot_width), 135, t, -90, t, -90, t, 135, (sqr2 * divider_foot_width), 135, full_width, 135);
        this.ctx.restore();
        this.moveTo((-this.burn / sqr2), (this.burn * (1 + (1 / sqr2))), 45);
        this.moveTo(full_width);
        this.polyline(0, 135, (sqr2 * divider_foot_width), 135, t, -90, t, -90, t, 135, (sqr2 * divider_foot_width), 135);
        this.move(move_width, move_length, move);
    }

}

export { AgricolaInsert };
class MoorBoxSideEdge extends Boxes {
    constructor(boxes, corner_length, corner_height, lower_corner) {
        super();
        this.corner_height = corner_height;
        this.lower_corner = lower_corner;
        this.corner_length = corner_length;
    }

    __call__(length) {
        let radius = (this.corner_height / 2);
        if (this.lower_corner) {
            this.polyline(((length - this.corner_height) - this.corner_length), [90, radius], 0, [-90, radius], this.corner_length);
        }
        else {
            this.polyline(length);
        }
    }

    startwidth() {
        return this.corner_height;
    }

    endwidth() {
        return (this.lower_corner ? 0.0 : this.corner_height);
    }

}

export { MoorBoxSideEdge };
class MoorBoxHoleEdge extends Boxes {
    constructor(boxes, height, corner_height, lower_corner) {
        super();
        this.height = height;
        this.corner_height = corner_height;
        this.lower_corner = lower_corner;
    }

    __call__(length) {
        let one_side_width = ((length - this.thickness) / 2);
        let notch_width = 20;
        let radius = 6;
        let upper_edge = (((one_side_width - notch_width) - (2 * radius)) / 2);
        let hole_start = 10;
        let lowered_hole_start = 2;
        let hole_depth = (this.height - (2 * radius));
        let lower_edge = (notch_width - (2 * radius));
        let one_side_polyline = (margin1, margin2) => [upper_edge, [90, radius], (hole_depth - margin1), [-90, radius], lower_edge, [-90, radius], (hole_depth - margin2), [90, radius], upper_edge];
        let normal_side_polyline = one_side_polyline(hole_start, hole_start);
        let corner_side_polyline = one_side_polyline(lowered_hole_start, (lowered_hole_start + this.corner_height));
        let full_polyline = ((normal_side_polyline + [0, this.thickness, 0]) + (this.lower_corner ? corner_side_polyline : normal_side_polyline));
        this.polyline(...full_polyline);
    }

    startwidth() {
        return this.corner_height;
    }

    endwidth() {
        return (this.lower_corner ? 0.0 : this.corner_height);
    }

}

export { MoorBoxHoleEdge };
class BedHeadEdge extends Boxes {
    constructor(boxes, hole_depth) {
        super();
        this.hole_depth = hole_depth;
    }

    __call__(length) {
        let hole_length = 16;
        let upper_corner = 10;
        let lower_corner = 6;
        let depth = ((this.hole_depth - upper_corner) - lower_corner);
        let upper_edge = (((length - hole_length) - (2 * upper_corner)) / 2);
        let lower_edge = (hole_length - (2 * lower_corner));
        this.polyline(upper_edge, [90, upper_corner], depth, [-90, lower_corner], lower_edge, [-90, lower_corner], depth, [90, upper_corner], upper_edge);
    }

}

export { BedHeadEdge };
class Bed2SidesEdge extends Boxes {
    constructor(boxes, bed_length, full_head_length, full_foot_height) {
        super();
        this.bed_length = bed_length;
        this.full_head_length = full_head_length;
        this.full_foot_height = full_foot_height;
    }

    __call__(bed_height) {
        let foot_corner = 6;
        let middle_corner = 3;
        let head_corner = 10;
        let foot_height = ((this.full_foot_height - this.thickness) - foot_corner);
        let head_length = ((this.full_head_length - head_corner) - this.thickness);
        let corners = ((foot_corner + middle_corner) + head_corner);
        let head_height = ((bed_height - foot_height) - corners);
        let middle_length = ((this.bed_length - head_length) - corners);
        this.polyline(foot_height, [90, foot_corner], middle_length, [-90, middle_corner], head_height, [90, head_corner], head_length);
    }

}

export { Bed2SidesEdge };