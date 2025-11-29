const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class DiceBox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 2.0});
        this.addSettingsArgs(edges.ChestHingeSettings, {finger_joints_on_box: true, finger_joints_on_lid: true});
        // this.buildArgParser();
        this.argparser.add_argument("--lidheight", {action: "store", type: "float", default: 18, help: "height of lid in mm"});
        this.argparser.add_argument("--hex_hole_corner_radius", {action: "store", type: "float", default: 5, help: "The corner radius of the hexagonal dice holes, in mm"});
        this.argparser.add_argument("--magnet_diameter", {action: "store", type: "float", default: 6, help: "The diameter of magnets for holding the box closed, in mm"});
    }

    diceCB() {
        let t = this.thickness;
        let xi = (this.x - (2 * t));
        let yi = (this.y - (2 * t));
        let xc = (xi / 2);
        let yc = (yi / 2);
        let cr = this.hex_hole_corner_radius;
        let apothem = ((Math.min(xi, yi) - (4 * t)) / 6);
        let r = ((apothem * 2) / Math.sqrt(3));
        let centers = [[xc, yc]];
        let polar_r = ((2 * apothem) + t);
        for (let i = 0; i < 6; i += 1) {
            let theta = ((i * Math.PI) / 3);
            centers.append([(xc + (polar_r * Math.cos(theta))), (yc + (polar_r * Math.sin(theta)))]);
        }
        for (let center of centers) {
            this.regularPolygonHole({x: center[0], y: center[1], n: 6, r: r, corner_radius: cr, a: 30});
        }
        let d = this.magnet_diameter;
        let mo = (t + (d / 2));
        this.hole(mo, mo, {d: d});
        this.hole((xi - mo), mo, {d: d});
    }

    render() {
        let x;
        let y;
        let h;
        let hl;
        [x, y, h, hl] = [this.x, this.y, this.h, this.lidheight];
        if (this.outside) {
            x = this.adjustSize(x);
            y = this.adjustSize(y);
            h = this.adjustSize(h);
            hl = this.adjustSize(hl);
        }
        let t = this.thickness;
        let hy = this.edges["O"].startwidth();
        let hy2 = this.edges["P"].startwidth();
        let e1 = edges.CompoundEdge(this, "eF", [(hy - t), ((h - hy) + t)]);
        let e2 = edges.CompoundEdge(this, "Fe", [((h - hy) + t), (hy - t)]);
        let e_back = ["F", e1, "F", e2];
        let p = this.edges["o"].settings.pin_height;
        let e_inner_1 = edges.CompoundEdge(this, "fe", [(y - p), p]);
        let e_inner_2 = edges.CompoundEdge(this, "ef", [p, (y - p)]);
        let e_inner_topbot = ["f", e_inner_1, "f", e_inner_2];
        this.ctx.save();
        this.rectangularWall(x, y, e_inner_topbot, {move: "up", callback: [this.diceCB]});
        this.rectangularWall(x, y, e_inner_topbot, {move: "up", callback: [this.diceCB]});
        this.rectangularWall(x, h, "FFFF", {ignore_widths: [1, 2, 5, 6], move: "up"});
        this.rectangularWall(x, h, e_back, {move: "up"});
        this.rectangularWall(x, hl, "FFFF", {ignore_widths: [1, 2, 5, 6], move: "up"});
        this.rectangularWall(x, ((hl - hy2) + t), "FFqF", {move: "up"});
        this.ctx.restore();
        this.rectangularWall(x, y, "ffff", {move: "right only"});
        this.rectangularWall(y, x, "ffff", {move: "up"});
        this.rectangularWall(y, x, "ffff", {move: "up"});
        this.rectangularWall(y, ((hl - hy2) + t), "Ffpf", {ignore_widths: [5, 6], move: "up"});
        this.rectangularWall(y, ((h - hy) + t), "OfFf", {ignore_widths: [5, 6], move: "up"});
        this.rectangularWall(y, ((h - hy) + t), "Ffof", {ignore_widths: [5, 6], move: "up"});
        this.rectangularWall(y, ((hl - hy2) + t), "PfFf", {ignore_widths: [5, 6], move: "up"});
    }

}

module.exports.DiceBox = DiceBox;