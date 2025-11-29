const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class UnevenHeightBox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.GroovedSettings);
        // this.buildArgParser("x", "y", "outside");
        this.argparser.add_argument("--height0", {action: "store", type: "float", default: 50, help: "height of the front left corner in mm"});
        this.argparser.add_argument("--height1", {action: "store", type: "float", default: 50, help: "height of the front right corner in mm"});
        this.argparser.add_argument("--height2", {action: "store", type: "float", default: 100, help: "height of the right back corner in mm"});
        this.argparser.add_argument("--height3", {action: "store", type: "float", default: 100, help: "height of the left back corner in mm"});
        this.argparser.add_argument("--add_lid", {action: "store", type: boolarg, default: true, help: "add a lid (works best with high corners opposing each other)"});
        this.argparser.add_argument("--lid_height", {action: "store", type: "float", default: 0, help: "additional height of the lid"});
        this.argparser.add_argument("--edge_types", {action: "store", type: "str", default: "eeee", help: "which edges are flat (e) or grooved (z,Z), counter-clockwise from the front"});
    }

    render() {
        let x;
        let y;
        [x, y] = [this.x, this.y];
        let heights = [this.height0, this.height1, this.height2, this.height3];
        let edge_types = this.edge_types;
        if ((edge_types.length !== 4 || any(/* unknown node GeneratorExp */))) {
            ValueError(("Wrong edge_types style: %s)" % edge_types))
        }
        if (this.outside) {
            x = this.adjustSize(x);
            y = this.adjustSize(y);
            for (let i = 0; i < 4; i += 1) {
            }
        }
        let t = this.thickness;
        let h0;
        let h1;
        let h2;
        let h3;
        [h0, h1, h2, h3] = heights;
        let b = this.bottom_edge;
        this.trapezoidWall(x, h0, h1, [b, "F", edge_types[0], "F"], {move: "right"});
        this.trapezoidWall(y, h1, h2, [b, "f", edge_types[1], "f"], {move: "right"});
        this.trapezoidWall(x, h2, h3, [b, "F", edge_types[2], "F"], {move: "right"});
        this.trapezoidWall(y, h3, h0, [b, "f", edge_types[3], "f"], {move: "right"});
        this.ctx.save();
        if (b !== "e") {
            this.rectangularWall(x, y, "ffff", {move: "up"});
        }
        if (this.add_lid) {
            let maxh = Math.max(heights);
            let lidheights = /* unknown node ListComp */;
            [h0, h1, h2, h3] = lidheights;
            lidheights += lidheights;
            let edges = /* unknown node ListComp */;
            this.rectangularWall(x, y, edges, {move: "up"});
        }
        this.ctx.restore();
        if (this.add_lid) {
            this.moveTo(0, ((((maxh + this.lid_height) + this.edges["F"].spacing()) + this.edges[b].spacing()) + (1 * this.spacing)), 180);
            let edge_inverse = /* unknown node Dict */;
            edge_types = /* unknown node ListComp */;
            this.trapezoidWall(y, h0, h3, (("Ff" + edge_types[3]) + "f"), {move: ("right" + (/* unknown node Compare */ ? " only" : ""))});
            this.trapezoidWall(x, h3, h2, (("FF" + edge_types[2]) + "F"), {move: ("right" + (/* unknown node Compare */ ? " only" : ""))});
            this.trapezoidWall(y, h2, h1, (("Ff" + edge_types[1]) + "f"), {move: ("right" + (/* unknown node Compare */ ? " only" : ""))});
            this.trapezoidWall(x, h1, h0, (("FF" + edge_types[0]) + "F"), {move: ("right" + (/* unknown node Compare */ ? " only" : ""))});
        }
    }

}

module.exports.UnevenHeightBox = UnevenHeightBox;