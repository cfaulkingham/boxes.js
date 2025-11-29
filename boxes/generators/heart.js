const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class HeartBox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {finger: 1.0, space: 1.0});
        this.addSettingsArgs(edges.FlexSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--top", {action: "store", type: "str", default: "closed", choices: ["closed", "hole", "lid"], help: "style of the top and lid"});
    }

    CB() {
        let x = this.x;
        let t = this.thickness;
        let l = (((2 / 3.0) * x) - t);
        let r = ((l / 2.0) - t);
        let d = (2 * t);
        if (this.top === "closed") {
            return;
        }
        for (let i = 0; i < 2; i += 1) {
            this.moveTo(t, t);
            this.polyline([l, 2], [180, r], [d, 1], -90, [d, 1], [180, r], [l, 2], 90);
            l -= t;
            r -= t;
            d += t;
            if (this.top === "hole") {
                return;
            }
        }
    }

    render() {
        let x;
        let h;
        [x, h] = [this.x, this.h];
        let t = this.thickness;
        let l = ((2 / 3.0) * x);
        let r = ((l / 2.0) - (0.5 * t));
        let borders = [l, [180, r], t, -90, t, [180, r], l, 90];
        this.polygonWalls(borders, h);
        this.rectangularWall(0, h, "FFFF", {move: "up only"});
        this.polygonWall(borders, {callback: [this.CB], move: "right"});
        this.polygonWall(borders, {move: "mirror right"});
        if (this.top === "lid") {
            this.polygonWall([(l + t), [180, (r + t)], 0, -90, 0, [180, (r + t)], (l + t), 90], "e");
        }
    }

}

module.exports.HeartBox = HeartBox;