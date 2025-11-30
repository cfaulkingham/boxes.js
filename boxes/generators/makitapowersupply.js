import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class MakitaPowerSupply extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.argparser.add_argument("--banana_socket_diameter", {action: "store", type: "float", default: 8.0, help: "diameter of the banana socket mounting holes"});
        this.argparser.add_argument("--flipswitch_diameter", {action: "store", type: "float", default: 6.3, help: "diameter of the flipswitch mounting hole (disabled of no secondary power)"});
        this.argparser.add_argument("--secondary_power", {action: "store", default: "ibm-barrel", choices: ["ibm-barrel", "usb-c", "none"], help: "style of secondary power input"});
    }

    side(l, h, move) {
        let t = this.thickness;
        let tw;
        let th;
        [tw, th] = [(h + t), l];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(t, 0);
        this.polyline(h, 90, (l - (h / (3 ** 0.5))), 60, ((h * 2) / (3 ** 0.5)), 120);
        this.edges["f"](l);
        this.move(tw, th, move);
    }

    side2(l, h, move) {
        let t = this.thickness;
        let tw;
        let th;
        [tw, th] = [h, (l - 10)];
        if (this.move(tw, th, move, true)) {
            return;
        }
        if (h > 14) {
            this.polyline(h, 90, (l - 12), 90, (h - 14), 90, (50 - 12), -90, 8, -90);
        }
        else {
            this.polyline(h, 90, (l - 50), 90, (h - 6), -90);
        }
        this.polyline(11, 90, 1, -90, 27, [90, 1], 3, [90, 1], (l - 12), 90);
        this.move(tw, th, move);
    }

    bottom() {
        let t = this.thickness;
        let m = (this.x / 2);
        this.fingerHolesAt(((m - 30.5) - (0.5 * t)), 10, this.l);
        this.fingerHolesAt(((m + 30.5) + (0.5 * t)), 10, this.l);
        this.rectangularHole((m - 19), (10 + 34), 0.8, 6.25);
        this.rectangularHole((m + 19), (10 + 34), 0.8, 6.25);
        this.rectangularHole(m, 7.5, 35, 5);
    }

    front() {
        let d_b = this.banana_socket_diameter;
        let d_f = this.flipswitch_diameter;
        let secondary_power_style = this.secondary_power;
        this.hole(10, (this.h / 2), {d: d_b});
        this.hole(30, (this.h / 2), {d: d_b});
        if (secondary_power_style === "ibm-barrel") {
            this.hole(50, (this.h / 2), {d: d_f});
            this.rectangularHole(76, 6.4, 12.4, 12.4);
        }
        if (secondary_power_style === "usb-c") {
            this.hole(50, (this.h / 2), {d: d_f});
            this.rectangularHole(75, 2.6, 9.2, 3.2, {r: 1});
        }
    }

    back() {
        let n = parseInt(Math.floor((this.h - (2 * this.thickness)) / 8));
        let offs = (((this.h - (n * 8.0)) / 2) + 4);
        for (let i = 0; i < n; i += 1) {
            this.rectangularHole((this.x / 2), ((i * 8) + offs), (this.x - 20), 5, {r: 2.5});
        }
    }

    regulatorCB() {
        this.rectangularHole(21, 9.5, 35, 5);
        this.rectangularHole(5, (33 + 12), 10, 10);
        this.rectangularHole((42 - 5), (33 + 12), 10, 10);
        for (let x of [3.5, 38.5]) {
            for (let y of [3.5, 65]) {
                this.hole(x, y, 1.0);
            }
        }
    }

    render() {
        let t = this.thickness;
        let hm = 15.5;
        this.rectangularWall(x, h, "FFFF", {callback: [this.front], move: "right"});
        this.rectangularWall(y, h, "FfFf", {move: "up"});
        this.rectangularWall(y, h, "FfFf");
        this.rectangularWall(x, h, "FFFF", {callback: [this.back], move: "left up"});
        this.rectangularWall(x, y, "ffff", {callback: [this.bottom], move: "right"});
        this.rectangularWall(x, y, "ffff", {callback: [() => this.rectangularHole((x / 2), ((y - 20) - 5), 76, 40)], move: ""});
        this.rectangularWall(x, y, "ffff", {move: "left up only"});
        this.side(l, hm, {move: "right"});
        this.side(l, hm, {move: "right mirror"});
        this.side2(l, hm, {move: "right"});
        this.side2(l, hm, {move: "right mirror"});
    }

}

export { MakitaPowerSupply };