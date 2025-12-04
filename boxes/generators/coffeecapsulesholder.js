import { Boxes } from '../boxes.js';

class CoffeeCapsuleHolder extends Boxes {
    constructor() {
        super();
        this.argparser.add_argument("--columns", {type: "int", default: 4, help: "Number of columns of capsules."});
        this.argparser.add_argument("--rows", {type: "int", default: 5, help: "Number of capsules by columns."});
        this.argparser.add_argument("--lid_size", {type: "float", default: 37, help: "diameter of the cup lids (in mm)"});
        this.argparser.add_argument("--body_size", {type: "float", default: 30, help: "width of the body of the cups at the top (in mm)"});
        this.argparser.add_argument("--backplate", {type: boolarg, default: true, help: "True if a backplate should be generated."});
    }

    render() {
        this.lid_size_with_margin = this.lid_size + 2;
        this.column_spacing = 5;
        this.corner_radius = 3;
        this.screw_margin = 6;
        this.outer_margin = 7;
        // Add space for the opening. A full row is not necessary for it.
        this.rows = this.rows + 0.6;

        this.render_plate({screw_hole: 7, hole_renderer: () => this.render_front_hole()});
        this.render_plate({hole_renderer: () => this.render_middle_hole()});
        if (this.backplate) {
            this.render_plate({});
        }
    }

    render_plate({screw_hole = 3.5, hole_renderer = null, move = "right"} = {}) {
        let width = (
            this.columns * (this.lid_size_with_margin + this.column_spacing)
            - this.column_spacing
            + 2 * this.outer_margin
        );
        let height = this.rows * this.lid_size + 2 * this.outer_margin;

        if (this.move(width, height, move, true)) {
            return;
        }

        this.ctx.save();
        this.moveTo(this.corner_radius);
        this.polyline(
            width - 2 * this.corner_radius,
            [90, this.corner_radius],
            height - 2 * this.corner_radius,
            [90, this.corner_radius],
            width - 2 * this.corner_radius,
            [90, this.corner_radius],
            height - 2 * this.corner_radius,
            [90, this.corner_radius]
        );
        this.ctx.restore();

        if (hole_renderer) {
            for (let col = 0; col < this.columns; col++) {
                this.ctx.save();
                this.moveTo(
                    this.outer_margin + col * (this.lid_size_with_margin + this.column_spacing) - this.burn,
                    this.outer_margin + (this.rows - 0.5) * this.lid_size + this.burn,
                    -90
                );
                hole_renderer();
                this.ctx.restore();
            }
        }

        if (screw_hole) {
            for (let x of [this.screw_margin, width - this.screw_margin]) {
                for (let y of [this.screw_margin, height - this.screw_margin]) {
                    this.hole(x, y + this.burn, {d: screw_hole});
                }
            }
        }

        this.move(width, height, move);
    }

    render_front_hole() {
        let radians = Math.acos(this.body_size / this.lid_size_with_margin);
        let height_difference = (this.lid_size / 2) * Math.sin(radians);
        let degrees = radians * 180 / Math.PI;
        let half = [
            0,
            [degrees, this.lid_size_with_margin / 2],
            0,
            -degrees,
            (this.rows - 1) * this.lid_size - height_difference,
        ];
        let path = [
            ...half,
            [180, this.body_size / 2],
            ...[...half].reverse(),
            [180, this.lid_size_with_margin / 2]
        ];
        this.polyline(...path);
    }

    render_middle_hole() {
        let half = [(this.rows - 1) * this.lid_size, [180, this.lid_size_with_margin / 2]];
        let path = [...half, ...half];
        this.polyline(...path);
    }

}

export { CoffeeCapsuleHolder };