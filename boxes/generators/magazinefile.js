const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class MagazineFile extends Boxes {
    constructor() {
        super();
        // this.buildArgParser();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.MountingSettings, {margin: 0, num: 1});
        this.argparser.add_argument("--top_edge", {action: "store", type: ArgparseEdgeType("eG"), choices: list("eG"), default: "e", help: "edge type for top edge"});
    }

    side(w, h, hi, top_edge) {
        let r = (Math.min((h - hi), w) / 2.0);
        if ((h - hi) > w) {
            r = (w / 2.0);
            let lx = 0;
            let ly = ((h - hi) - w);
        }
        else {
            r = ((h - hi) / 2.0);
            lx = ((w - (2 * r)) / 2.0);
            ly = 0;
        }
        top_edge = this.edges.get(top_edge, top_edge);
        let e_w = this.edges["F"].startwidth();
        this.moveTo(3, 3);
        this.edge(e_w);
        this.edges["F"](w);
        this.edge(e_w);
        this.corner(90);
        this.edge(e_w);
        this.edges["F"](hi);
        this.corner(90);
        this.edge(e_w);
        top_edge(lx);
        this.corner(-90, r);
        this.edge(ly);
        this.corner(90, r);
        top_edge(lx);
        this.edge(e_w);
        this.corner(90);
        this.edges["F"](h);
        this.edge(e_w);
        this.corner(90);
    }

    render() {
        if (this.outside) {
            this.x = this.adjustSize(this.x);
            this.y = this.adjustSize(this.y);
            this.h = this.adjustSize(this.h);
        }
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let t = this.thickness;
        let t1;
        let t2;
        let t3;
        let t4;
        [t1, t2, t3, t4] = _TopEdge.topEdges(this, this.top_edge);
        this.ctx.save();
        this.rectangularWall(x, h, ["F", "f", t2, "f"], {move: "up"});
        this.rectangularWall(x, hi, "Ffef", {move: "up"});
        this.rectangularWall(x, y, "ffff");
        this.ctx.restore();
        this.rectangularWall(x, h, "Ffef", {move: "right only"});
        this.side(y, h, hi, t1);
        this.moveTo((y + 15), ((h + hi) + 15), 180);
        this.side(y, h, hi, t3);
    }

}

module.exports.MagazineFile = MagazineFile;