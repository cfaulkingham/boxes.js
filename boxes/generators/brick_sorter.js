import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class brick_sorter extends Boxes {
    constructor() {
        super();
        
        // Define sieve sizes: [hole_size_mm, grid_thickness_mm]
        this.sieve_sizes = {
            "large_sieve": [30, 5],
            "medium_sieve": [20, 5],
            "small_sieve": [15, 4],
            "tiny_sieve": [10, 3]
        };
        
        this.edge_width = 3;
        
        // Store default dimensions to be applied after parseArgs
        this._default_x = 256;
        this._default_y = 256;
        this._default_h = 120;
        
        this.addSettingsArgs(edges.FingerJointSettings, {edge_width: this.edge_width});
        this.buildArgParser({x: 256, y: 256, h: 120});
        this.level_desc = Object.keys(this.sieve_sizes).concat(["bottom"]);
        this.argparser.add_argument("--level", {action: "store", type: "str", default: "large_sieve", choices: this.level_desc, help: "Level of the nestable sieve"});
        this.argparser.add_argument("--radius", {action: "store", type: "int", default: 3, help: "Radius of the corners of the sieve pattern in mm. Enter 30 for circular holes."});
        this.argparser.add_argument("--wiggle", {action: "store", type: "float", default: 4, help: "Wiggle room, that the layers can slide in each other."});
        // Note: In Python version this modifies help text for x,y arguments
        // JavaScript argparser doesn't expose _actions in the same way
        // for (let action of this.argparser._actions) {
        //     if (["x", "y"].includes(action.dest)) {
        //         action.help = "outer width of the most outer layer";
        //     }
        // }
    }

    parseArgs(args) {
        super.parseArgs(args);
        // Apply BrickSorter-specific defaults if not provided in args
        if (args.x === undefined) this.x = this._default_x;
        if (args.y === undefined) this.y = this._default_y;
        if (args.h === undefined) this.h = this._default_h;
    }

    _sieve_grid_thickness() {
        return this.sieve_sizes[this.level][1];
    }

    _sieve_level_index() {
        return this.level_desc.indexOf(this.level);
    }

    _outer_height_after_nesting() {
        return ((this.h - (((this.edge_width + 1) * this.thickness) * this._sieve_level_index())) - (this._sieve_level_index() * 2));
    }

    _xy_after_nesting(a) {
        return (a - (((2 * this.thickness) + this.wiggle) * this._sieve_level_index()));
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
        return parseInt(((inner_mm_after_nesting - this._sieve_grid_thickness()) / (this._level_hole_size() + this._sieve_grid_thickness())));
    }

    _calc_grid_size_width_offset(inner_mm_after_nesting) {
        let hole_count = this._calc_hole_count(inner_mm_after_nesting);
        let grid_size = (((this._level_hole_size() + this._sieve_grid_thickness()) * hole_count) + this._sieve_grid_thickness());
        let offset = ((inner_mm_after_nesting - grid_size) / 2);
        return [hole_count, offset];
    }

    _draw_sieve(x, y) {
        if (this.level === "bottom") {
            throw new Error("Cannot draw sieve pattern on bottom level");
        }
        let x_count;
        let x_offset;
        [x_count, x_offset] = this._calc_grid_size_width_offset(x);
        let y_count;
        let y_offset;
        [y_count, y_offset] = this._calc_grid_size_width_offset(y);
        let size = this._level_hole_size();
        
        // Position holes from top-right corner, going left and down
        // Matching Python implementation exactly
        for (let relx = 0; relx < x_count; relx += 1) {
            for (let rely = 0; rely < y_count; rely += 1) {
                let x_pos = (
                    x
                    - x_offset
                    - size
                    - relx * (size + this._sieve_grid_thickness())
                    - this._sieve_grid_thickness()
                );
                let y_pos = (
                    y
                    - y_offset
                    - size
                    - rely * (size + this._sieve_grid_thickness())
                    - this._sieve_grid_thickness()
                );
                this.rectangularHole(x_pos, y_pos, size, size, this.radius, false, false);
            }
        }
    }

    render() {
        let x = this._outer_x_after_nesting();
        let y = this._outer_y_after_nesting();
        let h = this._outer_height_after_nesting();
        
        let [t1, t2, t3, t4] = "eeee".split("");
        let b = this.edges.get(this.bottom_edge, this.edges["F"]);
        let sideedge = "F";
        
        // Adjust sizes like in Python version
        this.x = x = this.adjustSize(x, sideedge, sideedge);
        this.y = y = this.adjustSize(y);
        this.h = h = this.adjustSize(h, b, t1);
        
        this.ctx.save();
        this.rectangularWall(x, h, [b, sideedge, t1, sideedge], {ignore_widths: [1, 6], move: "up"});
        this.rectangularWall(x, h, [b, sideedge, t3, sideedge], {ignore_widths: [1, 6], move: "up"});
        let callback;
        if (this.level === "bottom") {
            callback = null;
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

export { brick_sorter };