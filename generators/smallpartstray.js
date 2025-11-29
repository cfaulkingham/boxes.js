const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');
const { CompoundEdge } = require('../edges');

class SmallPartsTray extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(lids.LidSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 45.0, help: "angle of the ramps"});
        this.argparser.add_argument("--rampheight", {action: "store", type: "float", default: 0.5, help: "height of the ramps relative to to total height"});
        this.argparser.add_argument("--two_sided", {action: "store", type: boolarg, default: true, help: "have ramps on both sides. Enables sliding dividers"});
        this.argparser.add_argument("--front_panel", {action: "store", type: boolarg, default: true, help: "have a vertical wall at the ramp"});
    }

    innerWall(h, y, ramp_h, ramp_y, two_ramps, front, move) {
        let a = (Math.atan((ramp_h / ramp_y)) * 180 / Math.PI);
        let l = (((ramp_h ** 2) + (ramp_y ** 2)) ** 0.5);
        if (two_ramps) {
            this.polygonWall([(y - (2 * ramp_y)), a, l, (90 - a), (h - ramp_h), 90, y, 90, (h - ramp_h), (90 - a), l, a], (front ? "fffeff" : "ffeeef"), {move: move});
        }
        else {
            this.polygonWall([(y - ramp_y), 90, h, 90, y, 90, (h - ramp_h), (90 - a), l, a], (front ? "ffeff" : "ffeef"), {move: move});
        }
    }

    outerWall(h, y, ramp_h, ramp_y, two_ramps, front, move) {
        let a = (Math.atan((ramp_h / ramp_y)) * 180 / Math.PI);
        let l = (((ramp_h ** 2) + (ramp_y ** 2)) ** 0.5);
        let t = this.thickness;
        const cb = () => {
            this.ctx.save();
            this.moveTo(ramp_y, 0, (180 - a));
            this.fingerHolesAt(0, (0.5 * t), l, 0);
            this.ctx.restore();
            if (two_ramps) {
                this.moveTo((y - ramp_y), 0, a);
                this.fingerHolesAt(0, (-0.5 * t), l, 0);
            }
        };

        if (two_ramps) {
            this.rectangularWall(y, h, [CompoundEdge(this, "EFE", [ramp_y, (y - (2 * ramp_y)), ramp_y]), (front ? CompoundEdge(this, "EF", [ramp_h, (h - ramp_h)]) : "e"), "e", (front ? CompoundEdge(this, "FE", [(h - ramp_h), ramp_h]) : "e")], {callback: [cb], move: move});
        }
        else {
            this.rectangularWall(y, h, [(front ? CompoundEdge(this, "EF", [ramp_y, (y - ramp_y)]) : "e"), "F", "e", CompoundEdge(this, "FE", [(h - ramp_h), ramp_h])], {callback: [cb], move: move});
        }
    }

    holeCB(sections, height) {
        const CB = () => {
            let pos = (-0.5 * this.thickness);
            for (let l of sections.slice(0, -1)) {
                pos += (l + this.thickness);
                this.fingerHolesAt(pos, 0, height);
            }
        };

        return CB;
    }

    render_simple_tray_divider(width, height, move) {;
        if (this.move(width, height, move, true)) {
            return;
        }
        let t = this.thickness;
        this.moveTo(t);
        this.polyline((width - (2 * t)), 90, t, -90, t, 90, (height - t), 90, width, 90, (height - t), 90, t, -90, t, 90);
        this.move(width, height, move);
    }

    render_simple_tray_divider_feet(move) {
        let sqr2 = Math.sqrt(2);
        let t = this.thickness;
        let divider_foot_width = (2 * t);
        let full_width = (t + (2 * divider_foot_width));
        let move_length = ((full_width / sqr2) + (2 * this.burn));
        let move_width = ((full_width / sqr2) + (2 * this.burn));
        if (this.move(move_width, move_length, move, true)) {
            return;
        }
        this.moveTo(this.burn);
        this.ctx.save();
        this.polyline((sqr2 * divider_foot_width), 135, t, -90, t, -90, t, 135, (sqr2 * divider_foot_width), 135, full_width, 135);
        this.ctx.restore();
        this.moveTo((-this.burn / sqr2), (this.burn * (1 + (1 / sqr2))), 45);
        this.moveTo(full_width);
        this.polyline(0, 135, (sqr2 * divider_foot_width), 135, t, -90, t, -90, t, 135, (sqr2 * divider_foot_width), 135);
        this.move(move_width, move_length, move);
    }

    render() {
        let sx;
        let y;
        let h;
        [sx, y, h] = [this.sx, this.y, this.h];
        let t = this.thickness;
        let a = this.angle;
        let b = "e";
        if (this.outside) {
            let dy = (this.front_panel ? t : (t / (2 ** 0.5)));
        }
        let x = (sx.reduce((a, b) => a + b, 0) + ((sx.length - 1) * t));
        let ramp_h = (h * this.rampheight);
        let ramp_y = (ramp_h / Math.tan((a * Math.PI / 180)));
        if ((this.two_sided && ((2 * ramp_y) + (3 * t)) > y)) {
            ramp_y = ((y - (3 * t)) / 2);
            ramp_h = (ramp_y * Math.tan((a * Math.PI / 180)));
        }
        else {
            if (ramp_y > (y - t)) {
                ramp_y = (y - t);
                ramp_h = (ramp_y * Math.tan((a * Math.PI / 180)));
            }
        }
        let ramp_l = (((ramp_h ** 2) + (ramp_y ** 2)) ** 0.5);
        this.ctx.save();
        this.outerWall(h, y, ramp_h, ramp_y, this.two_sided, this.front_panel, {move: "up"});
        this.outerWall(h, y, ramp_h, ramp_y, this.two_sided, this.front_panel, {move: "mirror up"});
        for (let i = 0; i < (sx.length - 1); i += 1) {
            this.innerWall(h, y, ramp_h, ramp_y, this.two_sided, this.front_panel, {move: "up"});
        }
        this.ctx.restore();
        this.innerWall(h, y, ramp_h, ramp_y, this.two_sided, this.front_panel, {move: "right only"});
        if (this.front_panel) {
            this.rectangularWall(x, (h - ramp_h), "efef", {callback: [this.holeCB(sx, (h - ramp_h))], move: "up"});
        }
        this.rectangularWall(x, ramp_l, "efef", {callback: [this.holeCB(sx, ramp_l)], move: "up"});
        if (this.two_sided) {
            this.rectangularWall(x, (y - (2 * ramp_y)), "efef", {callback: [this.holeCB(sx, (y - (2 * ramp_y)))], move: "up"});
            this.rectangularWall(x, ramp_l, "efef", {callback: [this.holeCB(sx, ramp_l)], move: "up"});
            if (this.front_panel) {
                this.rectangularWall(x, (h - ramp_h), "efef", {callback: [this.holeCB(sx, (h - ramp_h))], move: "up"});
            }
        }
        else {
            this.rectangularWall(x, (y - ramp_y), "efff", {callback: [this.holeCB(sx, (y - ramp_y))], move: "up"});
            this.rectangularWall(x, h, "Ffef", {callback: [this.holeCB(sx, h)], move: "up"});
        }
        if (this.two_sided) {
            this.ctx.save();
            for (let l of this.sx) {
                this.render_simple_tray_divider(l, h, {move: "right"});
            }
            this.partsMatrix(this.sx.length, 0, "right", this.render_simple_tray_divider_feet);
            this.ctx.restore();
            this.render_simple_tray_divider(l, h, {move: "up only"});
            this.lid(x, y);
        }
    }

}

module.exports.SmallPartsTray = SmallPartsTray;