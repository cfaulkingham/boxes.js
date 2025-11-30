import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class UBox extends _TopEdge {
    constructor() {
        super();
        this.addTopEdgeSettings();
        this.addSettingsArgs(edges.FlexSettings);
        this.addSettingsArgs(LidSettings);
        // this.buildArgParser("top_edge", "x", "y", "h");
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 30.0, help: "radius of bottom corners"});
        this.angle = 0;
    }

    U(x, y, r, edge, move, label) {
        let e = this.edges.get(edge, edge);
        let w = this.edges["f"].spacing();
        let tw = (x + (2 * w));
        let th = ((y + w) + e.spacing());
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo((w + r), w);
        this.edges["f"]((x - (2 * r)));
        this.corner(90, r);
        this.edges["f"]((y - r));
        this.edgeCorner("f", e);
        e(x);
        this.edgeCorner(e, "f");
        this.edges["f"]((y - r));
        this.corner(90, r);
        this.move(tw, th, move, {label: label});
    }

    Uwall(x, y, h, r, edges, move, label) {
        let e = /* unknown node ListComp */;
        let w = this.edges["F"].spacing();
        let cl = ((r * Math.PI) / 2);
        let tw = (((((2 * y) + x) - (4 * (cl - r))) + e[0].spacing()) + e[1].spacing());
        let th = (h + (2 * w));
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(e[0].spacing());
        for (let [nr, flex] of enumerate("XE")) {
            this.edges["F"]((y - r));
            if ((x - (2 * r)) > (0.1 * this.thickness)) {
                this.edges[flex](cl, {h: th});
                this.edges["F"]((x - (2 * r)));
                this.edges[flex](cl, {h: th});
            }
            else {
                this.edges[flex]((((2 * cl) + x) - (2 * r)), {h: th});
            }
            this.edges["F"]((y - r));
            if ([this.edges["i"], this.edges["k"]].includes(edges[0])) {
                this.edgeCorner("e", e[nr]);
                e[nr](((h + this.edges["F"].startwidth()) + this.edges["F"].endwidth()));
                this.edgeCorner(e[nr], "e");
            }
            else {
                this.edgeCorner("F", e[nr]);
                e[nr](h);
                this.edgeCorner(e[nr], "F");
            }
        }
        this.move(tw, th, move, {label: label});
    }

    render() {
        let x;
        let y;
        let h;
        let r;
        [x, y, h, r] = [this.x, this.y, this.h, this.radius];
        this.edges["i"].settings.style = "flush_inset";
        let _ = this.translations.gettext;
        let t1;
        let t2;
        let t3;
        let t4;
        [t1, t2, t3, t4] = this.topEdges(this.top_edge);
        this.U(x, y, r, t1, {move: "right", label: _("left")});
        this.U(x, y, r, t3, {move: "up", label: _("right")});
        this.U(x, y, r, t3, {move: "left only"});
        this.Uwall(x, y, h, r, [t2, t4], {move: "up", label: _("wall")});
        this.drawLid(h, x, this.top_edge);
        this.lid(x, h, this.top_edge);
    }

}

export { UBox };