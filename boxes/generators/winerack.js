import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class WineRack extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 46.0, help: "Radius of comb"});
        this.argparser.add_argument("--walls", {action: "store", type: "str", default: "all", choices: ["minimal", "no_verticals", "all"], help: "which of the honey comb walls to add"});
    }

    hexFingerHoles(x, y, l, angle) {
        this.ctx.save();
        this.moveTo(x, y, angle);
        this.moveTo(this.delta, 0, 0);
        this.fingerHolesAt(0, 0, (l - (2 * this.delta)), 0);
        this.ctx.restore();
    }

    wallCB(frontwall, backwall) {
        let r = this.r;
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let dx;
        let dy;
        [dx, dy] = [this.dx, this.dy];
        let cx;
        let cy;
        [cx, cy] = [this.cx, this.cy];
        let t = this.thickness;
        if ((cy % 2)) {
            let ty = (((Math.floor(cy / 2) * ((2 * dy) + (2 * r))) + (2 * dy)) + r);
        }
        else {
            ty = ((Math.floor(cy / 2) * ((2 * dy) + (2 * r))) + dy);
        }
        this.moveTo(((x - ((dx * 2) * cx)) / 2), ((y - ty) / 2));
        let wmin = this.walls === "minimal";
        for (let i = 0; i < (Math.floor(cy / 2) + (cy % 2)); i += 1) {
            if ((!frontwall && this.walls === "all")) {
                this.hexFingerHoles(0, ((((2 * r) + (2 * dy)) * i) + dy), r, 90);
            }
            for (let j = 0; j < cx; j += 1) {
                if (!backwall) {
                    this.hole((((j * 2) * dx) + dx), ((((2 * r) + (2 * dy)) * i) + r), (dx - t));
                }
                if (frontwall) {
                }
                this.hexFingerHoles((((j * 2) * dx) + dx), (((2 * r) + (2 * dy)) * i), r, 150);
                this.hexFingerHoles((((j * 2) * dx) + dx), (((2 * r) + (2 * dy)) * i), r, 30);
                if (this.walls === "all") {
                    this.hexFingerHoles((((j * 2) * dx) + (2 * dx)), ((((2 * r) + (2 * dy)) * i) + dy), r, 90);
                }
                if ((wmin && i === Math.floor(cy / 2))) {
                }
                if ((j > 0 || !wmin)) {
                    this.hexFingerHoles((((j * 2) * dx) + dx), (((((2 * r) + (2 * dy)) * i) + r) + (2 * dy)), r, -150);
                }
                if ((j < (cx - 1) || !wmin)) {
                    this.hexFingerHoles((((j * 2) * dx) + dx), (((((2 * r) + (2 * dy)) * i) + r) + (2 * dy)), r, -30);
                }
            }
            if (i < Math.floor(cy / 2)) {
                for (let j = 0; j < cx; j += 1) {
                    if ((!frontwall && this.walls === "all")) {
                        this.hexFingerHoles((((j * 2) * dx) + dx), (((((2 * r) + (2 * dy)) * i) + r) + (2 * dy)), r, 90);
                    }
                }
                if (!backwall) {
                    for (let j = 1; j < cx; j += 1) {
                        this.hole(((j * 2) * dx), (((((2 * r) + (2 * dy)) * i) + (2 * r)) + dy), (dx - t));
                    }
                }
            }
        }
        if ((cy % 2)) {
        }
        else {
            i = Math.floor(cy / 2);
            for (let j = 0; j < cx; j += 1) {
                if ((frontwall || wmin)) {
                }
                if (j > 0) {
                    this.hexFingerHoles((((j * 2) * dx) + dx), (((2 * r) + (2 * dy)) * i), r, 150);
                }
                if (j < (cx - 1)) {
                    this.hexFingerHoles((((j * 2) * dx) + dx), (((2 * r) + (2 * dy)) * i), r, 30);
                }
            }
        }
    }

    render() {
        let x;
        let y;
        let h;
        let radius;
        [x, y, h, radius] = [this.x, this.y, this.h, this.radius];
        let t = this.thickness;
        this.delta = (((3 ** 0.5) / 6.0) * t);
        this.rectangularWall(x, y, {callback: [this.wallCB], move: "up"});
        this.rectangularWall(x, y, {callback: [() => this.wallCB()], move: "up"});
        this.rectangularWall(x, y, {callback: [() => this.wallCB()], move: "up"});
        if (this.walls === "all") {
            let tc = ((Math.floor(cy / 2) + (cy % 2)) * ((6 * cx) + 1));
        }
        else {
            tc = ((Math.floor(cy / 2) + (cy % 2)) * (4 * cx));
        }
        if (this.walls === "minimal") {
            tc -= (2 * Math.floor(cy / 2));
        }
        if ((cy % 2)) {
            if (this.walls === "all") {
                tc -= cx;
            }
        }
        else {
            if (this.walls !== "minimal") {
                tc += ((2 * cx) - 2);
            }
        }
        this.partsMatrix(tc, cx, "up", this.rectangularWall, (r - (2 * this.delta)), h, "fefe");
    }

}

export { WineRack };