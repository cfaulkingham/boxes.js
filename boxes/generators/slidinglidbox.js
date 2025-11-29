const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class SlidingLidBox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--bottom_edge", {action: "store", type: ArgparseEdgeType("Fhs"), choices: list("Fhs"), default: "F", help: "edge type for bottom edge"});
        this.argparser.add_argument("--rail", {action: "store", type: "float", default: 1.5, help: "width of the rail (multiples of thickness)"});
        this.argparser.add_argument("--margin_t", {action: "store", type: "float", default: 0.1, help: "vertical margin for sliding lid (multiples of thickness)"});
        this.argparser.add_argument("--margin_s", {action: "store", type: "float", default: 0.05, help: "margin to add at both sides of sliding lid (multiples of thickness)"});
        this.argparser.add_argument("--lid_type", {action: "store", type: "str", default: "hole", choices: /* unknown node Set */, help: "add an optional grip hole to the lid"});
        this.argparser.add_argument("--hole_length", {action: "store", type: "float", default: 40, help: "length of the grip hole in mm"});
        this.argparser.add_argument("--hole_width", {action: "store", type: "float", default: 20, help: "width of the grip hole in mm"});
        this.argparser.add_argument("--hole_radius", {action: "store", type: "float", default: 10, help: "radius of the grip hole in mm"});
    }

    lowerRailHoles() {
        let pos_h = (this.h - (0.5 * this.thickness));
        this.fingerHolesAt(pos_h, 0, this.y);
    }

    backHoles() {
        let pos_h = (this.h - (0.5 * this.thickness));
        this.fingerHolesAt(0, pos_h, this.rail_mm, 0);
        this.fingerHolesAt(this.x, pos_h, this.rail_mm, 180);
    }

    gripHole(lid_y) {
        let pos_x = (this.y - this.hole_width);
        let pos_y = (lid_y / 2);
        this.rectangularHole(pos_x, pos_y, this.hole_width, this.hole_length, this.hole_radius);
    }

    render() {
        let gap = ((1 + this.margin_t) * this.thickness);
        if (this.outside) {
            this.x = this.adjustSize(this.x);
            this.y = this.adjustSize(this.y);
            this.h = (this.adjustSize(this.h) - gap);
        }
        this.rail_mm = (this.rail * this.thickness);
        let rail_margin = (this.rail_mm - this.burn);
        let h_plus = (this.h + gap);
        this.ctx.save();
        let sides_compound_edge = edges.CompoundEdge(this, "fE", [this.h, gap]);
        this.rectangularWall(this.y, h_plus, [this.bottom_edge, sides_compound_edge, "F", "f"], {callback: [null, this.lowerRailHoles], move: "up mirror", label: "right side"});
        this.rectangularWall(this.y, h_plus, [this.bottom_edge, sides_compound_edge, "F", "f"], {callback: [null, this.lowerRailHoles], move: "up", label: "left side"});
        this.rectangularWall(this.y, this.x, "ffff", {move: "up", label: "bottom"});
        this.rectangularWall(this.y, this.rail_mm, "fEee", {move: "up mirror", label: "top right rail"});
        this.rectangularWall(this.y, this.rail_mm, "fEee", {move: "up", label: "top left rail"});
        this.rectangularWall(this.y, this.rail_mm, "feef", {move: "up mirror", label: "bottom right rail"});
        this.rectangularWall(this.y, this.rail_mm, "feef", {move: "up", label: "bottom left rail"});
        let lid_y = (this.x - ((2 * this.margin_s) * this.thickness));
        if (this.lid_type === "lip") {
            let lip_copound_edge = edges.CompoundEdge(this, "EfE", [rail_margin, (lid_y - (2 * rail_margin)), rail_margin]);
            this.rectangularWall(this.y, lid_y, ["e", lip_copound_edge, "e", "e"], {move: "up", label: "lid"});
            this.rectangularWall((lid_y - (2 * rail_margin)), gap, "Feee", {move: "up", label: "lid lip"});
        }
        else {
            if (this.lid_type === "hole") {
                this.rectangularWall(this.y, lid_y, "eEee", {move: "up", label: "lid", callback: [() => this.gripHole(lid_y)]});
            }
            else {
                this.rectangularWall(this.y, lid_y, "eEee", {move: "up", label: "lid"});
            }
        }
        this.ctx.restore();
        this.rectangularWall(this.y, h_plus, "ffff", {move: "right only"});
        let back_compound_edge = edges.CompoundEdge(this, ["E", "f", "E"], [rail_margin, (this.x - (2 * rail_margin)), rail_margin]);
        this.rectangularWall(this.x, h_plus, [this.bottom_edge, "F", back_compound_edge, "F"], {callback: [this.backHoles], move: "up", label: "back"});
        this.rectangularWall(this.x, this.h, [this.bottom_edge, "F", "e", "F"], {move: "up", label: "front"});
        this.rectangularWall((this.x - (2 * rail_margin)), this.rail_mm, "Feee", {move: "up", label: "back rail"});
    }

}

module.exports.SlidingLidBox = SlidingLidBox;