const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class CoinBankSafe extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser("x", "y", "h");
        this.argparser.add_argument("--slotlength", {action: "store", type: "float", default: 30, help: "Length of the coin slot in mm"});
        this.argparser.add_argument("--slotwidth", {action: "store", type: "float", default: 4, help: "Width of the coin slot in mm"});
        this.argparser.add_argument("--handlelength", {action: "store", type: "float", default: 8, help: "Length of handle in multiples of thickness"});
        this.argparser.add_argument("--handleclearance", {action: "store", type: "float", default: 1.5, help: "Clearance of handle in multiples of thickness"});
    }

    drawNumbers(radius, cover) {
        let fontsize = (0.8 * (radius - cover));
        for (let num = 0; num < 8; num += 1) {
            let angle = (num * 45);
            let x = ((cover + (fontsize * 0.4)) * Math.sin((angle * Math.PI / 180)));
            let y = ((cover + (fontsize * 0.4)) * Math.cos((angle * Math.PI / 180)));
            this.text(str((num + 1)), {align: "center middle", fontsize: fontsize, angle: -angle, color: [1, 0, 0], y: y, x: x});
        }
    }

    lockPin(layers, move) {
        let t = this.thickness;
        let cutout_width = (t / 3);
        let barb_length = t;
        let base_length = (layers * t);
        let base_width = t;
        let total_length = (base_length + barb_length);
        let total_width = (base_width + (cutout_width * 0.5));
        let cutout_angle = (Math.atan((cutout_width / base_length)) * 180 / Math.PI);
        let cutout_length = Math.sqrt(((cutout_width ** 2) + (base_length ** 2)));
        if (this.move(total_length, total_width, move, true)) {
            return;
        }
        this.edge(total_length);
        this.corner(90);
        this.edge(((base_width * 1) / 3));
        this.corner(90);
        this.edge(base_length);
        this.corner((180 + cutout_angle), 0);
        this.edge(cutout_length);
        this.corner((90 - cutout_angle));
        this.edge((cutout_width * 1.5));
        this.corner(90);
        this.edge(barb_length);
        this.corner(90);
        this.corner(-90, (cutout_width * 0.5));
        this.edge((base_length - (cutout_width * 0.5)));
        this.corner(90);
        this.edge(t);
        this.corner(90);
        this.move(total_length, total_width, move);
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let t = this.thickness;
        let slot_length = this.slotlength;
        let slot_width = this.slotwidth;
        let handle_length = (this.handlelength * t);
        let handle_clearance = (this.handleclearance * t);
        let big_radius = (2.25 * t);
        let small_radius = (1.4 * t);
        let doorhole_radius = (1.25 * t);
        let spacing = 1;
        this.ctx.save();
        this.rectangularWall(x, h, "seFf", {move: "mirror right"});
        this.rectangularWall(y, h, "sFFF", {move: "right"});
        this.rectangularWall(x, h, "sfFe", {ignore_widths: [3, 4, 7, 8], callback: [() => this.fingerHolesAt((2.75 * t), 0, h, 90)], move: "mirror right"});
        this.moveTo(0, (this.edges["s"].spacing() + t));
        this.rectangularWall((1.33 * t), h, "eeef", {move: "right"});
        let door_clearance = (0.1 * t);
        let before_hinge = ((1.25 * t) - door_clearance);
        let after_hinge = ((y - (2.25 * t)) - door_clearance);
        this.moveTo((this.spacing / 2), -t);
        this.polyline(after_hinge, -90, t, 90, t, 90, t, -90, before_hinge, 90, h, 90, before_hinge, -90, t, 90, t, 90, t, -90, after_hinge, 90, h, 90);
        let num_dials = 3;
        let space_under_dials = (6 * big_radius);
        let space_not_under_dials = (h - space_under_dials);
        let dial_spacing = (space_not_under_dials / (num_dials + 1));
        if (dial_spacing < 1) {
            let min_height = ((6 * big_radius) + 4);
            ValueError(/* unknown node JoinedStr */)
        }
        for (let pos_y of [(h / 2), ((h / 2) - ((2 * big_radius) + dial_spacing)), ((h / 2) + ((2 * big_radius) + dial_spacing))]) {
            this.hole(((3 * t) - door_clearance), pos_y, doorhole_radius);
            this.rectangularHole(((3 * t) - door_clearance), pos_y, t, t);
        }
        this.rectangularHole(((y / 2) - door_clearance), (h / 2), t, (handle_length / 2));
        this.ctx.restore();
        this.rectangularWall(x, h, "seff", {move: "up only"});
        this.rectangularWall(y, x, "efff", {callback: [() => this.rectangularHole((y / 2), (x / 2), slot_length, slot_width), () => [this.hole((1.75 * t), (1.75 * t), (1.15 * t)), this.rectangularHole((1.75 * t), (1.75 * t), t, t)]], label: "top", move: "right"});
        this.rectangularWall(y, x, "efff", {callback: [() => [this.hole((1.75 * t), (1.75 * t), (1.15 * t)), this.rectangularHole((1.75 * t), (1.75 * t), t, t)]], label: "bottom", move: "right"});
        const holeCB = () => {
            this.rectangularHole(0, 0, t, t);
            this.moveTo(0, 0, 45);
            this.rectangularHole(0, 0, t, t);
        };

        this.ctx.save();
        this.partsMatrix(3, 1, "right", this.parts.disc, (2 * big_radius), {callback: () => [this.drawNumbers(big_radius, small_radius), this.rectangularHole(0, 0, t, t)]});
        this.partsMatrix(3, 1, "right", this.parts.disc, (2 * big_radius), {dwidth: 0.8, callback: holeCB});
        this.partsMatrix(3, 1, "right", this.parts.disc, (2 * small_radius), {callback: () => this.rectangularHole(0, 0, t, t)});
        this.partsMatrix(3, 1, "right", this.parts.wavyKnob, (2 * small_radius), {callback: () => this.rectangularHole(0, 0, t, t)});
        this.ctx.restore();
        this.partsMatrix(3, 1, "up only", this.parts.disc, (2 * big_radius));
        this.ctx.save();
        this.lockPin(5, {move: "up"});
        this.lockPin(5, {move: "up"});
        this.lockPin(5, {move: "up"});
        this.ctx.restore();
        this.lockPin(5, {move: "right only"});
        this.moveTo(0);
        let handle_curve_radius = (0.2 * t);
        this.moveTo((t * 2.5));
        this.polyline(0, [90, handle_curve_radius], (handle_length - (2 * handle_curve_radius)), [90, handle_curve_radius], (handle_clearance - handle_curve_radius), 90, (handle_length / 4), -90, t, 90, (handle_length / 2), 90, t, -90, (handle_length / 4), 90, (handle_clearance - handle_curve_radius));
    }

}

module.exports.CoinBankSafe = CoinBankSafe;