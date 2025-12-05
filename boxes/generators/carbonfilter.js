import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class CarbonFilter extends Boxes {
    // Default configuration for test runner and standalone usage
    static get defaultConfig() {
        return {
            x: 550,
            y: 550,
            h: 250,
            pockets: 3,
            ribs: 12
        };
    }

    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.buildArgParser({x: 550, y: 550, h: 250});
        this.argparser.add_argument("--pockets", {action: "store", type: "int", default: 3, help: "number of V shaped filter pockets"});
        this.argparser.add_argument("--ribs", {action: "store", type: "int", default: 12, help: "number of ribs to hold the bottom and the mesh"});
    }

    sideCB() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let t = this.thickness;
        let p = this.pockets;
        let posx = t;
        let w = this.w;
        let a = this.a;
        this.fingerHolesAt((t / 2), h, 50, -90);
        this.fingerHolesAt((x - (t / 2)), h, 50, -90);
        for (let i = 0; i < p; i += 1) {
            this.fingerHolesAt((posx + (t / 2)), h, 50, (-90 + a));
            this.fingerHolesAt(((posx + 40) + (t / 2)), h, 50, (-90 + a));
            this.fingerHolesAt(((posx + w) - (t / 2)), h, 50, (-90 - a));
            this.fingerHolesAt((((posx + w) - 40) - (t / 2)), h, 50, (-90 - a));
            this.fingerHolesAt((((posx + (w / 2)) - 50) + t), (3.5 * t), (100 - (2 * t)), 0);
            posx += w;
        }
    }

    bottomCB() {
        let t = this.thickness;
        for (let i = 0; i < this.ribs; i += 1) {
            this.fingerHolesAt(((((i + 1) * this.y) / (this.ribs + 1)) - (1.5 * t)), 0, (4 * t), 90);
            this.fingerHolesAt(((((i + 1) * this.y) / (this.ribs + 1)) - (1.5 * t)), (40 - t), 20, 90);
        }
    }

    topRailCB() {
        let t = this.thickness;
        for (let i = 0; i < this.ribs; i += 1) {
            this.fingerHolesAt(((((i + 1) * this.y) / (this.ribs + 1)) - (1.5 * t)), 0, 30, 90);
        }
    }

    innerRibs(n, move) {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let t = this.thickness;
        let a = this.a;
        let a_ = (a * Math.PI / 180);
        let l = (((h - (4 * t)) / Math.cos(a_)) - ((0.5 * t) * Math.sin(a_)));
        let tw = ((n * (20 + this.spacing)) + (l * Math.sin(a_)));
        let th = (((h - (3 * t)) - (20 * Math.cos(a_))) + this.spacing);
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(0, t);
        for (let i = 0; i < n; i += 1) {
            this.edges["f"].draw(20);
            this.polyline(0, (90 - a), (l - 50), 90, t, -90);
            this.edges["f"].draw(30);
            this.polyline(0, (90 + a), (20 - t), (90 - a), ((l - 20) + (t * Math.sin(a_))), (90 + a));
            this.moveTo((20 + this.spacing));
            this.ctx.stroke();
        }
        this.move(tw, th, move, false, "Inner ribs");
    }

    sideHolders(n, move) {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let t = this.thickness;
        let a = this.a;
        let a_ = (a * Math.PI / 180);
        let l = ((((h - (4 * t)) / Math.cos(a_)) - ((0.5 * t) * Math.sin(a_))) - 50);
        let tw = ((n * (10 + this.spacing)) + (l * Math.sin(a_)));
        let th = ((h - (4 * t)) - 50);
        if (this.move(tw, th, move, true)) {
            return;
        }
        for (let i = 0; i < n; i += 1) {
            this.polyline(10, (90 - a), l, (90 + a), 10, (90 - a), l, (90 + a));
            this.ctx.stroke();
            this.moveTo((10 + this.spacing));
        }
        this.move(tw, th, move, false, "Side holders");
    }

    topStabilizers(n, move) {
        let t = this.thickness;
        let l = (((2 * (this.h - 60)) * Math.sin((this.a * Math.PI / 180))) - 20);
        let tw = (n * ((6 * t) + this.spacing));
        let th = (l + (4 * t));
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(t);
        for (let i = 0; i < n; i += 1) {
            for (let j = 0; j < 2; j += 1) {
                this.polyline(0, 90, (2 * t), -90, t, -90, (2 * t), 90, (3 * t), [90, t], (l + (2 * t)), [90, t]);
            }
            this.ctx.stroke();
            this.moveTo(((6 * t) + this.spacing));
        }
        this.move(tw, th, move, false, "Top stabilizers");
    }

    outerRibs(n, n_edge, move) {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let t = this.thickness;
        let a = this.a;
        let a_ = (a * Math.PI / 180);
        let l = (((h - (4 * t)) / Math.cos(a_)) + ((0.5 * t) * Math.sin(a_)));
        let dl = ((20 - t) * (Math.tan(((Math.PI / 2) - (2 * a_))) + Math.sin(a_)));
        let dll = ((20 - t) * (1 / Math.sin((2 * a_))));
        let dl2 = ((20 - t) * (Math.tan(((Math.PI / 2) - a_)) + Math.sin(a_)));
        let dll2 = ((20 - t) * (1 / Math.sin(a_)));
        let tw = ((Math.floor(n / 2) * (40 + t + this.spacing)) + (l * Math.sin(a_)));
        let th = (h + (5 * t));
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo((2 * t));
        for (let i = 0; i < n; i += 1) {
            this.polyline(((0 * t) + 20), [90, (2 * t)], (2 * t), -a);
            if (i < n_edge) {
                this.polyline(((l - dl2) - (t * Math.sin(a_))), a, dll2, (180 - a), 20);
            }
            else {
                this.polyline(((l - dl) - (t * Math.sin(a_))), (2 * a), dll, (180 - (2 * a)), 20);
            }
            this.edges["f"].draw(30);
            this.polyline(0, -90, t, 90, (l - 50), a, t, -90);
            this.edges["f"].draw((4 * t));
            this.polyline(0, 90, (1 * t), [90, (2 * t)]);
            this.moveTo((t + 40 + this.spacing));
            if ((i + 1) === Math.floor(n / 2)) {
                this.moveTo(((2 * t) + (0.7 * this.spacing)), (h + (5 * t)), 180);
            }
            this.ctx.stroke();
        }
        this.move(tw, th, move, false, "Outer ribs");
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        this.y = y = this.adjustSize(y);
        let t = this.thickness;
        this.w = ((x - (2 * t)) / this.pockets);
        this.a = (Math.atan((((this.w - 100) / 2) / (h - (4 * t)))) * 180 / Math.PI);
        for (let i = 0; i < 2; i += 1) {
            this.rectangularWall(x, h, "eeee", {callback: [this.sideCB.bind(this)], move: "up"});
        }
        for (let i = 0; i < 2; i += 1) {
            this.rectangularWall(y, 50, "efef", {label: "Sides", move: "up"});
        }
        for (let i = 0; i < (this.pockets * 4); i += 1) {
            this.rectangularWall(y, 50, "efef", {callback: [this.topRailCB.bind(this)], label: "Top rails", move: "up"});
        }
        let w = (100 - (2 * t));
        for (let i = 0; i < this.pockets; i += 1) {
            this.rectangularWall(y, w, "efef", {callback: [this.bottomCB.bind(this), null, this.bottomCB.bind(this)], label: "bottom plate", move: "up"});
        }
        this.innerRibs(((this.pockets * this.ribs) * 2), {move: "up"});
        this.outerRibs(((this.pockets * this.ribs) * 2), (this.ribs * 2), {move: "up"});
        this.sideHolders((this.pockets * 8), {move: "up"});
        this.topStabilizers((Math.min(3, this.ribs) * this.pockets), {move: "up"});
    }

}

export { CarbonFilter };