const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class GridfinityDrillBox extends _TopEdge {
    constructor() {
        super();
        this.pitch = 42.0;
        this.opening = 38;
        this.opening_margin = 2;
        this.addSettingsArgs(edges.FingerJointSettings, {space: 3, finger: 3, surroundingspaces: 1});
        this.addSettingsArgs(edges.RoundedTriangleEdgeSettings, {outset: 1});
        this.addSettingsArgs(edges.StackableSettings);
        this.addSettingsArgs(edges.MountingSettings);
        this.addSettingsArgs(LidSettings);
        this.argparser.add_argument("--nx", {type: "int", default: 3, help: "number of gridfinity grids in X direction"});
        this.argparser.add_argument("--ny", {type: "int", default: 2, help: "number of gridfinity grids in Y direction"});
        this.argparser.add_argument("--margin", {type: "float", default: 0.75, help: "Leave this much total margin on the outside, in mm"});
        this.argparser.add_argument("--top_edge", {action: "store", type: ArgparseEdgeType("eStG"), choices: list("eStG"), default: "e", help: "edge type for top edge"});
        // this.buildArgParser();
    }

    sideholes(l) {
        let t = this.thickness;
        let h = (-0.5 * t);
        for (let d of this.sh.slice(0, -1)) {
            h += (d + t);
            this.fingerHolesAt(0, h, l, {angle: 0});
        }
    }

    render() {
        let h = (this.sh.reduce((a, b) => a + b, 0) + (this.thickness * (this.sh.length - 1)));
        let b = "F";
        let t1;
        let t2;
        let t3;
        let t4;
        [t1, t2, t3, t4] = this.topEdges(this.top_edge);
        this.rectangularWall(x, h, [b, "f", t1, "f"], {ignore_widths: [1, 6], callback: [() => this.sideholes(x)], move: "right"});
        this.rectangularWall(y, h, [b, "F", t2, "F"], {callback: [() => this.sideholes(y)], ignore_widths: [1, 6], move: "up"});
        this.rectangularWall(y, h, [b, "F", t3, "F"], {callback: [() => this.sideholes(y)], ignore_widths: [1, 6]});
        this.rectangularWall(x, h, [b, "f", t4, "f"], {ignore_widths: [1, 6], callback: [() => this.sideholes(x)], move: "left up"});
        if (b !== "e") {
            this.rectangularWall(x, y, "ffff", {callback: [this.baseplate_etching], move: "right"});
        }
        for (let d of this.sh.slice(0, -1)) {
            this.rectangularWall(x, y, "ffff", {move: "right"});
        }
        this.lid(x, y, this.top_edge);
        let foot = (this.opening - this.opening_margin);
        for (let i = 0; i < Math.min((this.nx * this.ny), 4); i += 1) {
            this.rectangularWall(foot, foot, {move: "right"});
        }
    }

}

module.exports.GridfinityDrillBox = GridfinityDrillBox;