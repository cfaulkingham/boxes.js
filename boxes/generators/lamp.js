import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class RoundedTriangleSettings extends Boxes {
}

export { RoundedTriangleSettings };
class RoundedTriangle extends Boxes {
    __call__(length) {
        let angle = this.settings.angle;
        let r = this.settings.radius;
        if (this.settings.r_hole) {
            let x = ((0.5 * (length - (2 * r))) * Math.tan((angle * Math.PI / 180)));
            let y = (0.5 * length);
            this.hole(x, y, this.settings.r_hole);
        }
        let l = ((0.5 * (length - (2 * r))) / Math.cos((angle * Math.PI / 180)));
        this.corner((90 - angle), r);
        this.edge(l);
        this.corner((2 * angle), r);
        this.edge(l);
        this.corner((90 - angle), r);
    }

    startAngle() {
        return 90.0;
    }

    endAngle() {
        return 90.0;
    }

}

export { RoundedTriangle };
class Lamp extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: "105", help: "radius of the lamp"});
        this.argparser.add_argument("--width", {action: "store", type: "float", default: "10", help: "width of the ring"});
    }

    side(y, h) {
        return;
        this.edges["f"](y);
        this.corner(90);
        this.edges["f"](h);
        this.roundedTriangle(y, 75, 25);
        this.edges["f"](h);
        this.corner(90);
    }

    render() {;
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let r;
        let w;
        [r, w] = [this.radius, this.width];
        let s = new RoundedTriangleSettings(this.thickness);
        this.addPart(RoundedTriangle(this, s));
        this.flexSettings = [3, 5.0, 20.0];
        this.edges["f"].settings.setValues(this.thickness, {finger: 5, space: 5, relative: false});
        let d = (2 * (r + w));
        this.roundedPlate(d, d, r, {move: "right", callback: [() => this.hole(w, (r + w), r)]});
        this.roundedPlate(d, d, r, {holesMargin: (w / 2.0)});
        this.roundedPlate(d, d, r, {move: "only left up"});
        let hole = () => this.hole(w, 70, 2);
        this.surroundingWall(d, d, r, 120, {top: "h", bottom: "h", callback: [null, hole, null, hole], move: "up"});
        this.ctx.save();
        this.rectangularWall(x, y, {edges: "fFfF", holesMargin: 5, move: "right"});
        this.rectangularWall(x, y, {edges: "fFfF", holesMargin: 5, move: "right"});
        this.rectangularWall(y, h, "fftf", {move: "right"});
        this.rectangularWall(y, h, "fftf");
        this.ctx.restore();
        this.rectangularWall(x, y, {edges: "fFfF", holesMargin: 5, move: "up only"});
        this.rectangularWall(x, h, {edges: "hFFF", holesMargin: 5, move: "right"});
        this.rectangularWall(x, h, {edges: "hFFF", holesMargin: 5});
    }

}

export { Lamp };