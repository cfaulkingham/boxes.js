import { Boxes  } from '../boxes.js';
import { FingerJointSettings, FingerHoleEdge, FingerJointEdge  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import '../globals.js';

const { isinstance } = global;

class DrillStand extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.StackableSettings, {height: 1.0, width: 3});
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--extra_height", {action: "store", type: "float", default: 15.0, help: "height difference left to right"});
    }

    yWall(nr, move) {
        let t = this.thickness;
        let x;
        let sx;
        let y;
        let sy;
        let sh;
        [x, sx, y, sy, sh] = [this.x, this.sx, this.y, this.sy, this.sh];
        let eh = ((this.extra_height * ((sx.slice(0, nr).reduce((a, b) => a + b, 0) + (nr * t)) - t)) / x);
        let tw;
        let th;
        [tw, th] = [((sy.reduce((a, b) => a + b, 0) + (t * sy.length)) + t), (Math.max(sh) + eh)];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(t);
        this.polyline(y, 90);
        this.edges["f"]((sh[-1] + eh));
        this.corner(90);
        for (let i = (sy.length - 1); i < 0; i += -1) {
            let s1 = (Math.max((sh[i] - sh[(i - 1)]), 0) + (4 * t));
            let s2 = (Math.max((sh[(i - 1)] - sh[i]), 0) + (4 * t));
            this.polyline(sy[i], 90, s1, -90, t, -90, s2, 90);
        }
        this.polyline(sy[0], 90);
        this.edges["f"]((sh[0] + eh));
        this.corner(90);
        this.move(tw, th, move);
    }

    sideWall(extra_height, foot_height, edges, move) {
        let t = this.thickness;
        let x;
        let sx;
        let y;
        let sy;
        let sh;
        [x, sx, y, sy, sh] = [this.x, this.sx, this.y, this.sy, this.sh];
        let eh = extra_height;
        let fh = foot_height;
        edges = edges.split('').map(e => this.edges[e] || e);
        let tw = ((sy.reduce((a, b) => a + b, 0) + (t * sy.length)) + t);
        let th = (((Math.max(sh) + eh) + fh) + edges[0].spacing());
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(edges[0].margin());
        edges[0]((y + (2 * t)));
        this.edgeCorner(edges[0], "e");
        this.edge(fh);
        this.step((edges[1].startwidth() - t));
        edges[1]((sh[-1] + eh));
        this.edgeCorner(edges[1], "e");
        for (let i = (sy.length - 1); i < 0; i += -1) {
            this.edge(sy[i]);
            if (sh[i] > sh[(i - 1)]) {
                this.fingerHolesAt((0.5 * t), this.burn, (sh[i] + eh), 90);
                this.polyline(t, 90, (sh[i] - sh[(i - 1)]), -90);
            }
            else {
                this.polyline(0, -90, (sh[(i - 1)] - sh[i]), 90, t);
                this.fingerHolesAt((-0.5 * t), this.burn, (sh[(i - 1)] + eh));
            }
        }
        this.polyline(sy[0]);
        this.edgeCorner("e", edges[2]);
        edges[2]((sh[0] + eh));
        this.step((t - edges[2].endwidth()));
        this.polyline(fh);
        this.edgeCorner("e", edges[0]);
        this.move(tw, th, move);
    }

    xWall(nr, move) {
        let t = this.thickness;
        let x;
        let sx;
        let y;
        let sy;
        let sh;
        [x, sx, y, sy, sh] = [this.x, this.sx, this.y, this.sy, this.sh];
        let eh = this.extra_height;
        let tw;
        let th;
        [tw, th] = [(x + (2 * t)), ((sh[nr] + eh) + t)];
        let a = (Math.tan((eh / x)) * 180 / Math.PI);
        let fa = (1 / Math.cos((a * Math.PI / 180)));
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(t, (eh + t), -a);
        for (let i = 0; i < (sx.length - 1); i += 1) {
            this.edges["f"]((fa * sx[i]));
            let h = Math.min(sh[(nr - 1)], sh[nr]);
            let s1 = ((h - (3.95 * t)) + ((this.extra_height * (sx.slice(0, (i + 1)).reduce((a, b) => a + b, 0) + (i * t))) / x));
            let s2 = ((h - (3.95 * t)) + ((this.extra_height * ((sx.slice(0, (i + 1)).reduce((a, b) => a + b, 0) + (i * t)) + t)) / x));
            this.polyline(0, (90 + a), s1, -90, t, -90, s2, (90 - a));
        }
        this.edges["f"]((fa * sx[-1]));
        this.polyline(0, (90 + a));
        this.edges["f"]((sh[nr] + eh));
        this.polyline(0, 90, x, 90);
        this.edges["f"](sh[nr]);
        this.polyline(0, (90 + a));
        this.move(tw, th, move);
    }

    xOutsideWall(h, edges, move) {
        let t = this.thickness;
        let x;
        let sx;
        let y;
        let sy;
        let sh;
        [x, sx, y, sy, sh] = [this.x, this.sx, this.y, this.sy, this.sh];
        edges = edges.split('').map(e => this.edges[e] || e);
        let eh = this.extra_height;
        let tw = ((x + edges[1].spacing()) + edges[3].spacing());
        let th = (((h + eh) + edges[0].spacing()) + edges[2].spacing());
        let a = (Math.tan((eh / x)) * 180 / Math.PI);
        let fa = (1 / Math.cos((a * Math.PI / 180)));
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(edges[3].spacing(), (eh + edges[0].margin()), -a);
        this.edge((t * Math.tan((a * Math.PI / 180))));
        if (isinstance(edges[0], FingerHoleEdge)) {
            this.ctx.save();
            this.moveTo(0, 0, a);
            this.fingerHolesAt(0, (1.5 * t), ((x * fa) - (t * Math.tan((a * Math.PI / 180)))), -a);
            this.ctx.restore();
            this.edge(((x * fa) - (t * Math.tan((a * Math.PI / 180)))));
        }
        else {
            if (isinstance(edges[0], FingerJointEdge)) {
                edges[0](((x * fa) - (t * Math.tan((a * Math.PI / 180)))));
            }
            else {
                ValueError("Only edges h and f supported: ")
            }
        }
        this.corner(a);
        this.edgeCorner(edges[0], "e", 90);
        this.corner(-90);
        this.edgeCorner("e", edges[1], 90);
        edges[1]((eh + h));
        this.edgeCorner(edges[1], edges[2], 90);
        edges[2](x);
        this.edgeCorner(edges[2], edges[3], 90);
        edges[3](h);
        this.edgeCorner(edges[3], "e", 90);
        this.corner(-90);
        this.edgeCorner("e", edges[0], 90);
        this.moveTo(0, (this.burn + edges[0].startwidth()), 0);
        for (let i = 1; i < sx.length; i += 1) {
            let posx = ((sx.slice(0, i).reduce((a, b) => a + b, 0) + (i * t)) - (0.5 * t));
            let length = (h + ((this.extra_height * ((sx.slice(0, i).reduce((a, b) => a + b, 0) + (i * t)) - t)) / x));
            this.fingerHolesAt(posx, h, length, -90);
        }
        this.move(tw, th, move);
    }

    bottomCB() {
        let t = this.thickness;
        let x;
        let sx;
        let y;
        let sy;
        let sh;
        [x, sx, y, sy, sh] = [this.x, this.sx, this.y, this.sy, this.sh];
        let eh = this.extra_height;
        let a = (Math.tan((eh / x)) * 180 / Math.PI);
        let fa = (1 / Math.cos((a * Math.PI / 180)));
        let posy = (-0.5 * t);
        for (let i = 0; i < (sy.length - 1); i += 1) {
            posy += (sy[i] + t);
            let posx = (-t * Math.tan((a * Math.PI / 180)));
            for (let j = 0; j < sx.length; j += 1) {
                this.fingerHolesAt(posx, posy, (fa * sx[j]), 0);
                posx += ((fa * sx[j]) + (fa * t));
            }
        }
    }

    render() {
        let t = this.thickness;
        let sx;
        let sy;
        let sh;
        [sx, sy, sh] = [this.sx, this.sy, this.sh];
        let x = this.x;
        let y = this.y;
        let bottom_angle = Math.tan((this.extra_height / x));
        this.xOutsideWall(sh[0], "hFeF", {move: "up"});
        for (let i = 1; i < sy.length; i += 1) {
            this.xWall(i, {move: "up"});
        }
        this.xOutsideWall(sh[-1], "hfef", {move: "up"});
        this.rectangularWall(((x / Math.cos(bottom_angle)) - (t * Math.tan(bottom_angle))), y, "fefe", {callback: [this.bottomCB], move: "up"});
        this.sideWall({foot_height: (this.extra_height + (2 * t)), move: "right"});
        for (let i = 1; i < sx.length; i += 1) {
            this.yWall(i, {move: "right"});
        }
        this.sideWall(this.extra_height, (2 * t), {move: "right"});
    }

}

export { DrillStand };