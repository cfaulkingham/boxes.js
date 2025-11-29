const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');
const { Bolts } = require('../edges');

class UniversalBox extends _TopEdge {
    constructor() {
        super();
        this.addTopEdgeSettings({roundedtriangle: /* unknown node Dict */, hinge: /* unknown node Dict */});
        this.addSettingsArgs(edges.FlexSettings);
        this.addSettingsArgs(lids.LidSettings);
        // this.buildArgParser("top_edge", "bottom_edge", "x", "y", "h", "outside");
        this.argparser.add_argument("--vertical_edges", {action: "store", type: "str", default: "finger joints", choices: ["finger joints", "finger holes"], help: "connections used for the vertical edges"});
    }

    top_hole(x, y, top_edge) {
        let t = this.thickness;
        if (top_edge === "f") {
            let edge = this.edges["F"];
            this.moveTo(((2 * t) + this.burn), (2 * t), 90);
        }
        else {
            if (top_edge === "F") {
                edge = this.edges["f"];
                this.moveTo((t + this.burn), (2 * t), 90);
            }
            else {
                ValueError("Only f and F supported")
            }
        }
        for (let l of [y, x, y, x]) {
            edge(l);
            if (top_edge === "F") {
                this.edge(t);
            }
            this.corner(-90);
            if (top_edge === "F") {
                this.edge(t);
            }
        }
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let t = this.thickness;
        let tl;
        let tb;
        let tr;
        let tf;
        [tl, tb, tr, tf] = this.topEdges(this.top_edge);
        let b = this.edges.get(this.bottom_edge, this.edges["F"]);
        let d2 = Bolts(2);
        let d3 = Bolts(3);
        let sideedge = (this.vertical_edges === "finger joints" ? "F" : "h");
        if (this.outside) {
        }
        let ignore_widths = [1, 6];
        if ("ik".includes(this.top_edge)) {
            this.edges[this.top_edge].settings.style = "flush_inset";
            ignore_widths = [1, 3, 4, 6];
        }
        this.ctx.save();
        this.rectangularWall(x, h, [b, sideedge, tf, sideedge], {ignore_widths: ignore_widths, bedBolts: [d2], move: "up", label: "front"});
        this.rectangularWall(x, h, [b, sideedge, tb, sideedge], {ignore_widths: ignore_widths, bedBolts: [d2], move: "up", label: "back"});
        if (this.bottom_edge !== "e") {
            this.rectangularWall(x, y, "ffff", {bedBolts: [d2, d3, d2, d3], move: "up", label: "bottom"});
        }
        if ("fF".includes(this.top_edge)) {
            this.set_source_color(Color.MAGENTA);
            this.rectangularWall((x + (4 * t)), (y + (4 * t)), {callback: [() => this.top_hole(x, y, this.top_edge)], move: "up", label: "top hole"});
            this.set_source_color(Color.BLACK);
        }
        this.drawLid(x, y, this.top_edge, [d2, d3]);
        this.lid(x, y, this.top_edge);
        this.ctx.restore();
        this.rectangularWall(x, h, [b, sideedge, tf, sideedge], {ignore_widths: ignore_widths, bedBolts: [d2], move: "right only", label: "invisible"});
        this.rectangularWall(y, h, [b, "f", tl, "f"], {ignore_widths: ignore_widths, bedBolts: [d3], move: "up", label: "left"});
        this.rectangularWall(y, h, [b, "f", tr, "f"], {ignore_widths: ignore_widths, bedBolts: [d3], move: "up", label: "right"});
    }

}

module.exports.UniversalBox = UniversalBox;