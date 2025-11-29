const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class BirdHouse extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {finger: 10.0, space: 10.0});
        // this.buildArgParser();
        this.argparser.add_argument("--roof_overhang", {action: "store", type: "float", default: 0.4, help: "overhang as fraction of the roof length"});
    }

    side(x, h, edges, callback, move) {
        let angles = [90, 0, 45, 90, 45, 0, 90];
        let roof = (((2 ** 0.5) * x) / 2);
        let t = this.thickness;
        let lengths = [x, h, t, roof, roof, t, h];
        edges = /* unknown node ListComp */;
        edges.append(edges[0]);
        let tw = ((x + edges[1].spacing()) + edges[-2].spacing());
        let th = ((((h + (x / 2)) + t) + edges[0].spacing()) + Math.max(edges[3].spacing(), edges[4].spacing()));
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(edges[-2].spacing());
        for (let i = 0; i < 7; i += 1) {
            this.cc(callback, i, {y: (this.burn + edges[i].startwidth())});
            edges[i](lengths[i]);
            this.edgeCorner(edges[i], edges[(i + 1)], angles[i]);
        }
        this.move(tw, th, move);
    }

    roof(x, h, overhang, edges, move) {
        let t = this.thickness;
        edges = /* unknown node ListComp */;
        let tw = ((((x + (2 * t)) + (2 * overhang)) + edges[1].spacing()) + edges[3].spacing());
        let th = ((((h + (2 * t)) + overhang) + edges[0].spacing()) + edges[2].spacing());
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo((overhang + edges[3].spacing()), edges[0].margin());
        edges[0]((x + (2 * t)));
        this.corner(90, overhang);
        edges[1]((h + (2 * t)));
        this.edgeCorner(edges[1], edges[2]);
        this.fingerHolesAt((overhang + (0.5 * t)), edges[2].startwidth(), h, 90);
        this.fingerHolesAt(((x + overhang) + (1.5 * t)), edges[2].startwidth(), h, 90);
        edges[2](((x + (2 * t)) + (2 * overhang)));
        this.edgeCorner(edges[2], edges[3]);
        edges[3]((h + (2 * t)));
        this.corner(90, overhang);
        this.move(tw, th, move);
    }

    side_hole(width) {
        this.rectangularHole((width / 2), (this.h / 2), (0.75 * width), (0.75 * this.h), {r: this.thickness});
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let roof = (((2 ** 0.5) * x) / 2);
        let overhang = (roof * this.roof_overhang);
        let cbx = [() => this.side_hole(x)];
        let cby = [() => this.side_hole(y)];
        this.side(x, h, {callback: cbx, move: "right"});
        this.side(x, h, {callback: cbx, move: "right"});
        this.rectangularWall(y, h, "hFeF", {callback: cby, move: "right"});
        this.rectangularWall(y, h, "hFeF", {callback: cby, move: "right"});
        this.rectangularWall(x, y, "ffff", {move: "right"});
        this.edges["h"].settings.setValues(this.thickness, {relative: false, edge_width: overhang});
        this.roof(y, roof, overhang, "eefe", {move: "right"});
        this.roof(y, roof, overhang, "eeFe", {move: "right"});
    }

}

module.exports.BirdHouse = BirdHouse;