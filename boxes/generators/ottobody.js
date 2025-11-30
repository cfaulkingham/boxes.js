import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

const _ = (message) => {
    return message;
}

class OttoBody extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.ChestHingeSettings);
    }

    bottomCB() {
        this.hole(6, (this.y / 2), 6);
        this.hole(6, ((this.y / 2) - 6), 3);
        this.hole((this.x - 6), (this.y / 2), 6);
        this.hole((this.x - 6), ((this.y / 2) - 6), 3);
        this.rectangularHole((this.x / 2), (this.y / 2), 10, 5, 1.5);
        this.rectangularHole((this.x - 7), (this.y - 2.8), 7, 4);
        this.moveTo(0, (this.y - 12));
        this.hexHolesCircle(12, HexHolesSettings(this));
    }

    leftBottomCB() {
        this.hole(7, (this.y - 7), 6);
        this.hole(6, ((this.y / 2) + 9), 0.9);
        this.rectangularHole(6, ((this.y / 2) - 5.5), 12, 23);
        this.hole(6, ((this.y / 2) - 20), 0.9);
    }

    rightBottomCB() {
        this.hole(7, (this.y - 5), 2);
        this.hole(8, ((this.y / 2) + 9), 0.9);
        this.rectangularHole(8, ((this.y / 2) - 5.5), 12, 23);
        this.hole(8, ((this.y / 2) - 20), 0.9);
    }

    eyeCB() {
        this.hole(((this.x / 2) + 13), (this.hl / 2), 8);
        this.hole(((this.x / 2) - 13), (this.hl / 2), 8);
    }

    frontCB() {
        let t = this.thickness;
        this.rectangularHole((0.5 * t), (2 + t), t, 2.5);
        this.rectangularHole((this.x - (0.5 * t)), (2 + t), t, 2.5);
    }

    IOCB() {
        this.rectangularHole(26, 18, 12, 10);
    }

    buttonCB() {
        let px;
        let py;
        [px, py] = [7.5, 7.5];
        this.rectangularHole(px, (py - 2.25), 5.2, 2.5);
        this.rectangularHole(px, (py + 2.25), 5.2, 2.5);
    }

    PCB_Clip(x, y, move) {
        if (this.move((x + 4), y, move, true)) {
            return;
        }
        this.moveTo(1.5);
        this.polyline((x - 1.5), 90, [y, 2], 90, x, 85, [((y - 2) - 4), 2], -30, 2, 120, 1, -90, 2, [180, 1.0], (y - 7), -175, (y - 5));
        this.move((x + 4), y, move);
    }

    PCB_Clamp(w, s, h, move) {
        let t = this.thickness;
        let f = (2 ** 0.5);
        if (this.move((w + 4), ((h + 8) + t), move, true)) {
            return;
        }
        this.polyline(w, 90, s, -90, 1, [90, 1], [((h - s) - 1), 2], 90, (w - 2), 90, (h - 8), [-180, 1], ((h - 8) + (3 * t)), 135, (f * 4), 90, (f * 2), -45, [(h + t), 2]);
        this.move((w + 4), ((h + 8) + t), move);
    }

    render() {
        let t = this.thickness;
        let hx = this.edges["O"].startwidth();
        let hx2 = this.edges["P"].startwidth();
        let e1 = edges.CompoundEdge(this, "Fe", [(h - hx), hx]);
        let e2 = edges.CompoundEdge(this, "eF", [hx, (h - hx)]);
        let e_back = ["F", e1, "e", e2];
        this.moveTo(hx);
        this.rectangularWall(x, (h - hx), "FfOf", {ignore_widths: [2], move: "up", label: _("Left bottom side")});
        this.rectangularWall(x, (hl - hx2), "pfFf", {ignore_widths: [1], move: "up", label: _("Left top side")});
        this.moveTo(-hx);
        this.rectangularWall(x, (h - hx), "Ffof", {ignore_widths: [5], callback: [() => this.rectangularHole((y - 7.5), ((h - 4) - 7.5), 6.2, 7.0)], move: "up", label: _("Right bottom side")});
        this.rectangularWall(x, (hl - hx2), "PfFf", {ignore_widths: [6], callback: [null, null, this.IOCB], move: "up", label: _("Right top side")});
        this.rectangularWall(y, h, "FFeF", {callback: [null, null, this.frontCB], move: "up", label: _("Lower front")});
        this.rectangularWall(y, h, e_back, {move: "up", label: _("Lower back")});
        this.rectangularWall(y, hl, "FFeF", {callback: [this.eyeCB], move: "up", label: _("Upper front")});
        this.rectangularWall(y, (hl - hx2), "FFqF", {move: "up", label: _("Upper back")});
        this.rectangularWall(x, y, "ffff", {move: "up", label: _("Top")});
        this.rectangularWall(x, y, "ffff", {callback: [this.bottomCB], move: "up", label: _("Bottom")});
        this.ctx.save();
        this.PCB_Clamp((y - 53.5), 4.5, hl, {move: "right"});
        this.PCB_Clamp((y - 50), 4.5, hl, {move: "right"});
        this.PCB_Clip(3.5, hl, {move: "right"});
        this.rectangularWall(15, 15, {callback: [this.buttonCB]});
        this.ctx.restore();
        this.PCB_Clamp((y - 53.5), 4.5, hl, {move: "up only"});
        this.moveTo(0, 50);
        this.rectangularWall(y, 14, {callback: [null, null, null, this.leftBottomCB], move: "up", label: _("Servo mount")});
        this.rectangularWall((y - 5.6), 14, {callback: [null, null, null, this.rightBottomCB], move: "up", label: _("Servo mount")});
    }

}

export { OttoBody };