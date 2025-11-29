const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class PirateChest extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {finger: 1.0, space: 1.0});
        this.addSettingsArgs(edges.HingeSettings);
        // this.buildArgParser("x", "y", "h", "outside");
        this.argparser.add_argument("--n", {action: "store", type: "int", default: 5, help: "number of sides on the lid. n ≥ 3"});
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        if (this.outside) {
            x = this.adjustSize(x);
            y = this.adjustSize(y);
            h = this.adjustSize(h, "f", false);
        }
        let t = this.thickness;
        let n = this.n;
        if (n < 3) {
            ValueError(("number of sides on the lid must be greater or equal to 3 (got %i)" % n))
        }
        let hy = this.edges["O"].startwidth();
        h -= hy;
        if (h < 0) {
            ValueError(("box to low to allow for hinge (%i)" % h))
        }
        let fingerJointSettings = this.edges["f"].settings;
        fingerJointSettings.setValues(this.thickness, {angle: (180.0 / (n - 1))});
        fingerJointSettings.edgeObjects(this, {chars: "gGH"});
        this.ctx.save();
        this.rectangularWall(x, y, "FFFF", {move: "up", label: "Bottom"});
        let frontlid;
        let toplids;
        let backlid;
        [frontlid, toplids, backlid] = this.topside(y);
        this.rectangularWall(x, backlid, "qFgF", {move: "up", label: "lid back"});
        for (let _ = 0; _ < (n - 2); _ += 1) {
            this.rectangularWall(x, toplids, "GFgF", {move: "up", label: "lid top"});
        }
        this.rectangularWall(x, frontlid, "GFeF", {move: "up", label: "lid front"});
        this.ctx.restore();
        this.rectangularWall(x, y, "FFFF", {move: "right only"});
        this.ctx.save();
        this.rectangularWall(x, h, "fFQF", {ignore_widths: [2, 5], move: "right", label: "front"});
        this.rectangularWall(y, h, "ffof", {ignore_widths: [5], move: "right", label: "right"});
        this.rectangularWall(0, h, "eeep", {move: "right only"});
        this.ctx.restore();
        this.rectangularWall(x, h, "fFoF", {move: "up only"});
        this.rectangularWall(x, 0, "Peee", {move: "up only"});
        let e1 = edges.CompoundEdge(this, "Fe", [h, hy]);
        let e2 = edges.CompoundEdge(this, "eF", [hy, h]);
        let e_back = ["f", e1, "e", e2];
        this.ctx.save();
        this.rectangularWall(x, (h + hy), e_back, {move: "right", label: "back"});
        this.rectangularWall(0, h, "ePee", {move: "right only"});
        this.rectangularWall(y, h, "ffOf", {ignore_widths: [2], move: "right", label: "left"});
        this.ctx.restore();
        this.rectangularWall(x, h, "fFOF", {move: "up only"});
        this.rectangularWall(x, 0, "peee", {move: "up only"});
        this.topside(y, {n: n, move: "right", bottom: "p", label: "lid left"});
        this.topside(y, {n: n, move: "right", bottom: "P", label: "lid right"});
    }

    topside(y, n, bottom, move, label) {
        let radius;
        let hp;
        let side;
        [radius, hp, side] = this.regularPolygon(((n - 1) * 2));
        let tx = (y + (2 * this.edges.get.spacing()));
        let lidheight = ((n % 2) ? hp : radius);
        let ty = ((lidheight + this.edges.get.spacing()) + this.edges.get.spacing());
        if (this.move(tx, ty, move)) {
            return [((side / 2) + this.edges.get.spacing()), side, (side / 2)];
        }
        this.moveTo(this.edges.get.margin(), this.edges.get.margin());
        this.edges.get(y);
        this.corner(90);
        if (bottom === "p") {
            this.edges.get(((side / 2) + this.edges.get.spacing()));
        }
        else {
            this.edges.get((side / 2));
        }
        this.corner((180 / (n - 1)));
        for (let _ = 0; _ < (n - 2); _ += 1) {
            this.edges.get(side);
            this.corner((180 / (n - 1)));
        }
        if (bottom === "P") {
            this.edges.get(((side / 2) + this.edges.get.spacing()));
        }
        else {
            this.edges.get((side / 2));
        }
        this.corner(90);
        this.move(tx, ty, move, {label: label});
        return [((side / 2) + this.edges.get.spacing()), side, (side / 2)];
    }

}

module.exports.PirateChest = PirateChest;