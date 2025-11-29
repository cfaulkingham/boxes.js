const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class SlotEdge extends Boxes {
    __call__(length) {
        let t;
        let n;
        [t, n] = [this.settings.thickness, this.settings.n];
        let r;
        let h;
        [r, h] = [this.settings.radius, this.settings.h];
        let sh = this.settings.sh;
        let li = ((2 * sh) * Math.tan(((90 / n) * Math.PI / 180)));
        let ls2 = (t / Math.tan(((180 / n) * Math.PI / 180)));
        let ls1 = (t / Math.cos(((90 - (180 / n)) * Math.PI / 180)));
        let lo = (((length - li) - (2 * ls1)) / 2);
        li = (li - (2 * ls2));
        let d = (h / 2);
        if (li > 0) {
            let poly = [(lo - 1), [90, 1], ((d + t) - 1), -90, (ls1 + ls2), -90, (d - t), [90, t]];
            this.polyline(...((poly + [(li - (2 * t))]) + list(reversed(poly))));
        }
        else {
            ValueError("Box is too small and has too many corners to work properly")
        }
    }

    startwidth() {
        return this.settings.thickness;
    }

}

module.exports.SlotEdge = SlotEdge;
class RegularStarBox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser("h", "outside");
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: 50.0, help: "inner radius if the box (center to corners)"});
        this.argparser.add_argument("--n", {action: "store", type: "int", default: 5, choices: [3, 4, 5], help: "number of sides"});
    }

    render() {
        let r;
        let h;
        let n;
        [r, h, n] = [this.radius, this.h, this.n];
        if (this.outside) {
        }
        let t = this.thickness;
        let fingerJointSettings = this.edges["f"].settings;
        fingerJointSettings.setValues(this.thickness, {angle: (360.0 / n)});
        fingerJointSettings.edgeObjects(this, {chars: "gGH"});
        let sh;
        let side;
        [r, sh, side] = this.regularPolygon(n);
        this.sh = sh;
        this.ctx.save();
        this.regularPolygonWall({corners: n, r: r, edges: "F", move: "right"});
        this.regularPolygonWall({corners: n, r: r, edges: "F", move: "right"});
        this.ctx.restore();
        this.regularPolygonWall({corners: n, r: r, edges: "F", move: "up only"});
        for (let s = 0; s < 2; s += 1) {
            this.ctx.save();
            if ((n % 2)) {
                for (let i = 0; i < n; i += 1) {
                    this.rectangularWall(side, h, {move: "right", edges: "fgeG"});
                }
            }
            else {
                for (let i = 0; i < Math.floor(n / 2); i += 1) {
                    this.rectangularWall(side, h, {move: "right", edges: "fGeG"});
                    this.rectangularWall(side, h, {move: "right", edges: "fgeg"});
                }
            }
            this.ctx.restore();
            this.rectangularWall(side, h, {move: "up only", edges: "fgeG"});
        }
    }

}

module.exports.RegularStarBox = RegularStarBox;