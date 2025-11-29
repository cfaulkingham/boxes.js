const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class HobbyCase extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(boxes.edges.FingerJointSettings);
        this.argparser.add_argument("--unit_d", {action: "store", type: "float", default: 128, help: "Depth of single unit"});
        this.argparser.add_argument("--unit_h", {action: "store", type: "float", default: 50, help: "Height of single unit"});
        this.argparser.add_argument("--unit_w", {action: "store", type: argparseSections, default: "215*3", help: "Widths of unit columns, eg. 215*3 or 150:215:150"});
        this.argparser.add_argument("--rows", {action: "store", type: "int", default: 6, help: "Number of rows in each of the columns"});
        this.argparser.add_argument("--shelves_n", {action: "store", type: argparseSections, default: "2:3:2", help: "How many shelves should each column have eg. 2:3:2. Use integers only!"});
        this.argparser.add_argument("--add_rails", {action: "store", type: boolarg, default: true, help: "Should rails be generated for slots unpopulated by shelves?"});
        this.argparser.add_argument("--add_cover", {action: "store", type: boolarg, default: true, help: "Should cover for the case be generated?"});
        this.argparser.add_argument("--inset_shelves", {action: "store", type: boolarg, default: true, help: "Should the inner dividers and shelves be inset from the front edge?"});
        this.addSettingsArgs(boxes.edges.StackableSettings, {angle: 90, width: 0.0, height: 2.0});
    }

    prepare() {
        this.cols = this.unit_w.length;
        this.sum_w = this.unit_w.reduce((a, b) => a + b, 0);
        this.inside_w = (this.sum_w + ((2 * (this.cols - 1)) * this.thickness));
        this.outside_w = (this.inside_w + (2 * this.thickness));
        this.sum_h = (this.rows * this.unit_h);
        this.inside_h = (this.sum_h + ((this.rows - 1) * this.thickness));
        this.outside_h = (this.inside_h + (2 * this.thickness));
        this.shelves_n = /* unknown node ListComp */;
        this.railsets = /* unknown node ListComp */;
        this.inside_depth = this.unit_d;
        this.outside_depth = (!this.inset_shelves ? this.unit_d : (this.unit_d + (2 * this.thickness)));
        let s = this.edgesettings.get("FingerJoint", /* unknown node Dict */);
        let doubleFingerJointSettings = edges.FingerJointSettings(this.thickness, true);
        this.addPart(edges.FingerHoles(this, doubleFingerJointSettings), {name: "doubleFingerHolesAt"});
    }

    top_and_bottom(move) {
        for (let name of ["bottom", "top"]) {
            this.rectangularWall(this.inside_w, this.outside_depth, "fFeF", {callback: [this.topAndBottomHolesCallback], move: move, label: /* unknown node JoinedStr */});
        }
    }

    topAndBottomHolesCallback() {
        this.cut_double_wall_holes(this.inside_depth);
    }

    vertical_walls(move) {
        this.ctx.save();
        this.verticalWall(this.outside_depth, this.inside_h, {label: "left"});
        for (let i = 0; i < (2 * (this.cols - 1)); i += 1) {
            this.verticalWall(this.inside_depth, this.inside_h, {label: "vertical wall"});
        }
        this.verticalWall(this.outside_depth, this.inside_h, {move: "up", label: "right"});
        this.move(this.outside_depth, (this.inside_h + (2 * this.thickness)), move);
    }

    verticalWall(x, y, edges, move, label) {
        label = /* unknown node JoinedStr */;
        this.rectangularWall(x, y, edges, {callback: [this.slotsHolesCallback], move: move, label: label});
    }

    slotsHolesCallback() {
        this.cut_shelve_holes_in_single_column(this.inside_depth, 0);
    }

    cover(move) {
        let x = this.outside_w;
        let y = (this.outside_h - this.thickness);
        let _edges = ["e", "z", "e", "z", "e"];
        let hole_edge_length = (this.unit_w[0] / 2);
        let straight_edge_length = ((x - (2 * hole_edge_length)) / 3);
        let lengths = [straight_edge_length, hole_edge_length, straight_edge_length, hole_edge_length, straight_edge_length];
        let edge_with_cutouts = boxes.edges.CompoundEdge(this, _edges, lengths);
        this.rectangularWall(x, y, ["e", "e", edge_with_cutouts, "e"], {move: move, label: /* unknown node JoinedStr */});
    }

    shelves(move) {
        for (let [columnIndex, unit_width] of enumerate(this.unit_w)) {
            let x = unit_width;
            let y = this.inside_depth;
            this.partsMatrix(this.shelves_n[columnIndex], 0, move, this.rectangularWall, x, y, "efff", {label: /* unknown node JoinedStr */});
        }
    }

    rails(move) {
        for (let [col_idx, unit_width] of enumerate(this.unit_w)) {
            for (let n = 0; n < this.railsets[col_idx]; n += 1) {
                this.railSet(this.inside_depth, unit_width, move);
            }
        }
    }

    railSet(sideLength, backLength, move) {
        this.ctx.save();
        this.rectangularWall(sideLength, 0, "feSe", {move: "right"});
        this.rectangularWall((backLength - (8 * this.thickness)), 0, "feSe", {move: "right"});
        this.rectangularWall(sideLength, 0, "feSe", {move: "right"});
        this.move(((2 * sideLength) + backLength), (3 * this.thickness), move);
    }

    base_plate(move) {
        this.rectangularWall(this.inside_w, this.inside_h, "FFFF", {callback: [this.baseplate_callback], label: /* unknown node JoinedStr */, move: move});
    }

    baseplate_callback() {
        for (let col = 0; col < this.cols; col += 1) {
            let posx = (this.unit_w.slice(0, col).reduce((a, b) => a + b, 0) + ((col * 2) * this.thickness));
            this.cut_shelve_holes_in_single_column(this.unit_w[col], posx);
        }
        this.cut_double_wall_holes(this.inside_h);
    }

    render() {
        this.prepare();
        this.base_plate();
        this.shelves();
        if (this.add_cover) {
            this.cover();
        }
        this.top_and_bottom();
        this.vertical_walls();
        if (this.add_rails) {
            this.rails();
        }
    }

    cut_double_wall_holes(length) {
        for (let col = 1; col < this.cols; col += 1) {
            let posx = ((this.thickness + this.unit_w.slice(0, col).reduce((a, b) => a + b, 0)) + (((col - 1) * 2) * this.thickness));
            this.doubleFingerHolesAt(posx, 0, length, {angle: 90});
        }
    }

    cut_shelve_holes_in_single_column(length, posx) {
        for (let row = 1; row < this.rows; row += 1) {
            let posy = (((0.5 * this.thickness) + (row * this.unit_h)) + ((row - 1) * this.thickness));
            this.fingerHolesAt(posx, posy, length, {angle: 0});
        }
    }

}

module.exports.HobbyCase = HobbyCase;