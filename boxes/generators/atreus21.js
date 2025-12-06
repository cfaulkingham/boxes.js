import { Boxes } from '../boxes.js';
import { Keyboard } from './keyboard.js';

class Atreus21 extends Boxes {
    static ui_group = 'Misc';
    static btn_size = 15.6;
    static half_btn = 15.6 / 2;
    static border = 6;

    constructor() {
        super();
        this.btn_size = Atreus21.btn_size;
        this.half_btn = Atreus21.half_btn;
        this.border = Atreus21.border;
        // Call Keyboard's add_common_keyboard_parameters with named params
        // add_common_keyboard_parameters(add_hotswap_parameter, add_pcb_mount_parameter, add_led_parameter, add_diode_parameter, add_cutout_type_parameter, default_columns_definition)
        Keyboard.prototype.add_common_keyboard_parameters.call(
            this,
            true,  // add_hotswap_parameter
            true,  // add_pcb_mount_parameter
            true,  // add_led_parameter
            true,  // add_diode_parameter
            true,  // add_cutout_type_parameter
            `4@3/4@6/4@11/4@5/4@0/1@${this.btn_size * 0.5}`  // default_columns_definition
        );
    }

    // Parse columns definition string like "4@3/4@6/4@11/4@5/4@0/1@7.8"
    // Returns array of [offset, keys_count] tuples
    parseColumnsDefinition(s) {
        let result = [];
        for (let column_string of s.split("/")) {
            // Match pattern: "nb_rows @ offset x repeat_count" (offset and repeat optional)
            let m = column_string.trim().match(/^(\d+)\s*@?\s*(\d*\.?\d*)(?:\s*x\s*(\d+))?$/);
            if (!m) continue;
            let keys_count = parseInt(m[1]);
            let offset = m[2] ? parseFloat(m[2]) : 0;
            let n = m[3] ? parseInt(m[3]) : 1;
            for (let i = 0; i < n; i++) {
                result.push([offset, keys_count]);
            }
        }
        return result;
    }

    render() {
        // Ensure columns_definition is parsed as array
        if (typeof this.columns_definition === 'string') {
            this.columns_definition = this.parseColumnsDefinition(this.columns_definition);
        }
        
        this.moveTo(10, 30);
        let [case_x, case_y] = this._case_x_y();
        let margin = ((2 * this.border) + 1);
        for (let reverse of [false, true]) {
            // keyholder
            this.outer();
            this.half(null, { reverse: reverse });
            this.holes();
            this.moveTo(case_x + margin);

            // support
            this.outer();
            this.half(this.support.bind(this), { reverse: reverse });
            this.holes();
            this.moveTo(-case_x - margin, case_y + margin);

            // hotplug
            this.outer();
            this.half(this.hotplug.bind(this), { reverse: reverse });
            this.holes();
            this.moveTo(case_x + margin);

            // border
            this.outer();
            this.rim();
            this.holes();
            this.moveTo(-case_x - margin, case_y + margin);
        }
    }

    holes(diameter = 3, margin = 1.5) {
        let [case_x, case_y] = this._case_x_y();
        for (let x of [-margin, (case_x + margin)]) {
            for (let y of [-margin, (case_y + margin)]) {
                this.hole(x, y, {d: diameter});
            }
        }
    }

    micro() {
        let x = 17.9;
        let y = 33;
        let b = this.border;
        let [case_x, case_y] = this._case_x_y();
        this.rectangularHole((((x * -0.5) + case_x) + (b * 0.5)), (((y * -0.5) + case_y) + (b * 0.5)), x, y);
    }

    rim() {
        this.ctx.save();
        let [x, y] = this._case_x_y();
        this.moveTo(x * 0.5, y * 0.5);
        this.rectangularHole(0, 0, x, y, 5);
        this.ctx.restore();
    }

    outer() {
        this.ctx.save();
        let [x, y] = this._case_x_y();
        let b = this.border;
        this.moveTo(0, -b);
        let corner = [90, b];
        // [x, corner, y, corner] * 2 in Python means repeating the array twice
        // Do NOT flatten - polyline expects corner as [angle, radius] arrays
        this.polyline(x, corner, y, corner, x, corner, y, corner);
        this.ctx.restore();
    }

    half(hole_cb = null, { reverse = false } = {}) {
        this.ctx.save();
        if (hole_cb === null) {
            hole_cb = this.key.bind(this);
        }
        this.moveTo(this.half_btn, this.half_btn);
        this.apply_callback_on_columns(hole_cb, this.columns_definition, { reverse: reverse });
        this.ctx.restore();
    }

    support() {
        this.configured_plate_cutout({support: true});
    }

    hotplug() {
        this.pcb_holes({with_hotswap: this.hotswap_enable, with_pcb_mount: this.pcb_mount_enable, with_diode: this.diode_enable, with_led: this.led_enable});
    }

    key() {
        this.configured_plate_cutout();
    }

    _case_x_y() {
        let spacing = Keyboard.STANDARD_KEY_SPACING;
        let margin = spacing - this.btn_size;
        let x = this.columns_definition.length * spacing - margin;
        // max(offset + keys * spacing for (offset, keys) in columns_definition)
        let y = Math.max(...this.columns_definition.map(([offset, keys]) => offset + keys * spacing)) - margin;
        return [x, y];
    }

}

// Mix in Keyboard methods (using getOwnPropertyNames since class methods are non-enumerable)
for (let name of Object.getOwnPropertyNames(Keyboard.prototype)) {
    if (name !== 'constructor' && !Atreus21.prototype.hasOwnProperty(name)) {
        Object.defineProperty(
            Atreus21.prototype,
            name,
            Object.getOwnPropertyDescriptor(Keyboard.prototype, name)
        );
    }
}

export { Atreus21 };