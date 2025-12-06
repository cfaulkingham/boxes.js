import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { Keyboard  } from './keyboard.js';

class Keypad extends Keyboard {
    constructor() {
        super();
        this.argparser.add_argument("--h", {action: "store", type: "int", default: 30, help: "height of the box"});
        this.argparser.add_argument("--top1_thickness", {action: "store", type: "float", default: 1.5, help: "thickness of the button hold layer, cherry like switches need 1.5mm or smaller to snap in"});
        this.argparser.add_argument("--top2_enable", {action: "store", type: boolarg, default: false, help: "enables another top layer that can hold CPG151101S11 hotswap sockets"});
        this.argparser.add_argument("--top2_thickness", {action: "store", type: "float", default: 1.5, help: "thickness of the hotplug layer, CPG151101S11 hotswap sockets need 1.2mm to 1.5mm"});
        this.add_common_keyboard_parameters({add_hotswap_parameter: false, default_columns_definition: "4x3"});
        this.addSettingsArgs(FingerJointSettings, {surroundingspaces: 1});
    }

    _get_x_y() {;
        let spacing = (this.btn_size + this.space_between_btn);
        let border = ((2 * this.box_padding) - this.space_between_btn);
        let x = ((this.columns_definition.length * spacing) + border);
        let y = (Math.max(/* unknown node GeneratorExp */) + border);
        return [x, y];
    }

    render() {;
        let deep_edge = deepcopy(this.edges["f"].settings);
        deep_edge.thickness = (this.thickness + this.top1_thickness);
        if (this.top2_enable) {
            deep_edge.thickness += this.top2_thickness;
        }
        deep_edge.edgeObjects(this, "gGH", true);
        let d1;
        let d2;
        [d1, d2] = [2.0, 3.0];
        let x;
        let y;
        [x, y] = this._get_x_y();
        let h = this.h;
        this.rectangularWall(x, h, "GFEF", {callback: [this.wallx_cb], move: "right"});
        this.rectangularWall(y, h, "GfEf", {callback: [this.wally_cb], move: "up"});
        this.rectangularWall(y, h, "GfEf", {callback: [this.wally_cb]});
        this.rectangularWall(x, h, "GFEF", {callback: [this.wallx_cb], move: "left up"});
        this.rectangularWall(x, y, "ffff", {callback: this.to_grid_callback(this.support_hole), move: "right"});
        this.rectangularWall(x, y, "ffff", {callback: this.to_grid_callback(this.key_hole), move: "up"});
        if (this.top2_enable) {
            this.rectangularWall(x, y, "ffff", {callback: this.to_grid_callback(this.hotplug)});
        }
        let tr = this.triangle;
        let trh = (tr / 3);
        this.rectangularWall(x, y, {callback: ([() => this.hole(trh, trh)] * 4), move: "left up"});
        this.rectangularTriangle(tr, tr, "ffe", {num: 4, callback: [null, () => this.hole(trh, trh)]});
    }

    to_grid_callback(inner_callback) {
        const callback = () => {
            let key_margin = (this.box_padding + (this.btn_size / 2));
            this.moveTo(key_margin, key_margin);
            this.apply_callback_on_columns(inner_callback, this.columns_definition, (this.btn_size + this.space_between_btn));
        };

        return [callback];
    }

    hotplug() {;
        this.pcb_holes({with_pcb_mount: this.pcb_mount_enable, with_diode: this.diode_enable, with_led: this.led_enable});
    }

    support_hole() {
        this.configured_plate_cutout({support: true});
    }

    key_hole() {
        this.configured_plate_cutout();
    }

    wallx_cb() {;
        let x;
        let _;
        [x, _] = this._get_x_y();
        let t = this.thickness;
        this.fingerHolesAt(0, (this.h - (1.5 * t)), this.triangle, 0);
        this.fingerHolesAt(x, (this.h - (1.5 * t)), this.triangle, 180);
    }

    wally_cb() {;
        let _;
        let y;
        [_, y] = this._get_x_y();
        let t = this.thickness;
        this.fingerHolesAt(0, (this.h - (1.5 * t)), this.triangle, 0);
        this.fingerHolesAt(y, (this.h - (1.5 * t)), this.triangle, 180);
    }

}

export { Keypad };