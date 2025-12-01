import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class AirPurifier extends Boxes {
    constructor() {
        super();

        // FIX 1: Define the missing fan_holes object. This object maps fan diameters
        // to the distance between their screw holes. It's needed for argument parsing
        // and for rendering the screw holes.
        this.fan_holes = {
            80: 71.5,
            120: 105.0,
            140: 125.0,
        };
        
        // FIX 2: Added arguments for box width ('x') and depth ('y').
        this.argparser.add_argument("--x", {action: "store", type: "float", default: 300.0, help: "width of the purifier (in mm)"});
        this.argparser.add_argument("--y", {action: "store", type: "float", default: 300.0, help: "depth of the purifier (in mm)"});

        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.DoveTailSettings, {size: 2.0, depth: 1});
        // this.buildArgParser();
        
        // FIX 3 (Corrected): To create an array of keys from the fan_holes object, we must use
        // Object.keys(). The .keys() method does not exist on plain objects.
        this.argparser.add_argument("--fan_diameter", {action: "store", type: "float", default: 140.0, choices: Object.keys(this.fan_holes), help: "diameter of the fans (in mm)"});
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

    fanCB(n, h, l, fingerHoles, split_frames) {
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
            // FIX 4: This logic was buggy. `n_` was declared with `let` inside an `if` block,
            // making it inaccessible to the `else` block and the subsequent code.
            // This is corrected to a single, clean declaration.
            let n_ = (n === -1) ? max_n : Math.min(max_n, n);
            
            if (n_ === 0) {
                return;
            }
            let w = ((l - 20) / n_);
            let x = (10 + (w / 2));
            
            // FIX 9: Use captured fan_diameter and fan_holes instead of this.fan_diameter
            // which may be undefined in the callback context
            let delta = (fan_holes[fan_diameter] / 2);

            // FIX 5: `posy` was declared with `let` inside the `if` block, causing a ReferenceError.
            // It is now declared before the conditional logic.
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
        let fh = this.filter_height;
        let h = ((d + 2) + (this.filters * (fh + t)));
        this.rectangularWall(x, d, "ffff", {callback: [this.fanCB(this.fans_top, d, x, false)], label: "top", move: "up"});
        this.rectangularWall(x, h, "ffff", {callback: [this.fanCB(this.fans_bottom, h, x)], label: "bottom", move: "up"});

        // FIX 6: `le` and `te` were scoped to the if/else blocks but used outside. They are
        // now declared before the conditional.
        let le, te = "f";
        if (this.filters === 2) {
            // FIX 8: Added the 'new' keyword to correctly instantiate the CompoundEdge class.
            le = new edges.CompoundEdge(this, "EFE", [(fh + t), (d + 2), (fh + t)]);
        }
        else {
            // FIX 8: Added the 'new' keyword to correctly instantiate the CompoundEdge class.
            le = new edges.CompoundEdge(this, "FE", [(d + 2), (fh + t)]);
        }
        
        // FIX 7: `be` was not defined. Replaced with "e" for a plain edge.
        for (let fans of [this.fans_left, this.fans_right]) {
            this.rectangularWall(y, h, ["e", "h", te, le], {callback: [this.fanCB(fans, h, y)], move: "up"});
        }
        if (this.split_frames) {
            // FIX 10: Capture all needed properties in closure to avoid undefined values
            const x = this.x;
            const y = this.y;
            const r = this.rim;
            const filters = this.filters;
            
            // FIX 8: Added the 'new' keyword to correctly instantiate the CompoundEdge class.
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
                this.rectangularWall(x, y, "Ffff", {callback: [() => this.rectangularHole((x / 2), (y / 2), (x - r), (y - r))], move: "up"});
                this.rectangularWall(x, y, "Ehhh", {callback: [() => this.rectangularHole((x / 2), (y / 2), (x - r), (y - r))], move: "up"});
            }
        }
        if (this.filters === 1) {
            this.rectangularWall(x, y, "hhhh", {move: "up"});
        }
    }

}

export { AirPurifier };