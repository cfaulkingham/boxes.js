const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class AirPurifier extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.DoveTailSettings, {size: 2.0, depth: 1});
        // this.buildArgParser();
        this.argparser.add_argument("--filter_height", {action: "store", type: "float", default: 46.77, help: "height of the filter along the flow direction (in mm)"});
        this.argparser.add_argument("--rim", {action: "store", type: "float", default: 30.0, help: "rim around the filter holding it in place (in mm)"});
        this.argparser.add_argument("--fan_diameter", {action: "store", type: "float", default: 140.0, choices: list(this.fan_holes.keys()), help: "diameter of the fans (in mm)"});
        this.argparser.add_argument("--filters", {action: "store", type: "int", default: 2, choices: [1, 2], help: "Filters on both sides or only one"});
        this.argparser.add_argument("--split_frames", {action: "store", type: BoolArg(), default: true, help: "Split frame pieces into four thin rectangles to save material"});
        this.argparser.add_argument("--fans_left", {action: "store", type: "int", default: -1, help: "number of fans on the left side (-1 for maximal number)"});
        this.argparser.add_argument("--fans_right", {action: "store", type: "int", default: -1, help: "number of fans on the right side (-1 for maximal number)"});
        this.argparser.add_argument("--fans_top", {action: "store", type: "int", default: 0, help: "number of fans on the top side (-1 for maximal number)"});
        this.argparser.add_argument("--fans_bottom", {action: "store", type: "int", default: 0, help: "number of fans on the bottom side (-1 for maximal number)"});
        this.argparser.add_argument("--screw_holes", {action: "store", type: "float", default: 5.0, help: "diameter of the holes for screwing in the fans (in mm)"});
    }

    fanCB(n, h, l, fingerHoles, split_frames) {
        let fh = this.filter_height;
        let t = this.thickness;
        let r = this.rim;
        const cb = () => {
            if (fingerHoles) {
                let heights = [(fh + (t / 2))];
                if (this.filters > 1) {
                    heights.append(((h - fh) - (t / 2)));
                }
                for (let h_ of heights) {
                    if (split_frames) {
                        this.fingerHolesAt(0, h_, r, 0);
                        this.fingerHolesAt(r, h_, (l - (2 * r)), 0);
                        this.fingerHolesAt((l - r), h_, r, 0);
                    }
                    else {
                        this.fingerHolesAt(0, h_, l, 0);
                    }
                }
            }
            let max_n = parseInt(Math.floor((l - 20) / (this.fan_diameter + 10)));
            if (n === -1) {
                let n_ = max_n;
            }
            else {
                n_ = Math.min(max_n, n);
            }
            if (n_ === 0) {
                return;
            }
            let w = ((l - 20) / n_);
            let x = (10 + (w / 2));
            let delta = (this.fan_holes[this.fan_diameter] / 2);
            if (this.filters === 2) {
                let posy = (h / 2);
            }
            else {
                posy = (((h + t) + fh) / 2);
            }
            for (let i = 0; i < n_; i += 1) {
                let posx = (x + (i * w));
                this.hole(posx, posy, {d: (this.fan_diameter - 4)});
                for (let dx of [-delta, delta]) {
                    for (let dy of [-delta, delta]) {
                        this.hole((posx + dx), (posy + dy), {d: this.screw_holes});
                    }
                }
            }
        };

        return cb;
    }

    render() {
        let x;
        let y;
        let d;
        [x, y, d] = [this.x, this.y, this.fan_diameter];
        let t = this.thickness;
        let r = this.rim;
        let fh = this.filter_height;
        let h = ((d + 2) + (this.filters * (fh + t)));
        this.rectangularWall(x, d, "ffff", {callback: [this.fanCB(this.fans_top, d, x, false)], label: "top", move: "up"});
        this.rectangularWall(x, h, "ffff", {callback: [this.fanCB(this.fans_bottom, h, x)], label: "bottom", move: "up"});
        if (this.filters === 2) {
            let le = edges.CompoundEdge(this, "EFE", [(fh + t), (d + 2), (fh + t)]);
        }
        else {
            le = edges.CompoundEdge(this, "FE", [(d + 2), (fh + t)]);
            let te = "f";
        }
        for (let fans of [this.fans_left, this.fans_right]) {
            this.rectangularWall(y, h, [be, "h", te, le], {callback: [this.fanCB(fans, h, y)], move: "up"});
        }
        if (this.split_frames) {
            let e = edges.CompoundEdge(this, "DeD", [r, (x - (2 * r)), r]);
            for (let _ = 0; _ < this.filters; _ += 1) {
                this.rectangularWall(x, r, ["E", "h", e, "h"], {move: "up"});
                this.rectangularWall((y - (2 * r)), r, "hded", {move: "up"});
                this.rectangularWall((y - (2 * r)), r, "hded", {move: "up"});
                this.rectangularWall(x, r, [e, "h", "h", "h"], {move: "up"});
                this.rectangularWall(x, r, ["F", "f", e, "f"], {move: "up"});
                this.rectangularWall((y - (2 * r)), r, "fded", {move: "up"});
                this.rectangularWall((y - (2 * r)), r, "fded", {move: "up"});
                this.rectangularWall(x, r, [e, "f", "f", "f"], {move: "up"});
            }
        }
        else {
            for (let _ = 0; _ < this.filters; _ += 1) {
                this.rectangularWall(x, y, "Ffff", {callback: [() => this.rectangularHole((x / 2), (y / 2), (x - r), (y - r))], move: "up"});
                this.rectangularWall(x, y, "Ehhh", {callback: [() => this.rectangularHole((x / 2), (y / 2), (x - r), (y - r))], move: "up"});
            }
        }
        if (this.filters === 1) {
            this.rectangularWall(x, y, "hhhh", {move: "up"});
        }
    }

}

module.exports.AirPurifier = AirPurifier;