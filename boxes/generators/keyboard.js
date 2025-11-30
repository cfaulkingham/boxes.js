import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Keyboard extends Boxes {
    constructor() {
        super();
    }

    add_common_keyboard_parameters(add_hotswap_parameter, add_pcb_mount_parameter, add_led_parameter, add_diode_parameter, add_cutout_type_parameter, default_columns_definition) {
        if (add_hotswap_parameter) {
            this.argparser.add_argument("--hotswap_enable", {action: "store", type: boolarg, default: true, help: "enlarge switches holes for hotswap pcb sockets"});
        }
        if (add_pcb_mount_parameter) {
            this.argparser.add_argument("--pcb_mount_enable", {action: "store", type: boolarg, default: true, help: "adds holes for pcb mount switches"});
        }
        if (add_led_parameter) {
            this.argparser.add_argument("--led_enable", {action: "store", type: boolarg, default: false, help: "adds pin holes under switches for leds"});
        }
        if (add_diode_parameter) {
            this.argparser.add_argument("--diode_enable", {action: "store", type: boolarg, default: false, help: "adds pin holes under switches for diodes"});
        }
        if (add_cutout_type_parameter) {
            this.argparser.add_argument("--cutout_type", {action: "store", type: "str", default: "castle", help: "Shape of the plate cutout: 'castle' allows for modding, and 'simple' is a tighter and simpler square"});
        }
        if (default_columns_definition) {
            this.argparser.add_argument("--columns_definition", {type: this.argparseColumnsDefinition, default: default_columns_definition, help: "Each column is separated by '/', and is in the form 'nb_rows @ offset x repeat_count'. Nb_rows is the number of rows for this column. The offset is in mm and optional. Repeat_count is optional and repeats this column multiple times. Spaces are not important.For example '3x2 / 4@11' means we want 3 columns, the two first with 3 rows without offset, and the last with 4 rows starting at 11mm high."});
        }
    }

    argparseColumnsDefinition(s) {;
        let result = [];
        for (let column_string of s.split("/")) {
            let m = re.match("^\s*(\d+)\s*@?\s*(\d*\.?\d*)(?:\s*x\s*(\d+))?\s*$", column_string);
            let keys_count = parseInt(m.group(1));
            let offset = (m.group(2) ? float(m.group(2)) : 0);
            let n = (m.group(3) ? parseInt(m.group(3)) : 1);
            result.extend(([[offset, keys_count]] * n));
        }
        argparse.ArgumentTypeError("Don't understand columns definition string")
        return result;
    }

    pcb_holes(with_hotswap, with_pcb_mount, with_led, with_diode) {
        let grid_unit = 1.27;
        let main_hole_size = 4;
        let pcb_mount_size = 1.7;
        let led_hole_size = 1;
        if (with_hotswap) {
            let pin_hole_size = 2.9;
        }
        else {
            pin_hole_size = 1.5;
        }
        const grid_hole = (x, y, d) => {
            this.hole((grid_unit * x), (grid_unit * y), {d: d});
        };

        grid_hole(0, 0, main_hole_size);
        grid_hole(-3, 2, pin_hole_size);
        grid_hole(2, 4, pin_hole_size);
        if (with_pcb_mount) {
            grid_hole(-4, 0, pcb_mount_size);
            grid_hole(4, 0, pcb_mount_size);
        }
        if (with_led) {
            grid_hole(-1, -4, led_hole_size);
            grid_hole(1, -4, led_hole_size);
        }
        if (with_diode) {
            grid_hole(-3, -4, led_hole_size);
            grid_hole(3, -4, led_hole_size);
        }
    }

    apply_callback_on_columns(cb, columns_definition, spacing, reverse) {
        if (spacing === null) {
            spacing = this.STANDARD_KEY_SPACING;
        }
        if (reverse) {
            columns_definition = list(reversed(columns_definition));
        }
        for (let [offset, nb_keys] of columns_definition) {
            this.moveTo(0, offset);
            for (let _ = 0; _ < nb_keys; _ += 1) {
                cb();
                this.moveTo(0, spacing);
            }
            this.moveTo(spacing, (-nb_keys * spacing));
            this.moveTo(0, -offset);
        }
        let total_width = (columns_definition.length * spacing);
        this.moveTo((-1 * total_width));
    }

    outer_hole(radius, centered) {;
        let half_size = (Keyboard.SWITCH_CASE_SIZE / 2);
        if (centered) {
            this.moveTo(-half_size, -half_size);
        }
        let straight_edge = (Keyboard.SWITCH_CASE_SIZE - (2 * radius));
        let polyline = ([straight_edge, [-90, radius]] * 4);
        this.moveTo(this.burn, radius, 90);
        this.polyline(...polyline);
        this.moveTo(0, 0, 270);
        this.moveTo(0, -radius);
        this.moveTo(-this.burn);
        if (centered) {
            this.moveTo(half_size, half_size);
        }
    }

    castle_shaped_plate_cutout(centered) {;
        let half_size = (Keyboard.SWITCH_CASE_SIZE / 2);
        if (centered) {
            this.moveTo(-half_size, -half_size);
        }
        let btn_half_side = [0.98, 90, 0.81, -90, 3.5, -90, 0.81, 90, 2.505];
        let btn_full_side = [...btn_half_side, 0, ...btn_half_side.slice(0,  /* step -1 ignored */)];
        let btn = ([...btn_full_side, -90] * 4);
        this.moveTo((this.burn + 0.81), 0.81, 90);
        this.polyline(...btn);
        this.moveTo(0, 0, 270);
        this.moveTo((-this.burn - 0.81), -0.81);
        if (centered) {
            this.moveTo(half_size, half_size);
        }
    }

    configured_plate_cutout(support) {;
        if (this.cutout_type.lower() === "castle") {
            if (support) {
                this.outer_hole();
            }
            else {
                this.castle_shaped_plate_cutout();
            }
        }
        else {
            this.simple_plate_cutout({with_notch: support});
        }
    }

    simple_plate_cutout(radius, with_notch) {;
        let size = Keyboard.FRAME_CUTOUT;
        let half_size = (size / 2);
        if (with_notch) {
            let notch_length = 5;
            let notch_depth = 1;
            let straight_part = (0.5 * (((size - (2 * radius)) - (2 * notch_depth)) - notch_length));
            this.moveTo((-half_size + this.burn), 0, 90);
            let polyline_quarter = [(half_size - radius), [-90, radius], straight_part, [90, (notch_depth / 2)], 0, [-90, (notch_depth / 2)], (notch_length / 2)];
            let polyline = ((((((polyline_quarter + [0]) + list(reversed(polyline_quarter))) + [0]) + polyline_quarter) + [0]) + list(reversed(polyline_quarter)));
            this.polyline(...polyline);
            this.moveTo(0, 0, -90);
            this.moveTo((half_size - this.burn));
        }
        else {
            this.rectangularHole(0, 0, size, size, {r: radius});
        }
    }

}

export { Keyboard };