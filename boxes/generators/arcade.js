import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Arcade extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.argparser.add_argument("--width", {action: "store", type: "float", default: 450.0, help: "inner width of the console"});
        this.argparser.add_argument("--monitor_height", {action: "store", type: "float", default: 350.0, help: "inner width of the console"});
        this.argparser.add_argument("--keyboard_depth", {action: "store", type: "float", default: 150.0, help: "inner width of the console"});
    }

    side(move) {
        let y;
        let h;
        [y, h] = [this.y, this.h];
        let t = this.thickness;
        let r = 10;
        let d_30 = ((2 * r) * Math.tan((15 * Math.PI / 180)));
        let tw;
        let th;
        [tw, th] = [((y + (2 * r)) + ((this.front + t) * Math.sin((15 * Math.PI / 180)))), ((h + (2 * r)) + ((this.topback + t) / (2 ** 0.5)))];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo((r + ((this.front + t) * Math.sin((15 * Math.PI / 180)))), 0);
        this.ctx.save();
        this.moveTo(0, r);
        this.polyline(y, 90, h, 45, (this.topback + t), 90, (this.top + (2 * t)), 90, 100, -90, this.monitor_height, -30, (this.keyboard_depth + (2 * t)), 90, (this.front + t), 75);
        this.ctx.restore();
        this.fingerHolesAt(10, (r + (t / 2)), this.bottom, 0);
        this.polyline(y, [90, r]);
        this.fingerHolesAt((0.5 * t), (r + (t / 2)), this.back, 0);
        this.fingerHolesAt(((h - 40) - 40), (r + (t / 2)), this.back, 0);
        this.polyline(h, [45, r]);
        this.fingerHolesAt(0, (r + (t / 2)), this.topback, 0);
        this.fingerHolesAt((this.topback + (t / 2)), (r + t), this.top, 90);
        this.fingerHolesAt(this.topback, ((this.top + r) + (1.5 * t)), this.speaker, -180);
        this.polyline((this.topback + t), [90, r], (this.top + (2 * t)), [90, r], (100 - (2 * r)), [-90, r], ((this.monitor_height - (2 * r)) - d_30), [-30, r]);
        this.fingerHolesAt((-d_30 + t), (r + (0.5 * t)), this.keyboard_depth, 0);
        this.fingerHolesAt((-d_30 + (0.5 * t)), (r + t), this.keyback, 90);
        this.fingerHolesAt(((this.keyboard_depth - d_30) + (1.5 * t)), (r + t), this.front, 90);
        this.polyline(((this.keyboard_depth - d_30) + (2 * t)), [90, r], (this.front + t), [75, r]);
        this.move(tw, th, move);
    }

    keyboard() {
    }

    speakers() {
        this.hole((this.width / 4.0), 50, 40);
        this.hole(((this.width * 3) / 4.0), 50, 40);
    }

    render() {
        let width = this.width;
        let t = this.thickness;
        this.back = 40;
        this.front = 120;
        this.keyback = 50;
        this.speaker = 150;
        this.top = 100;
        this.topback = 200;
        this.bottom = ((y - 40) - (0.5 * t));
        this.backwall = (h - 40);
        this.rectangularWall(width, this.bottom, "efff", {move: "up"});
        this.rectangularWall(width, this.back, "Ffef", {move: "up"});
        this.rectangularWall(width, this.backwall, {move: "up"});
        this.rectangularWall(width, this.back, "efef", {move: "up"});
        this.rectangularWall(width, this.front, "efff", {move: "up"});
        this.rectangularWall(width, this.keyboard_depth, "FfFf", {callback: [this.keyboard], move: "up"});
        this.rectangularWall(width, this.keyback, "ffef", {move: "up"});
        this.rectangularWall(width, this.speaker, "efff", {callback: [null, null, this.speakers], move: "up"});
        this.rectangularWall(width, this.top, "FfFf", {move: "up"});
        this.rectangularWall(width, this.topback, "ffef", {move: "up"});
        this.side({move: "up"});
        this.side({move: "up"});
    }

}

export { Arcade };