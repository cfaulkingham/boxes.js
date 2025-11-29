const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class Atreus21 extends Boxes {
    constructor() {
        super();
        this.add_common_keyboard_parameters({default_columns_definition: /* unknown node JoinedStr */});
    }

    render() {;
        this.moveTo(10, 30);
        let case_x;
        let case_y;
        [case_x, case_y] = this._case_x_y();
        let margin = ((2 * this.border) + 1);
        for (let reverse of [false, true]) {
            this.outer();
            this.half({reverse: reverse});
            this.holes();
            this.moveTo((case_x + margin));
            this.outer();
            this.half(this.support, {reverse: reverse});
            this.holes();
            this.moveTo((-case_x - margin), (case_y + margin));
            this.outer();
            this.half(this.hotplug, {reverse: reverse});
            this.holes();
            this.moveTo((case_x + margin));
            this.outer();
            this.rim();
            this.holes();
            this.moveTo((-case_x - margin), (case_y + margin));
        }
    }

    holes(diameter, margin) {
        let case_x;
        let case_y;
        [case_x, case_y] = this._case_x_y();
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
        let case_x;
        let case_y;
        [case_x, case_y] = this._case_x_y();
        this.rectangularHole((((x * -0.5) + case_x) + (b * 0.5)), (((y * -0.5) + case_y) + (b * 0.5)), x, y);
    }

    rim() {
        let x;
        let y;
        [x, y] = this._case_x_y();
        this.moveTo((x * 0.5), (y * 0.5));
        this.rectangularHole(0, 0, x, y, 5);
    }

    outer() {
        let x;
        let y;
        [x, y] = this._case_x_y();
        let b = this.border;
        this.moveTo(0, -b);
        let corner = [90, b];
        this.polyline(...([x, corner, y, corner] * 2));
    }

    half(hole_cb, reverse) {
        if (hole_cb === null) {
            hole_cb = this.key;
        }
        this.moveTo(this.half_btn, this.half_btn);
        this.apply_callback_on_columns(hole_cb, this.columns_definition, {reverse: reverse});
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
        let margin = (spacing - this.btn_size);
        let x = ((this.columns_definition.length * spacing) - margin);
        let y = (Math.max(/* unknown node GeneratorExp */) - margin);
        return [x, y];
    }

}

module.exports.Atreus21 = Atreus21;