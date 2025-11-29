const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class CornerEdge extends Boxes {
    startwidth() {
        return (this.boxes.thickness * Math.tan(((90 - 22.5) * Math.PI / 180)));
    }

    __call__(length, bedBolts, bedBoltSettings) {
        this.ctx.save();
        this.ctx.stroke();
        this.set_source_color(Color.RED);
        this.moveTo(0, this.startwidth());
        this.edge(length);
        this.ctx.stroke();
        this.set_source_color(Color.BLACK);
        this.ctx.restore();
        super.__call__(length, {bedBolts: null, bedBoltSettings: null, None: kw});
    }

}

module.exports.CornerEdge = CornerEdge;
class TriangleLamp extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {finger: 3.0, space: 3.0, surroundingspaces: 0.5});
        // this.buildArgParser();
        this.argparser.add_argument("--cornersize", {action: "store", type: "float", default: 30, help: "short side of the corner triangles"});
        this.argparser.add_argument("--screenholesize", {action: "store", type: "float", default: 4, help: "diameter of the holes in the screen"});
        this.argparser.add_argument("--screwholesize", {action: "store", type: "float", default: 2, help: "diameter of the holes in the wood"});
        this.argparser.add_argument("--sharpcorners", {action: "store", type: boolarg, default: false, help: "extend walls for 45° corners. Requires grinding a 22.5° bevel."});
    }

    CB(l, size) {
        const f = () => {
            let t = this.thickness;
            this.fingerHolesAt(0, (this.h - (1.5 * t)), size, 0);
            this.fingerHolesAt(l, (this.h - (1.5 * t)), size, 180);
        };

        return f;
    }

    render() {
        let x;
        let h;
        [x, h] = [this.x, this.h];
        let l = (((x ** 2) + (x ** 2)) ** 0.5);
        let c = this.cornersize;
        let t = this.thickness;
        let r1 = (this.screwholesize / 2);
        let r2 = (this.screenholesize / 2);
        this.addPart(CornerEdge(this, null));
        this.rectangularTriangle(x, x, {num: 2, move: "up", callback: [() => this.hole(((2 / 3.0) * c), ((1 / 4.0) * c), r2), () => [this.hole(((1 / 3.0) * c), ((1 / 3.0) * c), r2), this.hole((x - ((2 / 3.0) * c)), ((1 / 4.0) * c), r2)]]});
        this.rectangularTriangle(x, x, "fff", {num: 2, move: "up"});
        let C = "e";
        if (this.sharpcorners) {
            C = "C";
        }
        this.rectangularWall(x, h, ("Ffe" + C), {callback: [this.CB(x, c)], move: "up"});
        this.rectangularWall(x, h, ("Ffe" + C), {callback: [this.CB(x, c)], move: "up"});
        this.rectangularWall(x, h, (("F" + C) + "eF"), {callback: [this.CB(x, c)], move: "up"});
        this.rectangularWall(x, h, (("F" + C) + "eF"), {callback: [this.CB(x, c)], move: "up"});
        this.rectangularWall(l, h, ((("F" + C) + "e") + C), {callback: [this.CB(l, (c * (2 ** 0.5)))], move: "up"});
        this.rectangularWall(l, h, ((("F" + C) + "e") + C), {callback: [this.CB(l, (c * (2 ** 0.5)))], move: "up"});
        this.rectangularTriangle(c, c, "ffe", {num: 2, move: "right", callback: [() => this.hole(((2 / 3.0) * c), ((1 / 3.0) * c), r1)]});
        this.rectangularTriangle(c, c, "fef", {num: 4, move: "up", callback: [() => this.hole(((2 / 3.0) * c), ((1 / 4.0) * c), r1)]});
    }

}

module.exports.TriangleLamp = TriangleLamp;