import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { _WallMountedBox  } from '../walledges.js';

class WallRollHolder extends _WallMountedBox {
    constructor() {
        super();
        this.argparser.add_argument("--width", {action: "store", type: "float", default: 275, help: "length of the axle in mm"});
        this.argparser.add_argument("--diameter", {action: "store", type: "float", default: 120, help: "maximum diameter of the roll in mm (choose generously)"});
        this.argparser.add_argument("--height", {action: "store", type: "float", default: 80, help: "height of mounting plate in mm"});
        this.argparser.add_argument("--axle", {action: "store", type: "float", default: 25, help: "diameter of the axle in mm including play"});
    }

    side(move) {
        let d = this.diameter;
        let a = this.axle;
        let h = this.height;
        let t = this.thickness;
        let tw;
        let th;
        [tw, th] = [h, ((((d + a) / 2) + (3 * t)) + this.edges["B"].spacing())];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(0, this.edges["B"].margin());
        this.edges["B"](h);
        this.fingerHolesAt(-((a / 2) + (3 * t)), (this.burn + this.edges["B"].endwidth()), (d / 2), 90);
        this.polyline(0, 90, (this.edges["B"].endwidth() + (d / 2)), [90, ((a / 2) + (3 * t))]);
        let r = ((a / 2) + (3 * t));
        a = Math.atan2(float((d / 2)), ((h - a) - (6 * t)));
        let alpha = (a * 180 / Math.PI);
        this.corner(alpha, r);
        this.edge(((((h - (2 * r)) ** 2) + ((d / 2) ** 2)) ** 0.5));
        this.corner((90 - alpha), r);
        this.edge(this.edges["B"].startwidth());
        this.corner(90);
        this.move(tw, th, move);
    }

    backCB() {
        let t = this.thickness;
        let a = this.axle;
        let h = this.height;
        let w = this.width;
        let plate = ((w + (2 * t)) + (h / 2));
        this.wallHolesAt((((h / 4) + (t / 2)) - (3 * t)), 0, h, 90);
        this.fingerHolesAt(((h / 4) - (3 * t)), ((h - (3 * t)) - (a / 2)), (h / 4), 180);
        this.wallHolesAt((((((h / 4) + (t / 2)) + t) - (3 * t)) + w), 0, h, 90);
        this.fingerHolesAt(((((h / 4) + (2 * t)) - (3 * t)) + w), ((h - (3 * t)) - (a / 2)), (h / 4), 0);
    }

    rings() {
        let a = this.axle;
        let r = (a / 2);
        let t = this.thickness;
        this.moveTo(0, (a + (1.5 * t)), -90);
        for (let i = 0; i < 2; i += 1) {
            this.polyline((r - (1.5 * t)), [180, (r + (3 * t))], 0, [180, (1.5 * t)], 0, [-180, r], (r - (1.5 * t)), [180, (1.5 * t)]);
            this.moveTo((a - t), (a + (12 * t)), 180);
        }
    }

    render() {
        this.generateWallEdges();
        let t = this.thickness;
        let w = this.width;
        let d = this.diameter;
        let a = this.axle;
        let h = this.height;
        this.side({move: "right"});
        this.side({move: "right"});
        this.rectangularTriangle((h / 4), (d / 2), "ffe", {num: 2, r: (3 * t), move: "right"});
        this.roundedPlate(((w + (h / 2)) + (2 * t)), h, {edge: "e", r: (3 * t), extend_corners: false, callback: [this.backCB], move: "right"});
        this.rings();
    }

}

export { WallRollHolder };