import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Console2 extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 0.5});
        this.addSettingsArgs(edges.StackableSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--front_height", {action: "store", type: "float", default: 30, help: "height of the front below the panel (in mm)"});
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 50, help: "angle of the front panel (90°=upright)"});
        this.argparser.add_argument("--removable_backwall", {action: "store", type: boolarg, default: true, help: "have latches at the backwall"});
        this.argparser.add_argument("--removable_panel", {action: "store", type: boolarg, default: true, help: "The panel is held by tabs and can be removed"});
        this.argparser.add_argument("--glued_panel", {action: "store", type: boolarg, default: true, help: "the panel is glued and not held by finger joints"});
    }

    borders() {
        let x;
        let y;
        let h;
        let fh;
        [x, y, h, fh] = [this.x, this.y, this.h, this.front_height];
        let t = this.thickness;
        let panel = Math.min(((h - fh) / Math.cos(((90 - this.angle) * Math.PI / 180))), (y / Math.cos((this.angle * Math.PI / 180))));
        let top = (y - (panel * Math.cos((this.angle * Math.PI / 180))));
        h = (fh + (panel * Math.sin((this.angle * Math.PI / 180))));
        if (top > (0.1 * t)) {
            let borders = [y, 90, fh, (90 - this.angle), panel, this.angle, top, 90, h, 90];
        }
        else {
            borders = [y, 90, fh, (90 - this.angle), panel, (this.angle + 90), h, 90];
        }
        return borders;
    }

    latch(move) {
        let t = this.thickness;
        let s = (0.1 * t);
        let tw;
        let th;
        [tw, th] = [(8 * t), (3 * t)];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(0, (1.2 * t));
        this.polyline(t, -90, (0.2 * t), 90, (2 * t), -90, t, 90, t, 90, t, -90, (3 * t), 90, t, -90, t, 90, t, 90, (2 * t), 90, (0.5 * t), -94, (4.9 * t), 94, (0.5 * t), 86, (4.9 * t), -176, (5 * t), -90, (1.0 * t), 90, t, 90, (1.8 * t), 90);
        this.move(tw, th, move);
    }

    latch_clamp(move) {
        let t = this.thickness;
        let s = (0.1 * t);
        let tw;
        let th;
        [tw, th] = [(4 * t), (4 * t)];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo((0.5 * t));
        this.polyline((t - (0.5 * s)), 90, ((2.5 * t) + (0.5 * s)), -90, (t + s), -90, ((2.5 * t) + (0.5 * s)), 90, (t - (0.5 * s)), 90, t, -90, (0.5 * t), 90, (2 * t), 45, ((2 ** 0.5) * t), 45, (2 * t), 45, ((2 ** 0.5) * t), 45, (2 * t), 90, (0.5 * t), -90, t, 90);
        this.move(tw, th, move);
    }

    latch_hole(posx) {
        let t = this.thickness;
        let s = (0.1 * t);
        this.moveTo(posx, (2 * t), 180);
        let path = [(1.5 * t), -90, t, -90, (t - (0.5 * s)), 90];
        path = ((path + [(2 * t)]) + list(reversed(path)));
        path = ((path.slice(0, -1) + [(3 * t)]) + list(reversed(path.slice(0, -1))));
        this.polyline(...path);
    }

    panel_side(l, move) {
        let t = this.thickness;
        let s = (0.1 * t);
        let tw;
        let th;
        [tw, th] = [l, (3 * t)];
        if (!this.glued_panel) {
            th += t;
        }
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.rectangularHole((3 * t), (1.5 * t), (3 * t), (1.05 * t));
        this.rectangularHole((l - (3 * t)), (1.5 * t), (3 * t), (1.05 * t));
        this.rectangularHole((l / 2), (1.5 * t), (2 * t), t);
        if (this.glued_panel) {
            this.polyline(...([l, 90, t, 90, t, -90, t, -90, t, 90, t, 90] * 2));
        }
        else {
            this.polyline(l, 90, (3 * t), 90);
            this.edges["f"](l);
            this.polyline(0, 90, (3 * t), 90);
        }
        this.move(tw, th, move);
    }

    panel_lock(l, move) {
        let t = this.thickness;
        l -= (4 * t);
        let tw;
        let th;
        [tw, th] = [l, (2.5 * t)];
        if (this.move(tw, th, move, true)) {
            return;
        }
        let end = [((l / 2) - (3 * t)), -90, (1.5 * t), [90, (0.5 * t)], t, [90, (0.5 * t)], t, 90, (0.5 * t), -90, (0.5 * t), -90, 0, [90, (0.5 * t)], 0, 90];
        this.moveTo(((l / 2) - t), (2 * t), -90);
        this.polyline(...((([t, 90, (2 * t), 90, t, -90] + end) + [l]) + list(reversed(end))));
        this.move(tw, th, move);
    }

    panel_cross_beam(l, move) {
        let t = this.thickness;
        let tw;
        let th;
        [tw, th] = [(l + (2 * t)), (3 * t)];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(t, 0);
        this.polyline(...([l, 90, t, -90, t, 90, t, 90, t, -90, t, 90] * 2));
        this.move(tw, th, move);
    }

    side(borders, bottom, move, label) {
        let t = this.thickness;
        bottom = this.edges.get(bottom, bottom);
        let tw = (borders[0] + (2 * this.edges["f"].spacing()));
        let th = ((borders[-2] + bottom.spacing()) + this.edges["f"].spacing());
        if (this.move(tw, th, move, true)) {
            return;
        }
        let d1 = (t * Math.cos((this.angle * Math.PI / 180)));
        let d2 = (t * Math.sin((this.angle * Math.PI / 180)));
        this.moveTo(t, 0);
        bottom(borders[0]);
        this.corner(90);
        this.edges["f"](((borders[2] + bottom.endwidth()) - d1));
        this.edge(d1);
        this.corner(borders[3]);
        if (this.removable_panel) {
            this.rectangularHole((3 * t), (1.5 * t), (2.5 * t), (1.05 * t));
        }
        if ((!this.removable_panel && !this.glued_panel)) {
            this.edges["f"](borders[4]);
        }
        else {
            this.edge(borders[4]);
        }
        if (this.removable_panel) {
            this.rectangularHole((-3 * t), (1.5 * t), (2.5 * t), (1.05 * t));
        }
        if (borders.length === 10) {
            this.corner(borders[5]);
            this.edge(d2);
            this.edges["f"]((borders[6] - d2));
        }
        this.corner(borders[-3]);
        if (this.removable_backwall) {
            this.rectangularHole(this.latchpos, (1.55 * t), (1.1 * t), (1.1 * t));
            this.edge((borders[-2] - t));
            this.edges["f"]((t + bottom.startwidth()));
        }
        else {
            this.edges["f"]((borders[-2] + bottom.startwidth()));
        }
        this.corner(borders[-1]);
        this.move(tw, th, move, {label: label});
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let t = this.thickness;
        let bottom = this.edges.get(this.bottom_edge);
        let back_top_edge = "e";
        let top_back_edge = "e";
        if (!this.removable_backwall) {
            back_top_edge = "f";
            top_back_edge = "F";
        }
        if (this.outside) {
        }
        let d1 = (t * Math.cos((this.angle * Math.PI / 180)));
        let d2 = (t * Math.sin((this.angle * Math.PI / 180)));
        let borders = this.borders();
        this.side(borders, bottom, {move: "right", label: "Left Side"});
        this.side(borders, bottom, {move: "right", label: "Right Side"});
        this.rectangularWall(borders[0], x, "ffff", {move: "right", label: "Floor"});
        this.rectangularWall((borders[2] - d1), x, ["F", "e", "F", bottom], {ignore_widths: [7, 4], move: "right", label: "Front"});
        if (this.glued_panel) {
            this.rectangularWall(borders[4], x, "EEEE", {move: "right", label: "Panel"});
        }
        else {
            if (this.removable_panel) {
                this.rectangularWall(borders[4], (x - (2 * t)), "hEhE", {move: "right", label: "Panel"});
            }
            else {
                this.rectangularWall(borders[4], x, "FEFE", {move: "right", label: "Panel"});
            }
        }
        if (borders.length === 10) {
            this.rectangularWall((borders[6] - d2), x, ["F", "E", "F", top_back_edge], {move: "right", label: "Top"});
        }
        if (this.removable_backwall) {
            this.rectangularWall((borders[-2] - (1.05 * t)), x, "EeEe", {callback: [() => this.latch_hole(latchpos), () => this.fingerHolesAt((0.5 * t), 0, ((borders[-2] - (4.05 * t)) - latchpos)), () => this.latch_hole(((borders[-2] - (1.2 * t)) - latchpos)), () => this.fingerHolesAt((0.5 * t), ((3.05 * t) + latchpos), ((borders[-2] - (4.05 * t)) - latchpos))], move: "right", label: "Back Wall"});
            this.rectangularWall((2 * t), ((borders[-2] - (4.05 * t)) - latchpos), "EeEf", {move: "right", label: "Guide"});
            this.rectangularWall((2 * t), ((borders[-2] - (4.05 * t)) - latchpos), "EeEf", {move: "right", label: "Guide"});
            this.rectangularWall(t, x, ["F", bottom, "F", "e"], {ignore_widths: [0, 3], move: "right", label: "Bottom Back"});
        }
        else {
            this.rectangularWall(borders[-2], x, ["F", bottom, "F", back_top_edge], {ignore_widths: [0, 3], move: "right", label: "Back Wall"});
        }
        if (this.removable_panel) {
            if (this.glued_panel) {
                this.panel_cross_beam((x - (2.05 * t)), "rotated right");
                this.panel_cross_beam((x - (2.05 * t)), "rotated right");
            }
            this.panel_lock(borders[4], "up");
            this.panel_lock(borders[4], "up");
            this.panel_side(borders[4], "up");
            this.panel_side(borders[4], "up");
        }
        if (this.removable_backwall) {
            this.latch({move: "up"});
            this.latch({move: "up"});
            this.partsMatrix(4, 2, "up", this.latch_clamp);
        }
    }

}

export { Console2 };