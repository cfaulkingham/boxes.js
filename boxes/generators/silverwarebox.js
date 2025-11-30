import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Silverware extends Boxes {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--cornerradius", {action: "store", type: "int", default: 30, help: "Radius of the corners"});
        this.argparser.add_argument("--handleheight", {action: "store", type: "int", default: 150, help: "Height of the handle"});
        this.argparser.add_argument("--handlewidth", {action: "store", type: "int", default: 120, help: "Width of the handle"});
    }

    basePlate(x, y, r) {
        this.roundedPlate(x, y, r, {extend_corners: false, callback: [() => this.fingerHolesAt(((x / 3.0) - r), 0, (0.5 * (y - this.thickness))), () => this.fingerHolesAt((x / 6.0), 0, (0.5 * (y - this.thickness))), () => this.fingerHolesAt(((y / 2.0) - r), 0, x), () => this.fingerHolesAt(((x / 2.0) - r), 0, (0.5 * (y - this.thickness)))]});
    }

    wall(x, y, h, r) {
        this.surroundingWall(x, y, r, h, {top: "E", bottom: "h", callback: /* unknown node Dict */, move: "up"});
    }

    centerWall(x, h) {
        this.moveTo(this.edges["f"].spacing(), this.edges["f"].spacing());
        for (let i = 2; i < 5; i += 1) {
            this.fingerHolesAt(((i * x) / 6.0), 0, (h - 10));
        }
        this.edges["f"](x);
        this.corner(90);
        this.edges["f"]((h - 10));
        this.corner(90);
        this.handle(x, this.handleheight, this.handlewidth);
        this.corner(90);
        this.edges["f"]((h - 10));
        this.corner(90);
        this.ctx.stroke();
    }

    render() {
        let x = this.x;
        let y = this.y;
        let h = this.h;
        let r = this.cornerradius;
        let t = this.thickness;
        let b = this.burn;
        this.wall(x, y, h, r);
        this.centerWall(x, h);
        this.moveTo((x + (2 * this.edges["f"].spacing())));
        let l = ((y - t) / 2.0);
        for (let _ = 0; _ < 3; _ += 1) {
            this.rectangularWall(l, (h - 10), {edges: "ffef", move: "right"});
        }
        this.moveTo((-3.0 * ((l + (2 * t)) + (8 * b))), (((h - 10) + (2 * t)) + (8 * b)));
        this.basePlate(x, y, r);
    }

}

export { Silverware };