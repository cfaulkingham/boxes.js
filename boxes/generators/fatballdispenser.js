import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class FatBallDispenser extends Boxes {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--sides", {action: "store", type: "int", default: 6, help: "The number of sides of the floor plan."});
        this.argparser.add_argument("--pole_diameter", {action: "store", type: "float", default: 8.0, help: "The diameter of the poles."});
        this.argparser.add_argument("--ball_diameter", {action: "store", type: "float", default: 75.0, help: "The diameter of the fat balls. Give some extra mm to make it a loose fit"});
        this.argparser.add_argument("--balcony_width", {action: "store", type: "float", default: 15.0, help: "The width of the area outside of the poles."});
        this.argparser.add_argument("--balcony_height", {action: "store", type: "float", default: 20.0, help: "The height of the balcony in mm. Set to 0 if no walls are needed."});
        this.argparser.add_argument("--drain_hole_diameter", {action: "store", type: "float", default: 5.0, help: "The diameter of the hole of the floor (to drain rainwater)
                    in mm. Set to 0 if you don't need it."});
        this.argparser.add_argument("--pole_clearance", {action: "store", type: "float", default: 9.0, help: "The minimum distance between a pole and the central
                    refill hole in the ceiling in mm."});
        this.argparser.add_argument("--slide_clearance", {action: "store", type: "float", default: 1.0, help: "The gap between the parts that slide into each other
                    in the locking mechanism in mm."});
        this.argparser.add_argument("--spacer_width", {action: "store", type: "float", default: 15.0, help: "The width of the spacer (part of the locking mechanism) in mm."});
        this.argparser.add_argument("--pole_clearance_factor", {action: "store", type: "float", default: 0.9, help: "The fraction of the pole clearance which is being used for
                    the locking mechanism."});
        this.argparser.add_argument("--roof_overhang", {action: "store", type: "float", default: 20.0, help: "Defines how much wider than the bottom floor the roof is."});
        this.argparser.add_argument("--roof_height", {action: "store", type: "float", default: 50.0, help: "The height of the roof in mm."});
        this.argparser.add_argument("--roof_hole_diameter", {action: "store", type: "float", default: 5.0, help: "The diameter of the hole of the roof in mm.
                    Set to 0 if you don't want to attach a hanger."});
        this.argparser.add_argument("--roof_maintenance_clearance", {action: "store", type: "float", default: 20.0, help: "The distance from on bottom corner of the roof to the maintenance hole in mm."});
        this.argparser.add_argument("--roof_support_fraction", {action: "store", type: "float", default: 0.3, help: "The radius of the roof support part as a fraction of the roof radius."});
    }

    calc_tile_angle(radius, height) {;
        const cross = (a, b) => {;
            let c = [((a[1] * b[2]) - (a[2] * b[1])), ((a[2] * b[0]) - (a[0] * b[2])), ((a[0] * b[1]) - (a[1] * b[0]))];
            return c;
        };

        const scalar = (a, b) => {;
            return (((a[0] * b[0]) + (a[1] * b[1])) + (a[2] * b[2]));
        };

        const norm = (a) => {;
            return Math.sqrt((((a[0] ** 2) + (a[1] ** 2)) + (a[2] ** 2)));
        };

        const add = (a, b) => {;
            return /* unknown node ListComp */;
        };

        let ar_center = ((360 / this.sides) * Math.PI / 180);
        let base = ((radius * Math.sin((ar_center / 2))) * 2);
        let base_height = (radius * Math.cos((ar_center / 2)));
        let pc = [(-base / 2), base_height, 0];
        let pb = [-base, 0, 0];
        let co = [0, 0, height];
        let pq = [(base * Math.cos(ar_center)), (base * Math.sin(ar_center)), 0];
        let po = add(pc, co);
        let n1 = cross(pq, po);
        let n2 = cross(po, pb);
        let cos_e = (scalar(n1, n2) / (norm(n1) * norm(n2)));
        let e = (Math.acos(cos_e) * 180 / Math.PI);
        return e;
    }

    get_pole_callback(pole_inset, pole_diameter, r_ceiling) {;
        const cb = (number) => {
            if (number === 0) {
                if (r_ceiling > 0) {
                    this.hole(0, 0, (this.ball_diameter / 2));
                }
                else {
                    if (this.drain_hole_diameter > 0) {
                        this.hole(0, 0, (this.drain_hole_diameter / 2));
                    }
                }
            }
            else {
                let rads = (((180 - (360 / this.sides)) / 2) * Math.PI / 180);
                let x = (pole_inset * Math.cos(rads));
                let y = (pole_inset * Math.sin(rads));
                this.hole(x, y, (pole_diameter / 2.0));
            }
            if ((r_ceiling > 0 && /* unknown node Compare */)) {
                let a_center = (360.0 / this.sides);
                let a_base = ((180 - (360 / this.sides)) / 2);
                let clearance = (this.pole_clearance_factor * this.pole_clearance);
                let r_clearance = (clearance / Math.sin((a_base * Math.PI / 180)));
                let r = (r_ceiling - r_clearance);
                let base_length = ((2 * r) * Math.sin(((a_center / 2) * Math.PI / 180)));
                let dy = (r_clearance * Math.sin((a_base * Math.PI / 180)));
                let dx = (r_clearance * Math.cos((a_base * Math.PI / 180)));
                let dx_outside = (dy / Math.tan((a_center * Math.PI / 180)));
                let length = base_length;
                if (number === 1) {
                    length += (dx_outside + dx);
                    dx = -dx_outside;
                }
                else {
                    if (number === (Math.floor(this.sides / 2) + 1)) {
                        length += (dx_outside + dx);
                    }
                }
                this.ctx.stroke();
                this.ctx.save();
                this.set_source_color(Color.ETCHING);
                this.moveTo(dx, dy);
                this.ctx.line_to(length, 0);
                this.ctx.stroke();
                this.ctx.restore();
            }
        };

        return cb;
    }

    get_roof_callback(r_polygon, r_hole) {;
        const cb = (number) => {
            if (number === 0) {
                this.hole(0, 0, r_hole);
                this.ctx.stroke();
                this.ctx.save();
                this.set_source_color(Color.ETCHING);
                this.regularPolygonAt(0, 0, this.sides, {r: r_polygon});
                this.ctx.stroke();
                this.ctx.restore();
            }
        };

        return cb;
    }

    balcony_wall(x, y, finger_padding, callback, move, label) {;
        let edges = "efeeee";
        edges = /* unknown node ListComp */;
        edges += edges;
        let overallwidth = ((x + edges[-1].spacing()) + edges[3].spacing());
        let overallheight = ((y + edges[1].spacing()) + edges[4].spacing());
        if (this.move(overallwidth, overallheight, move)) {
            return;
        }
        this.moveTo(0, edges[1].margin());
        for (let [i, l] of enumerate([finger_padding, x, finger_padding, y, (x + (2 * finger_padding)), y])) {
            this.cc(callback, i, {y: (edges[i].startwidth() + this.burn)});
            let e1;
            let e2;
            [e1, e2] = [edges[i], edges[(i + 1)]];
            edges[i](l);
            if (i >= 2) {
                this.edgeCorner(e1, e2, 90);
            }
        }
        let a_inner = (90 - (360.0 / this.sides));
        let inset = (this.thickness * Math.tan((a_inner * Math.PI / 180)));
        this.ctx.stroke();
        this.ctx.save();
        this.set_source_color(Color.ETCHING);
        this.moveTo(inset, 0);
        this.ctx.line_to(0, this.balcony_height);
        this.moveTo(((x + (2 * finger_padding)) - (2 * inset)), 0);
        this.ctx.line_to(0, this.balcony_height);
        this.ctx.stroke();
        this.ctx.restore();
        this.move(overallwidth, overallheight, move, {label: label});
    }

    roof_tile(r_roof, move, label) {;
        let a_base = ((180 - (360 / this.sides)) / 2.0);
        let ar_base = (a_base * Math.PI / 180);
        let h_roof = this.roof_height;
        let l_roof = ((2 * r_roof) * Math.cos(ar_base));
        let r_roof_hole = (this.roof_hole_diameter / 2);
        let h_roof_floor = (r_roof * Math.sin(ar_base));
        let h_roof_tile = Math.sqrt(((h_roof_floor ** 2) + (h_roof ** 2)));
        let a_roof = (Math.atan((h_roof / h_roof_floor)) * 180 / Math.PI);
        let ar_roof = (a_roof * Math.PI / 180);
        let ar_tile_base = Math.atan((h_roof_tile / (l_roof / 2)));
        let a_tile_base = (ar_tile_base * 180 / Math.PI);
        let edges = /* unknown node ListComp */;
        let overallwidth = (l_roof + (2 * edges[0].spacing()));
        let overallheight = (h_roof_tile + (2 * edges[0].spacing()));
        let l_side = (Math.sqrt((((0.5 * l_roof) ** 2) + (h_roof_tile ** 2))) - r_roof_hole);
        if (this.move(overallwidth, overallheight, move)) {
            return;
        }
        this.moveTo(0, edges[0].margin());
        let e1;
        let e2;
        let e3;
        [e1, e2, e3] = [edges[0], edges[1], edges[2]];
        e1(l_roof);
        this.edgeCorner(e1, e2, (180 - a_tile_base));
        e2(l_side);
        this.corner(90);
        this.corner(-(180 - (2 * a_tile_base)), {radius: r_roof_hole});
        this.corner(90);
        e3(l_side);
        this.edgeCorner(e3, e1, (180 - a_tile_base));
        let dy = (this.thickness * Math.tan(ar_roof));
        let dx = (dy / Math.tan(ar_tile_base));
        this.ctx.stroke();
        this.ctx.save();
        this.set_source_color(Color.ETCHING);
        this.moveTo(dx, dy);
        this.ctx.line_to((l_roof - (2 * dx)), 0);
        this.ctx.stroke();
        this.ctx.restore();
        let a_face = this.calc_tile_angle(r_roof, this.roof_height);
        a_face /= 2.0;
        let l_grinding = (this.thickness * Math.tan((a_face * Math.PI / 180)));
        dy = ((h_roof_tile / l_roof) * dx);
        dy *= 2;
        if (r_roof_hole > 0) {
            dy = Math.max(dy, r_roof_hole);
        }
        let dx_bottom = (l_grinding / Math.sin(ar_base));
        let dx_top = ((l_roof / 2) - (((l_roof / 2) - dx_bottom) / (h_roof_tile / r_roof_hole)));
        this.ctx.save();
        this.set_source_color(Color.ETCHING);
        this.moveTo(dx_bottom, 0);
        this.ctx.line_to(dx_top, (h_roof_tile - dy));
        this.moveTo((l_roof - (2 * dx_bottom)), 0);
        this.ctx.line_to(-dx_top, (h_roof_tile - dy));
        this.ctx.stroke();
        this.ctx.restore();
        this.move(overallwidth, overallheight, move, {label: label});
    }

    lock_part(r_inner, r_outer, move, label) {;
        let number_of_edges = (2 * (2 + Math.floor(this.sides / 2)));
        let edges = /* unknown node ListComp */;
        let a_center = (360 / this.sides);
        let a_base = ((180 - (360 / this.sides)) / 2);
        let _;
        let l_inner;
        [r_inner, _, l_inner] = this.regularPolygon();
        let l_outer;
        [r_outer, _, l_outer] = this.regularPolygon();
        let overallwidth;
        let overallheight;
        [overallwidth, overallheight] = [(1.5 * r_outer), ((3 ** 0.5) * r_outer)];
        if (this.move(overallwidth, overallheight, move)) {
            return;
        }
        let second_half = (number_of_edges / 2);
        for (let i = 0; i < number_of_edges; i += 1) {
            let e1;
            let e2;
            [e1, e2] = [edges[i], edges[((i + 1) % number_of_edges)]];
            if ([(second_half - 1), (number_of_edges - 1)].includes(i)) {
                let length = (r_outer - r_inner);
            }
            else {
                if (i < second_half) {
                    length = l_outer;
                }
                else {
                    length = l_inner;
                }
            }
            if ([(second_half - 2)].includes(i)) {
                let angle = (180 - a_base);
            }
            else {
                if ([(second_half - 1)].includes(i)) {
                    angle = a_base;
                }
                else {
                    if ([(number_of_edges - 2)].includes(i)) {
                        angle = a_base;
                    }
                    else {
                        if ([(number_of_edges - 1)].includes(i)) {
                            angle = (180 - a_base);
                        }
                        else {
                            if (i < second_half) {
                                angle = a_center;
                            }
                            else {
                                angle = -a_center;
                            }
                        }
                    }
                }
            }
            e1(length);
            this.edgeCorner(e1, e2, angle);
        }
        this.move(overallwidth, overallheight, move, {label: label});
    }

    render() {
        let r_ball = (this.ball_diameter / 2);
        let d_pole = this.pole_diameter;
        let r_pole = (d_pole / 2);
        let w_balcony = this.balcony_width;
        let h_balcony = this.balcony_height;
        let ar_base = (((180 - (360 / this.sides)) / 2) * Math.PI / 180);
        let r_clearance = (this.pole_clearance / Math.sin(ar_base));
        let r_poles = ((r_ball + Math.max(r_pole, r_clearance)) + r_pole);
        let r_floor = ((r_poles + r_pole) + Math.max(w_balcony, r_clearance, r_pole));
        let r_ceiling = ((r_poles + r_pole) + Math.max(r_clearance, r_pole));
        let r_roof = (r_floor + this.roof_overhang);
        let l_roof = ((2 * r_roof) * Math.cos(ar_base));
        let t = this.thickness;
        let floor_outset = (t / Math.tan(((90.0 - (180 / this.sides)) * Math.PI / 180)));
        let l_floor = ((2 * r_floor) * Math.sin((((360.0 / this.sides) / 2) * Math.PI / 180)));
        let h_roof = this.roof_height;
        let h_roof_floor = (r_roof * Math.sin(ar_base));
        let a_roof = (Math.atan((h_roof / h_roof_floor)) * 180 / Math.PI);
        let ar_roof = (a_roof * Math.PI / 180);
        let r_support = (this.roof_support_fraction * r_roof);
        this.regularPolygonWall({corners: this.sides, r: r_ceiling, edges: "e", callback: this.get_pole_callback((r_ceiling - r_poles), d_pole, r_ceiling), move: "up"});
        let r_hole = (r_ceiling - this.roof_maintenance_clearance);
        this.regularPolygonWall({corners: this.sides, r: r_roof, edges: "e", callback: this.get_roof_callback(), move: "up"});
        if (h_balcony > 0) {
            this.regularPolygonWall({corners: this.sides, r: r_floor, edges: "F", callback: this.get_pole_callback((r_floor - r_poles), d_pole, 0), move: "up"});
            for (let _ = 0; _ < this.sides; _ += 1) {
                this.balcony_wall({x: l_floor, y: h_balcony, finger_padding: floor_outset, move: "up"});
            }
        }
        else {
            this.regularPolygonWall({corners: this.sides, r: r_floor, edges: "e", callback: this.get_pole_callback((r_floor - r_poles), d_pole, false), move: "up"});
        }
        if (this.roof_hole_diameter > 0) {
            let h_poly;
            [_, h_poly, _] = this.regularPolygon();
            let new_height = (h_poly - (this.thickness / Math.atan(ar_roof)));
            let r_polygon = ((r_support * new_height) / h_poly);
            r_hole = (this.roof_hole_diameter / 2);
            this.regularPolygonWall({corners: this.sides, r: r_support, edges: "e", callback: this.get_roof_callback(), move: "up"});
        }
        this.lock_part((r_ceiling + this.slide_clearance), ((r_ceiling + this.slide_clearance) + this.spacer_width), {move: "up"});
        let r_inner = (r_ceiling - (r_clearance * this.pole_clearance_factor));
        let r_outer = ((r_ceiling + this.slide_clearance) + this.spacer_width);
        this.lock_part(r_inner, r_outer, {move: "right"});
        for (let _ = 0; _ < this.sides; _ += 1) {
            this.roof_tile(r_roof, {move: "up"});
            this.moveTo(((_ % 2) ? (0.5 * l_roof) : ((1.5 * l_roof) + (2 * this.spacing))), 0, -180);
        }
    }

}

export { FatBallDispenser };