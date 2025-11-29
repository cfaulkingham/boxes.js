const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class StorageRack extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.StackableSettings);
        this.argparser.add_argument("--depth", {action: "store", type: "float", default: 200, help: "depth of the rack"});
        this.argparser.add_argument("--rail", {action: "store", type: "float", default: 30, help: "depth of the rack"});
        // this.buildArgParser("x", "sh", "outside", "bottom_edge");
        this.argparser.add_argument("--top_edge", {action: "store", type: ArgparseEdgeType("FheSŠ"), choices: list("FheSŠ"), default: "F", help: "edge type for top edge"});
    }

    hHoles() {
        let posh = (-0.5 * this.thickness);
        for (let h of this.sh.slice(0, -1)) {
            posh += (h + this.thickness);
            this.fingerHolesAt(posh, 0, this.depth);
        }
    }

    backHoles() {
        let posh = (-0.5 * this.thickness);
        for (let [nr, h] of enumerate(this.sh.slice(0, -1))) {
            posh += (h + this.thickness);
            if (((this.bottom_edge === "e" && nr === 0) || (this.top_edge === "e" && nr === (this.sh.length - 2)))) {
                this.fingerHolesAt(0, posh, this.x, 0);
            }
            else {
                this.fingerHolesAt(0, posh, this.rail, 0);
                this.fingerHolesAt(this.x, posh, this.rail, 180);
            }
        }
    }

    render() {
        if (this.outside) {
            this.depth = this.adjustSize(this.depth);
            this.sh = this.adjustSize(this.sh, this.top_edge, this.bottom_edge);
            this.x = this.adjustSize(this.x);
        }
        let h = (this.sh.reduce((a, b) => a + b, 0) + (this.thickness * (this.sh.length - 1)));
        let x = this.x;
        let d = this.depth;
        let t = this.thickness;
        let b = this.bottom_edge;
        t = this.top_edge;
        this.closedtop = "fFhŠ".includes(this.top_edge);
        this.ctx.save();
        this.rectangularWall(d, h, [b, "F", t, "E"], {callback: [null, this.hHoles], move: "up"});
        this.rectangularWall(d, h, [b, "E", t, "F"], {callback: [null, this.hHoles], move: "up"});
        this.rectangularWall(d, x, "fffE", {move: "up"});
        this.rectangularWall(d, x, "fffE", {move: "up"});
        let num = (this.sh.length - 1);
        if (b === "e") {
            num -= 1;
        }
        if (t === "e") {
            num -= 1;
        }
        for (let i = 0; i < num; i += 1) {
            this.rectangularWall(d, this.rail, "ffee", {move: "up"});
            this.rectangularWall(d, this.rail, "feef", {move: "up"});
        }
        this.ctx.restore();
        this.rectangularWall(d, h, "ffff", {move: "right only"});
        this.rectangularWall(x, h, [b, "f", t, "f"], {callback: [this.backHoles], move: "up"});
    }

}

module.exports.StorageRack = StorageRack;