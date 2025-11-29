const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');
const { TrayLayout } = require('./traylayout');

class GridfinityTrayLayout extends TrayLayout {
    constructor() {
        super();
        this.addSettingsArgs(boxes.edges.FingerJointSettings);
        this.addSettingsArgs(lids.LidSettings);
        this.outside = true;
        this.pitch = 42.0;
        this.opening = 38;
        this.opening_margin = 2;
        this.argparser.add_argument("--h", {type: "str", default: "50", help: "height in mm or add 'u' at the end for Gridfinity units"});
        this.argparser.add_argument("--hi", {type: "float", default: 0, help: "inner height of inner walls in mm (leave to zero for same as outer walls with optional reduction for stacking)"});
        this.argparser.add_argument("--nx", {type: "int", default: 3, help: "number of gridfinity grids in X direction"});
        this.argparser.add_argument("--ny", {type: "int", default: 2, help: "number of gridfinity grids in Y direction"});
        this.argparser.add_argument("--countx", {type: "int", default: 5, help: "split x into this many grid sections.  0 means same as --nx"});
        this.argparser.add_argument("--county", {type: "int", default: 3, help: "split y into this many grid sections.  0 means same as --ny"});
        this.argparser.add_argument("--margin", {type: "float", default: 0.75, help: "Leave this much total margin on the outside, in mm"});
        this.argparser.add_argument("--stacking", {action: "store", type: boolarg, default: false, help: "support gridfinity compatible stacking"});
        this.argparser.add_argument("--gen_pads", {type: boolarg, default: true, help: "generate pads to be used on the bottom of the box"});
        this.argparser.add_argument("--pad_radius", {type: "float", default: 0.8, help: "The corner radius for each grid opening.  Typical is 0.8,"});
        this.argparser.add_argument("--cut_pads_mag_diameter", {type: "float", default: 6.5, help: "if pads are cut add holes for magnets. Typical is 6.5, zero to disable,"});
        this.argparser.add_argument("--cut_pads_mag_offset", {type: "float", default: 7.75, help: "if magnet hole offset from pitch corners.  Typical is 7.75."});
        this.argparser.add_argument("--base_thickness", {type: "float", default: 0.0, help: "the thickness of base the box will sit upon.  0 to use the material thickness, 4.65 for a standard Gridfinity 3D printed base"});
        this.argparser.add_argument("--layout", {type: "str", help: "You can hand edit this before generating", default: "
"});
        if (this.UI !== "web") {
            this.argparser.add_argument("--input", {action: "store", type: "str", default: "traylayout.txt", help: "layout file"});
        }
    }

    generate_layout() {
        let layout = "";
        let countx = this.countx;
        let county = this.county;
        if (countx === 0) {
            countx = this.nx;
        }
        if (county === 0) {
            county = this.ny;
        }
        let stepx = (this.x / countx);
        let stepy = (this.y / county);
        for (let i = 0; i < countx; i += 1) {
            let line = ((" |" * i) + /* unknown node JoinedStr */);
            layout += line;
        }
        for (let i = 0; i < county; i += 1) {
            layout += (("+-" * countx) + /* unknown node JoinedStr */);
            layout += (("| " * countx) + /* unknown node JoinedStr */);
        }
        layout += (("+-" * countx) + "+
");
        return layout;
    }

    rectangularEtching(x, y, dx, dy, r, center_x, center_y) {;
        r = Math.min(r, (dx / 2.0), (dy / 2.0));
        let x_start = (center_x ? x : (x + (dx / 2.0)));
        let y_start = (center_y ? (y - (dy / 2.0)) : y);
        this.moveTo(x_start, y_start, 180);
        this.edge(((dx / 2.0) - r));
        for (let d of [dy, dx, dy, ((dx / 2.0) + r)]) {
            this.corner(-90, r);
            this.edge((d - (2 * r)));
        }
    }

    baseplate_etching() {
        let x = (-this.thickness - (this.margin / 2));
        let y = (-this.thickness - (this.margin / 2));
        let o = this.opening;
        let p = this.pitch;
        let m = this.opening_margin;
        this.ctx.stroke();
        this.ctx.save();
        for (let xx of /* unknown node Set */) {
            for (let yy of /* unknown node Set */) {
                this.set_source_color(Color.ETCHING);
                this.rectangularEtching(((x + (p / 2)) + (xx * p)), ((y + (p / 2)) + (yy * p)), (o - m), (o - m));
            }
        }
        this.ctx.stroke();
        this.ctx.restore();
    }

    generatePad(x, y, r, move) {;
        if (this.move(x, y, move)) {
            return;
        }
        r = Math.min(r, (x / 2.0), (y / 2.0));
        this.ctx.save();
        this.moveTo((x / 2), 0);
        this.edge(((x / 2) - r));
        for (let d of [y, x, y, ((x / 2.0) + r)]) {
            this.corner(90, r);
            this.edge((d - (2 * r)));
        }
        this.ctx.restore();
        this.moveTo((x / 2), (y / 2));
        if (this.cut_pads_mag_diameter > 0) {
            let ofs = this.cut_pads_mag_offset;
            let dia = this.cut_pads_mag_diameter;
            for (let [xoff, yoff] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
                let hole_x = ((Math.floor(this.pitch / 2) - ofs) * xoff);
                let hole_y = ((Math.floor(this.pitch / 2) - ofs) * yoff);
                this.hole(hole_x, hole_y, {d: dia});
            }
        }
        this.move(x, y, move);
    }

    render() {
        this.x = ((this.pitch * this.nx) - this.margin);
        this.y = ((this.pitch * this.ny) - this.margin);
        this.outer_x = this.x;
        this.outer_y = this.y;
        if (this.h.isdigit()) {
            this.h = float(this.h);
        }
        else {
            if (this.h.upper.endswith("U")) {
                this.h = (parseInt(this.h.slice(0, -1)) * 7);
                if (this.base_thickness === 0.0) {
                    this.h -= this.thickness;
                }
                else {
                    this.h -= this.base_thickness;
                }
                if (this.stacking) {
                    this.h += 3.69;
                }
            }
            else {
                ValueError("--h must be a number or a number followed by 'u'")
            }
        }
        if ((!this.hi && this.stacking)) {
            this.hi = (this.h - 4.4);
        }
        this.prepare();
        this.walls();
        this.ctx.save();
        this.base_plate({callback: [this.baseplate_etching], move: "mirror right"});
        if (this.gen_pads) {
            let foot = (this.opening - this.opening_margin);
            for (let i = 0; i < Math.min((this.nx * this.ny), 4); i += 1) {
                this.generatePad(foot, foot, {move: "right", r: this.pad_radius});
            }
        }
        this.ctx.restore();
        this.base_plate({callback: [this.baseplate_etching], move: "up only"});
        this.lid((this.x.reduce((a, b) => a + b, 0) + ((this.x.length - 1) * this.thickness)), (this.y.reduce((a, b) => a + b, 0) + ((this.y.length - 1) * this.thickness)));
    }

}

module.exports.GridfinityTrayLayout = GridfinityTrayLayout;