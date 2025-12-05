import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class AirPurifier extends Boxes {
    // Default configuration for test runner and standalone usage
    static get defaultConfig() {
        return {
            x: 498.0,
            y: 496.0,
            fan_diameter: 140.0,
            rim: 30.0,
            filter_height: 46.77,
            filters: 2,
            fans_left: -1,
            fans_right: -1,
            fans_top: 0,
            fans_bottom: 0,
            screw_holes: 5.0,
            split_frames: true
        };
    }

    constructor() {
        super();

        this.fan_holes = {
            40: 32.5,
            60: 50,
            80: 71.5,
            92: 82.5,
            120: 105.0,
            140: 125.0,
        };
        
        this.argparser.add_argument("--x", {action: "store", type: "float", default: 498.0, help: "width of the purifier (in mm)"});
        this.argparser.add_argument("--y", {action: "store", type: "float", default: 496.0, help: "depth of the purifier (in mm)"});
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.DoveTailSettings, {size: 2.0, depth: 1});
        this.argparser.add_argument("--fan_diameter", {action: "store", type: "float", default: 140.0, choices: Object.keys(this.fan_holes).map(Number), help: "diameter of the fans (in mm)"});
        this.argparser.add_argument("--filter_height", {action: "store", type: "float", default: 46.77, help: "height of the filter along the flow direction (in mm)"});
        this.argparser.add_argument("--rim", {action: "store", type: "float", default: 30.0, help: "rim around the filter holding it in place (in mm)"});
        this.argparser.add_argument("--filters", {action: "store", type: "int", default: 2, choices: [1, 2], help: "Filters on both sides or only one"});
        this.argparser.add_argument("--split_frames", {action: "store", type: "BoolArg", default: true, help: "Split frame pieces into four thin rectangles to save material"});
        this.argparser.add_argument("--fans_left", {action: "store", type: "int", default: -1, help: "number of fans on the left side (-1 for maximal number)"});
        this.argparser.add_argument("--fans_right", {action: "store", type: "int", default: -1, help: "number of fans on the right side (-1 for maximal number)"});
        this.argparser.add_argument("--fans_top", {action: "store", type: "int", default: 0, help: "number of fans on the top side (-1 for maximal number)"});
        this.argparser.add_argument("--fans_bottom", {action: "store", type: "int", default: 0, help: "number of fans on the bottom side (-1 for maximal number)"});
        this.argparser.add_argument("--screw_holes", {action: "store", type: "float", default: 5.0, help: "diameter of the holes for screwing in the fans (in mm)"});
    }

    fanCB(n, h, l, fingerHoles = true, split_frames = false) {
        let fh = this.filter_height;
        let t = this.thickness;
        let r = this.rim;
        const fan_diameter = this.fan_diameter; // Capture fan_diameter in closure
        const fan_holes = this.fan_holes;     // Capture fan_holes in closure
        
        const cb = () => {
            if (fingerHoles) {
                let heights = [(fh + (t / 2))];
                if (this.filters > 1) {
                    heights.push(((h - fh) - (t / 2)));
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
            let max_n = parseInt(Math.floor((l - 20) / (fan_diameter + 10)));
            let n_ = (n === -1) ? max_n : Math.min(max_n, n);
            
            if (n_ === 0) {
                return;
            }

            let w = ((l - 20) / n_);
            let x = (10 + (w / 2));
            let delta = (fan_holes[fan_diameter] / 2);
            let posy;

            if (this.filters === 2) {
                posy = (h / 2);
            }
            else {
                posy = (((h + t) + fh) / 2);
            }
            for (let i = 0; i < n_; i += 1) {
                let posx = (x + (i * w));
                this.hole(posx, posy, 0, (fan_diameter - 4));
                for (let dx of [-delta, delta]) {
                    for (let dy of [-delta, delta]) {
                        this.hole((posx + dx), (posy + dy), 0, this.screw_holes);
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
        
        // Shorten by one thickness as we use the wall space
        y = this.y = y - t;
        
        let fh = this.filter_height;
        let h = ((d + 2) + (this.filters * (fh + t)));
        this.rectangularWall(x, d, "ffff", {callback: [this.fanCB(this.fans_top, d, x, false)], label: "top", move: "up"});
        this.rectangularWall(x, h, "ffff", {callback: [this.fanCB(this.fans_bottom, h, x)], label: "bottom", move: "up"});

        let be, te;
        if (this.split_frames) {
            be = te = new edges.CompoundEdge(this, "fff", [r, y - 2*r, r]);
        } else {
            be = te = "f";
        }

        let le;
        if (this.filters === 2) {
            le = new edges.CompoundEdge(this, "EFE", [(fh + t), (d + 2), (fh + t)]);
        }
        else {
            le = new edges.CompoundEdge(this, "FE", [(d + 2), (fh + t)]);
        }
        
        for (let fans of [this.fans_left, this.fans_right]) {
            this.rectangularWall(y, h, [be, "h", te, le], {callback: [this.fanCB(fans, h, y, true, this.split_frames)], move: "up"});
        }
        if (this.split_frames) {
            const x = this.x;
            const y = this.y;
            const r = this.rim;
            const filters = this.filters;
            
            let e = new edges.CompoundEdge(this, "DeD", [r, (x - (2 * r)), r]);
            for (let _ = 0; _ < filters; _ += 1) {
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
                this.rectangularWall(x, y, "Ffff", {callback: [() => this.rectangularHole((x / 2), (y / 2), (x - r), (y - r), 10)], move: "up"});
                this.rectangularWall(x, y, "Ehhh", {callback: [() => this.rectangularHole((x / 2), (y / 2), (x - r), (y - r), 10)], move: "up"});
            }
        }
        if (this.filters === 1) {
            this.rectangularWall(x, y, "hhhh", {move: "up"});
        }
    }
}

export { AirPurifier };