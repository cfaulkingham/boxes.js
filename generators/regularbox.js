const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');
const { BayonetBox } = require('./bayonetbox');

class RegularBox extends BayonetBox {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 1});
        // this.buildArgParser("h", "outside");
        this.argparser.add_argument("--radius_bottom", {action: "store", type: "float", default: 50.0, help: "inner radius of the box bottom (at the corners)"});
        this.argparser.add_argument("--radius_top", {action: "store", type: "float", default: 50.0, help: "inner radius of the box top (at the corners)"});
        this.argparser.add_argument("--n", {action: "store", type: "int", default: 5, help: "number of sides"});
        this.argparser.add_argument("--top", {action: "store", type: "str", default: "none", choices: ["none", "hole", "angled hole", "angled lid", "angled lid2", "round lid", "bayonet mount", "closed"], help: "style of the top and lid"});
        this.argparser.add_argument("--alignment_pins", {action: "store", type: "float", default: 1.0, help: "diameter of the alignment pins for bayonet lid"});
        this.argparser.add_argument("--bottom", {action: "store", type: "str", default: "closed", choices: ["none", "closed", "hole", "angled hole", "angled lid", "angled lid2", "round lid"], help: "style of the bottom and bottom lid"});
        this.lugs = 6;
    }

    render() {
        let r0;
        let r1;
        let h;
        let n;
        [r0, r1, h, n] = [this.radius_bottom, this.radius_top, this.h, this.n];
        if (this.outside) {
            r0 = (r0 - (this.thickness / Math.cos(((360 / (2 * n)) * Math.PI / 180))));
            r1 = (r1 - (this.thickness / Math.cos(((360 / (2 * n)) * Math.PI / 180))));
            if (this.top === "none") {
                h = this.adjustSize(h, false);
            }
            else {
                if ((this.top.includes("lid") && this.top !== "angled lid")) {
                    h = (this.adjustSize(h) - this.thickness);
                }
                else {
                    h = this.adjustSize(h);
                }
            }
        }
        let t = this.thickness;
        let sh0;
        let side0;
        [r0, sh0, side0] = this.regularPolygon(n);
        let sh1;
        let side1;
        [r1, sh1, side1] = this.regularPolygon(n);
        let l = ((((r0 - r1) ** 2) + (h ** 2)) ** 0.5);
        let a = (Math.asin((((side1 - side0) / 2) / l)) * 180 / Math.PI);
        let phi = (180 - (2 * (Math.asin((Math.cos((Math.PI / n)) / Math.cos((a * Math.PI / 180)))) * 180 / Math.PI)));
        let fingerJointSettings = this.edges["f"].settings;
        fingerJointSettings.setValues(this.thickness, {angle: phi});
        fingerJointSettings.edgeObjects(this, {chars: "gGH"});
        let beta = (Math.atan(((sh1 - sh0) / h)) * 180 / Math.PI);
        let angle_bottom = (90 + beta);
        let angle_top = (90 - beta);
        fingerJointSettings = this.edges["f"].settings;
        fingerJointSettings.setValues(this.thickness, {angle: angle_bottom});
        fingerJointSettings.edgeObjects(this, {chars: "yYH"});
        fingerJointSettings = this.edges["f"].settings;
        fingerJointSettings.setValues(this.thickness, {angle: angle_top});
        fingerJointSettings.edgeObjects(this, {chars: "zZH"});
        const drawTop = (r, sh, top_type, joint_type) => {
            if (top_type === "closed") {
                this.regularPolygonWall({corners: n, r: r, edges: joint_type[1], move: "right"});
            }
            else {
                if (top_type === "angled lid") {
                    this.regularPolygonWall({corners: n, r: r, edges: "e", move: "right"});
                    this.regularPolygonWall({corners: n, r: r, edges: "E", move: "right"});
                }
                else {
                    if (["angled hole", "angled lid2"].includes(top_type)) {
                        this.regularPolygonWall({corners: n, r: r, edges: joint_type[1], move: "right", callback: [() => this.regularPolygonAt(0, 0, n)]});
                        if (top_type === "angled lid2") {
                            this.regularPolygonWall({corners: n, r: r, edges: "E", move: "right"});
                        }
                    }
                    else {
                        if (["hole", "round lid"].includes(top_type)) {
                            this.regularPolygonWall({corners: n, r: r, edges: joint_type[1], move: "right", hole: ((sh - t) * 2)});
                        }
                    }
                }
            }
            if (top_type === "round lid") {
                this.parts.disc((sh * 2), {move: "right"});
            }
            if (this.top === "bayonet mount") {
                this.diameter = (2 * sh);
                this.parts.disc(((sh * 2) - (0.1 * t)), {callback: this.lowerCB, move: "right"});
                this.regularPolygonWall({corners: n, r: r, edges: "F", callback: [this.upperCB], move: "right"});
                this.parts.disc((sh * 2), {move: "right"});
            }
        };

        this.ctx.save();
        drawTop(r0, sh0, this.bottom, "yY");
        drawTop(r1, sh1, this.top, "zZ");
        this.ctx.restore();
        this.regularPolygonWall({corners: n, r: Math.max(r0, r1), edges: "F", move: "up only"});
        let fingers_top = ["closed", "hole", "angled hole", "round lid", "angled lid2", "bayonet mount"].includes(this.top);
        let fingers_bottom = ["closed", "hole", "angled hole", "round lid", "angled lid2"].includes(this.bottom);
        let t_ = this.edges["G"].startwidth();
        let bottom_edge = (fingers_bottom ? "y" : "e");
        let top_edge = (fingers_top ? "z" : "e");
        let d_top = Math.max(0, (-t_ * Math.sin((a * Math.PI / 180))));
        let d_bottom = Math.max(0.0, (t_ * Math.sin((a * Math.PI / 180))));
        l -= (d_top + d_bottom);
        if ((n % 2)) {
            let e = (((bottom_edge + "ege") + top_edge) + "eeGee");
            let borders = [side0, (90 - a), d_bottom, 0, l, 0, d_top, (90 + a), side1, (90 + a), d_top, -90, t_, 90, l, 90, t_, -90, d_bottom, (90 - a)];
            for (let i = 0; i < n; i += 1) {
                this.polygonWall(borders, {edge: e, correct_corners: false, move: "right"});
            }
        }
        else {
            let borders0 = [side0, (90 - a), d_bottom, -90, t_, 90, l, 90, t_, -90, d_top, (90 + a), side1, (90 + a), d_top, -90, t_, 90, l, 90, t_, -90, d_bottom, (90 - a)];
            let e0 = (((bottom_edge + "eeGee") + top_edge) + "eeGee");
            let borders1 = [side0, (90 - a), d_bottom, 0, l, 0, d_top, (90 + a), side1, (90 + a), d_top, 0, l, 0, d_bottom, (90 - a)];
            let e1 = (((bottom_edge + "ege") + top_edge) + "ege");
            for (let i = 0; i < Math.floor(n / 2); i += 1) {
                this.polygonWall(borders0, {edge: e0, correct_corners: false, move: "right"});
                this.polygonWall(borders1, {edge: e1, correct_corners: false, move: "right"});
            }
        }
    }

}

module.exports.RegularBox = RegularBox;