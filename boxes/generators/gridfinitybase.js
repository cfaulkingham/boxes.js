import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../this.lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../this.lids.js';
import { Color  } from '../Color.js';

class GridfinityBase extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.DoveTailSettings, {size: 3, depth: 0.3, radius: 0.05, angle: 40});
        this.addSettingsArgs(edges.FingerJointSettings, {space: 4, finger: 4});
        this.addSettingsArgs(this.lids.LidSettings);
        this.argparser.add_argument("--size_x", {type: "int", default: 0, help: "size of base in X direction (0=auto)"});
        this.argparser.add_argument("--size_y", {type: "int", default: 0, help: "size of base in Y direction (0=auto)"});
        this.argparser.add_argument("--x", {type: "int", default: 3, help: "number of grids in X direction (0=auto)"});
        this.argparser.add_argument("--y", {type: "int", default: 2, help: "number of grids in Y direction (0=auto)"});
        this.argparser.add_argument("--h", {type: "float", default: (7 * 3), help: "height of sidewalls of the tray (mm)"});
        this.argparser.add_argument("--m", {type: "float", default: 0.5, help: "Extra margin around the gridfinity base to allow it to drop into the carrier (mm)"});
        this.argparser.add_argument("--bottom_edge", {action: "store", type: ArgparseEdgeType("Fhse"), choices: list("Fhse"), default: "F", help: "edge type for bottom edge"});
        this.argparser.add_argument("--panel_edge", {action: "store", type: ArgparseEdgeType("De"), choices: list("De"), default: "D", help: "edge type for sub panels"});
        this.argparser.add_argument("--pitch", {type: "int", default: 42, help: "The Gridfinity pitch, in mm.  Should always be 42."});
        this.argparser.add_argument("--opening", {type: "int", default: 38, help: "The cutout for each grid opening.  Typical is 38."});
        this.argparser.add_argument("--radius", {type: "float", default: 1.6, help: "The corner radius for each grid opening.  Typical is 1.6."});
        this.argparser.add_argument("--cut_pads", {type: boolarg, default: false, help: "cut pads to be used for gridinity boxes from the grid openings"});
        this.argparser.add_argument("--cut_pads_mag_diameter", {type: "float", default: 6.5, help: "if pads are cut add holes for magnets. Typical is 6.5, zero to disable,"});
        this.argparser.add_argument("--cut_pads_mag_offset", {type: "float", default: 7.75, help: "if magnet hole offset from pitch corners.  Typical is 7.75."});
        this.argparser.add_argument("--pad_radius", {type: "float", default: 0.8, help: "The corner radius for each grid opening.  Typical is 0.8,"});
        this.argparser.add_argument("--panel_x", {type: "int", default: 0, help: "the maximum sized panel that can be cut in x direction"});
        this.argparser.add_argument("--panel_y", {type: "int", default: 0, help: "the maximum sized panel that can be cut in y direction"});
        this.argparser.add_argument("--base_type", {type: "str", default: "standard", choices: ["standard", "refined"]});
    }

    generate_grid(nx, ny, shift_x, shift_y) {
        let radius;
        let pad_radius;
        [radius, pad_radius] = [this.radius, this.pad_radius];
        let pitch = this.pitch;
        let opening = this.opening;
        for (let col = 0; col < nx; col += 1) {
            for (let row = 0; row < ny; row += 1) {
                let lx = (((col * pitch) + (pitch / 2)) + shift_x);
                let ly = (((row * pitch) + (pitch / 2)) + shift_y);
                this.rectangularHole(lx, ly, opening, opening, {r: radius});
                if (this.cut_pads) {
                    this.rectangularHole(lx, ly, (opening - 2), (opening - 2), {r: pad_radius});
                    if (this.cut_pads_mag_diameter > 0) {
                        let ofs = this.cut_pads_mag_offset;
                        let dia = this.cut_pads_mag_diameter;
                        for (let [xoff, yoff] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
                            let x = (lx + ((Math.floor(pitch / 2) - ofs) * xoff));
                            let y = (ly + ((Math.floor(pitch / 2) - ofs) * yoff));
                            this.hole(x, y, {d: dia});
                        }
                    }
                }
            }
        }
    }

    generate_refined_grid(nx, ny, shift_x, shift_y, dovetails) {
        let radius;
        let pad_radius;
        [radius, pad_radius] = [this.radius, this.pad_radius];
        let pitch = this.pitch;
        let opening = this.opening;
        for (let col = 0; col < nx; col += 1) {
            for (let row = 0; row < ny; row += 1) {
                let lx = (((col * pitch) + (pitch / 2)) + shift_x);
                let ly = (((row * pitch) + (pitch / 2)) + shift_y);
                this.rectangularHole(lx, ly, opening, opening, {r: radius, color: Color.ETCHING});
                this.hole(lx, ly, {d: 17});
                if (dovetails) {
                    if (col === 0) {
                        this.plate_to_plate_hole(lx, ly, "<");
                    }
                    if (row === 0) {
                        this.plate_to_plate_hole(lx, ly, "v");
                    }
                    if (row === (ny - 1)) {
                        this.plate_to_plate_hole(lx, ly, "^");
                    }
                    if (col === (nx - 1)) {
                        this.plate_to_plate_hole(lx, ly, ">");
                    }
                }
                if (this.cut_pads_mag_diameter > 0) {
                    let ofs = this.cut_pads_mag_offset;
                    let dia = (this.cut_pads_mag_diameter - 0.5);
                    for (let [xoff, yoff] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
                        let x = (lx + ((Math.floor(pitch / 2) - ofs) * xoff));
                        let y = (ly + ((Math.floor(pitch / 2) - ofs) * yoff));
                        this.hole(x, y, {d: dia});
                    }
                }
            }
        }
    }

    plate_to_plate_hole(ctr_x, ctr_y, pos) {
        if (pos === "<") {
            this.moveTo((ctr_x - (this.pitch / 2)), ((ctr_y - 3) + this.burn), 0);
        }
        else {
            if (pos === "v") {
                this.moveTo(((ctr_x + 3) - this.burn), (ctr_y - (this.pitch / 2)), 90);
            }
            else {
                if (pos === "^") {
                    this.moveTo(((ctr_x - 3) + this.burn), (ctr_y + (this.pitch / 2)), -90);
                }
                else {
                    if (pos === ">") {
                        this.moveTo((ctr_x + (this.pitch / 2)), ((ctr_y + 3) - this.burn), 180);
                    }
                }
            }
        }
        this.edge(3);
        this.corner(-53, 0);
        this.edge(5);
        this.corner(53, 0);
        this.edge(3);
        this.corner(90, 0);
        this.edge((13.5 - (this.burn * 2)));
        this.corner(90, 0);
        this.edge(3);
        this.corner(53, 0);
        this.edge(5);
        this.corner(-53, 0);
        this.edge(3);
    }

    plate_to_plate_tab(x, y) {
        this.edge(3);
        this.corner(53, 0);
        this.edge(5);
        this.corner(-53, 0);
        this.edge(6);
        this.corner(-53, 0);
        this.edge(5);
        this.corner(53, 0);
        this.edge(3);
        this.corner(90, 0);
        this.edge(13.5);
        this.corner(90, 0);
        this.edge(3);
        this.corner(53, 0);
        this.edge(5);
        this.corner(-53, 0);
        this.edge(6);
        this.corner(-53, 0);
        this.edge(5);
        this.corner(53, 0);
        this.edge(3);
        this.corner(90, 0);
        this.edge(13.5);
    }

    subdivide_grid(X, Y, A, B) {
        let num_x = Math.ceil((X / A));
        let num_y = Math.ceil((Y / B));
        let segment_widths = ([Math.floor(X / num_x)] * num_x);
        for (let i = 0; i < (X % num_x); i += 1) {
            segment_widths[i] += 1;
        }
        let segment_heights = ([Math.floor(Y / num_y)] * num_y);
        for (let i = 0; i < (Y % num_y); i += 1) {
            segment_heights[i] += 1;
        }
        let grid_segments = {};
        let y_start = 0;
        let row_index = 0;
        for (let h of segment_heights) {
            let x_start = 0;
            let col_index = 0;
            for (let w of segment_widths) {
                x_start += w;
                col_index += 1;
            }
            y_start += h;
            row_index += 1;
        }
        return [segment_widths.length, segment_heights.length, grid_segments];
    }

    render() {
        if ((this.x === 0 && this.size_x === 0)) {
            ValueError("either --size_x or --x must be provided")
        }
        if ((this.y === 0 && this.size_y === 0)) {
            ValueError("either --size_y or --y must be provided")
        }
        if (this.size_x === 0) {
            this.size_x = (this.x * this.pitch);
        }
        else {
            if (this.x === 0) {
                this.x = parseInt((this.size_x / this.pitch));
            }
            this.size_x = Math.max(this.size_x, (this.x * this.pitch));
        }
        if (this.size_y === 0) {
            this.size_y = (this.y * this.pitch);
        }
        else {
            if (this.y === 0) {
                this.y = parseInt((this.size_y / this.pitch));
            }
            this.size_y = Math.max(this.size_y, (this.y * this.pitch));
        }
        this.exact_size = (this.size_x === (this.x * this.pitch) && this.size_y === (this.y * this.pitch));
        if ((this.h === 0 && this.base_type === "refined" && this.exact_size)) {
            let num_tabs = 8;
            for (let ii = 0; ii < num_tabs; ii += 1) {
                let dontdraw = this.move(17, 14, "right");
                if (!dontdraw) {
                    this.plate_to_plate_tab(0, 0);
                }
                this.move(17, 14, "right");
            }
            this.moveTo((-(17 + this.spacing) * 8), 15);
        }
        if ((this.panel_x !== 0 && this.panel_y !== 0)) {
            this.render_split(this.size_x, this.size_y, this.h, this.x, this.y, this.pitch, this.m);
        }
        else {
            this.render_unsplit(this.size_x, this.size_y, this.h, this.x, this.y, this.pitch, this.m);
        }
    }

    render_split(x, y, h, nx, ny, pitch, margin) {
        let pad_x = (x - (nx * pitch));
        let pad_y = (y - (ny * pitch));
        let panel_nx = Math.floor((this.panel_x - pad_x) / pitch);
        let panel_ny = Math.floor((this.panel_y - pad_y) / pitch);
        let segments_cols;
        let segments_rows;
        let segments;
        [segments_cols, segments_rows, segments] = this.subdivide_grid(nx, ny, panel_nx, panel_ny);
        for (let row = 0; row < segments_rows; row += 1) {
            let t0 = (row === 0 ? "e" : (this.panel_edge !== "e" ? "d" : "e"));
            let t2 = (row === (segments_rows - 1) ? "e" : (this.panel_edge !== "e" ? "D" : "e"));
            let segment_pad_bottom;
            let segment_pad_top;
            [segment_pad_bottom, segment_pad_top] = [0, 0];
            if (row === 0) {
                segment_pad_bottom = Math.floor(pad_y / 2);
            }
            if (row === (segments_rows - 1)) {
                segment_pad_top = Math.floor(pad_y / 2);
            }
            this.ctx.save();
            for (let col = 0; col < segments_cols; col += 1) {
                [nx, ny] = segments[[col, row]].slice(2, 4);
                let t1 = (col === (segments_cols - 1) ? "e" : (this.panel_edge !== "e" ? "d" : "e"));
                let t3 = (col === 0 ? "e" : (this.panel_edge !== "e" ? "D" : "e"));
                let segment_pad_left;
                let segment_pad_right;
                [segment_pad_left, segment_pad_right] = [0, 0];
                if (col === 0) {
                    segment_pad_left = Math.floor(pad_x / 2);
                }
                if (col === (segments_cols - 1)) {
                    segment_pad_right = Math.floor(pad_x / 2);
                }
                let box_width = (((nx * this.pitch) + segment_pad_left) + segment_pad_right);
                let box_height = (((ny * this.pitch) + segment_pad_bottom) + segment_pad_top);
                this.rectangularWall(box_width, box_height, [t0, t1, t2, t3], {callback: [partial(this.generate_grid, nx, ny, segment_pad_left, segment_pad_bottom)]});
                this.rectangularWall(box_width, box_height, [t0, t1, t2, t3], {move: "right only", label: str([row, col])});
            }
            this.ctx.restore();
            this.rectangularWall(box_width, box_height, [t0, t1, t2, t3], {move: "up only", label: str([row, col])});
        }
        if (h > 0) {
            if (this.bottom_edge !== "e") {
                for (let row = 0; row < segments_rows; row += 1) {
                    t0 = (row === 0 ? "f" : "d");
                    t2 = (row === (segments_rows - 1) ? "f" : "D");
                    [segment_pad_bottom, segment_pad_top] = [0, 0];
                    if (row === 0) {
                        segment_pad_bottom = Math.floor(pad_y / 2);
                    }
                    if (row === (segments_rows - 1)) {
                        segment_pad_top = Math.floor(pad_y / 2);
                    }
                    this.ctx.save();
                    for (let col = 0; col < segments_cols; col += 1) {
                        [nx, ny] = segments[[col, row]].slice(2, 4);
                        t1 = (col === (segments_cols - 1) ? "f" : "d");
                        t3 = (col === 0 ? "f" : "D");
                        [segment_pad_left, segment_pad_right] = [0, 0];
                        if (col === 0) {
                            segment_pad_left = Math.floor(pad_x / 2);
                            let m = margin;
                        }
                        if (col === (segments_cols - 1)) {
                            segment_pad_right = Math.floor(pad_x / 2);
                            m = margin;
                        }
                        box_width = ((((nx * pitch) + segment_pad_left) + segment_pad_right) + m);
                        box_height = ((((ny * pitch) + segment_pad_bottom) + segment_pad_top) + m);
                        this.rectangularWall(box_width, box_height, [t0, t1, t2, t3]);
                        this.rectangularWall(box_width, box_height, [t0, t1, t2, t3], {move: "right only", label: str([row, col])});
                    }
                    this.ctx.restore();
                    this.rectangularWall(box_width, box_height, [t0, t1, t2, t3], {move: "up only", label: str([row, col])});
                }
            }
            let t4;
            [t1, t2, t3, t4] = "eeee";
            let b = this.edges.get(this.bottom_edge, this.edges["F"]);
            let sideedge = "F";
            for (let ii = 0; ii < 2; ii += 1) {
                let resets = [];
                for (let col = 0; col < segments_cols; col += 1) {
                    [nx, ny] = segments[[col, 0]].slice(2, 4);
                    [segment_pad_left, segment_pad_right] = [0, 0];
                    if (col === 0) {
                        segment_pad_left = Math.floor(pad_x / 2);
                    }
                    if (col === (segments_cols - 1)) {
                        segment_pad_right = Math.floor(pad_x / 2);
                    }
                    box_width = (((nx * this.pitch) + segment_pad_left) + segment_pad_right);
                    if (col === 0) {
                        let ee = [b, "f", "e", "f"];
                        m = margin;
                    }
                    else {
                        if (col === (segments_cols - 1)) {
                            ee = [b, "f", "e", "F"];
                            m = margin;
                        }
                        else {
                            ee = [b, "f", "e", "F"];
                            m = 0;
                        }
                    }
                    this.rectangularWall((box_width + m), h, ee, {ignore_widths: [1, 6], move: "right"});
                    resets.append([(box_width + m), ee]);
                }
                for (let [val, ee] of resets) {
                    this.rectangularWall(val, 0, ee, {ignore_widths: [1, 6], move: "left only"});
                }
                this.rectangularWall(x, h, ee, {ignore_widths: [1, 6], move: "up only"});
            }
            for (let ii = 0; ii < 2; ii += 1) {
                resets = [];
                for (let row = 0; row < segments_rows; row += 1) {
                    [nx, ny] = segments[[0, row]].slice(2, 4);
                    [segment_pad_bottom, segment_pad_top] = [0, 0];
                    if (row === 0) {
                        segment_pad_bottom = Math.floor(pad_y / 2);
                    }
                    if (row === (segments_rows - 1)) {
                        segment_pad_top = Math.floor(pad_y / 2);
                    }
                    box_height = (((ny * pitch) + segment_pad_bottom) + segment_pad_top);
                    if (row === 0) {
                        ee = [b, "f", "e", "F"];
                        m = margin;
                    }
                    else {
                        if (row === (segments_rows - 1)) {
                            ee = [b, "F", "e", "F"];
                            m = margin;
                        }
                        else {
                            ee = [b, "f", "e", "F"];
                            m = 0;
                        }
                    }
                    this.rectangularWall((box_height + m), h, ee, {ignore_widths: [1, 6], move: "right"});
                    resets.append([(box_height + m), ee]);
                }
                for (let [val, ee] of resets) {
                    this.rectangularWall(val, 0, ee, {ignore_widths: [1, 6], move: "left only"});
                }
                this.rectangularWall(y, h, ee, {ignore_widths: [1, 6], move: "up only"});
            }
        }
    }

    render_unsplit(x, y, h, nx, ny, pitch, margin) {
        let t1;
        let t2;
        let t3;
        let t4;
        [t1, t2, t3, t4] = "eeee";
        let b = this.edges.get(this.bottom_edge, this.edges["F"]);
        let sideedge = "F";
        let shift_x = Math.floor((x - (nx * pitch)) / 2);
        let shift_y = Math.floor((y - (ny * pitch)) / 2);
        this.rectangularWall(x, y, {move: "up", callback: [partial(this.generate_grid, nx, ny, shift_x, shift_y)]});
        if (h > 0) {
            x += (2 * margin);
            y += (2 * margin);
            shift_x += margin;
            shift_y += margin;
            this.rectangularWall(x, h, [b, sideedge, t1, sideedge], {ignore_widths: [1, 6], move: "right"});
            this.rectangularWall(y, h, [b, "f", t2, "f"], {ignore_widths: [1, 6], move: "up"});
            this.rectangularWall(y, h, [b, "f", t4, "f"], {ignore_widths: [1, 6], move: ""});
            this.rectangularWall(x, h, [b, sideedge, t3, sideedge], {ignore_widths: [1, 6], move: "left up"});
            if (this.bottom_edge !== "e") {
                if (this.base_type !== "refined") {
                    this.rectangularWall(x, y, "ffff", {move: "right"});
                }
                else {
                    this.rectangularWall(x, y, "ffff", {move: "right", callback: [partial(this.generate_refined_grid, nx, ny, shift_x, shift_y, false)]});
                }
            }
            this.lid(x, y);
        }
        else {
            if (this.base_type === "refined") {
                this.rectangularWall(x, y, "eeee", {move: "right", callback: [partial(this.generate_refined_grid, nx, ny, shift_x, shift_y, this.exact_size)]});
            }
        }
    }

}

export { GridfinityBase };