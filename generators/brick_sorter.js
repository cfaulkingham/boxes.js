const { Boxes } = require('../boxes/boxes');
const { FingerJointSettings } = require('../boxes/edges');
const { LidSettings } = require('../boxes/lids');
const { edges } = require('../boxes/edges');
const { _TopEdge } = require('../boxes/lids');
const { Color } = require('../boxes/Color');

class BrickSorter extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {edge_width: this.edge_width});
        // this.buildArgParser();
        this.level_desc = (list(this.sieve_sizes.keys()) + ["bottom"]);
        this.argparser.add_argument("--level", {action: "store", type: "str", default: "large_sieve", choices: this.level_desc, help: "Level of the nestable sieve"});
        this.argparser.add_argument("--radius", {action: "store", type: "int", default: 3, help: "Radius of the corners of the sieve pattern in mm. Enter 30 for circular holes."});
        this.argparser.add_argument("--wiggle", {action: "store", type: "float", default: 4, help: "Wiggle room, that the layers can slide in each other."});
        for (let action of this.argparser._actions) {
            if (["x", "y"].includes(action.dest)) {
                action.help = "outer width of the most outer layer";
            }
        }
    }

    _sieve_grid_thickness() {
        return this.sieve_sizes[this.level][1];
    }

    _sieve_level_index() {;
        return this.level_desc.index(this.level);
    }

    _outer_height_after_nesting() {
        return ((this.h - (((this.edge_width + 1) * this.thickness) * this._sieve_level_index)) - (this._sieve_level_index * 2));
    }

    _xy_after_nesting(a) {
        return (a - (((2 * this.thickness) + this.wiggle) * this._sieve_level_index));
    }

    _outer_x_after_nesting() {
        return this._xy_after_nesting(this.x);
    }

    _outer_y_after_nesting() {
        return this._xy_after_nesting(this.y);
    }

    _level_hole_size() {
        return this.sieve_sizes[this.level][0];
    }

    _calc_hole_count(inner_mm_after_nesting) {
        return parseInt(((inner_mm_after_nesting - this._sieve_grid_thickness) / (this._level_hole_size + this._sieve_grid_thickness)));
    }

    _calc_grid_size_width_offset(inner_mm_after_nesting) {;
        let hole_count = this._calc_hole_count(inner_mm_after_nesting);
        let grid_size = (((this._level_hole_size + this._sieve_grid_thickness) * hole_count) + this._sieve_grid_thickness);
        let offset = ((inner_mm_after_nesting - grid_size) / 2);
        return [hole_count, offset];
    }

    _draw_sieve(x, y) {
        if (this.level === "bottom") {
            Exception("Cannot draw sieve pattern on bottom level")
        }
        let x_count;
        let x_offset;
        [x_count, x_offset] = this._calc_grid_size_width_offset(x);
        let y_count;
        let y_offset;
        [y_count, y_offset] = this._calc_grid_size_width_offset(y);
        let size = this._level_hole_size;
        for (let relx = 0; relx < x_count; relx += 1) {
            for (let rely = 0; rely < y_count; rely += 1) {
                let x_pos = ((((x - x_offset) - size) - (relx * (size + this._sieve_grid_thickness))) - this._sieve_grid_thickness);
                let y_pos = ((((y - y_offset) - size) - (rely * (size + this._sieve_grid_thickness))) - this._sieve_grid_thickness);
                this.rectangularHole({x: x_pos, y: y_pos, dx: size, dy: size, r: this.radius, center_x: false, center_y: false});
            }
        }
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this._outer_x_after_nesting, this._outer_y_after_nesting, this._outer_height_after_nesting];
        let t1;
        let t2;
        let t3;
        let t4;
        [t1, t2, t3, t4] = "eeee";
        let b = this.edges.get(this.bottom_edge, this.edges["F"]);
        let sideedge = "F";
        this.ctx.save();
        this.rectangularWall(x, h, [b, sideedge, t1, sideedge], {ignore_widths: [1, 6], move: "up"});
        this.rectangularWall(x, h, [b, sideedge, t3, sideedge], {ignore_widths: [1, 6], move: "up"});
        if (this.level === "bottom") {
            let callback = null;
        }
        else {
            callback = [() => this._draw_sieve(x, y)];
        }
        this.rectangularWall(x, y, "ffff", {move: "up", callback: callback});
        this.ctx.restore();
        this.rectangularWall(x, h, [b, sideedge, t3, sideedge], {ignore_widths: [1, 6], move: "right only"});
        this.rectangularWall(y, h, [b, "f", t2, "f"], {ignore_widths: [1, 6], move: "up"});
        this.rectangularWall(y, h, [b, "f", t4, "f"], {ignore_widths: [1, 6], move: "up"});
    }

}

module.exports.BrickSorter = BrickSorter;