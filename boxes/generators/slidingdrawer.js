import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class SlidingDrawer extends Boxes {

    static get defaultConfig() {
        return {
            x: 60.0,
            y: 100.0,
            h: 30.0,
            hi: 0.0,
            outside: false,
            bottom_edge: "h"
        };
    }

    constructor() {
        super();
        
        this.addSettingsArgs(edges.FingerJointSettings, {finger: 2.0, space: 2.0});
        this.addSettingsArgs(edges.GroovedSettings, {width: 0.4});
        this.argparser.add_argument("--play", {action: "store", type: "float", default: 0.15, help: "play between the two parts as multiple of the wall thickness"});
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        x = this.adjustSize(x);
        y = this.adjustSize(y);
        h = this.adjustSize(h);
        let hi = (!this.hi ? h : this.adjustSize(this.hi));
        let t = this.thickness;
        let p = (this.play * t);
        y = (y + t);
        if (!this.outside) {
            x = ((x + (4 * t)) + (2 * p));
            y = ((y + (3 * t)) + (2 * p));
            h = ((h + (3 * t)) + (2 * p));
        }
        let x2 = (x - ((2 * t) + (2 * p)));
        let y2 = (y - ((2 * t) + (2 * p)));
        let h2 = (h - (t + (2 * p)));
        hi = (hi - (t + (2 * p)));
        let e1 = (hi !== h2 ? new edges.CompoundEdge(this, "FE", [hi, (h2 - hi)]) : "F");
        let e2 = (hi !== h2 ? new edges.CompoundEdge(this, "EF", [(h2 - hi), hi]) : "F");
        this.rectangularWall(x2, hi, "FFeF", {label: "in box wall", move: "right"});
        this.rectangularWall(y2, hi, "ffef", {label: "in box wall", move: "up"});
        this.rectangularWall(y2, hi, "ffef", {label: "in box wall"});
        this.rectangularWall(x2, h2, ["F", e1, "z", e2], {label: "in box wall", move: "left up"});
        this.rectangularWall(y2, x2, "FfFf", {label: "in box bottom", move: "up"});
        this.rectangularWall(y, x, "FFFe", {label: "out box bottom", move: "right"});
        this.rectangularWall(y, x, "FFFe", {label: "out box top", move: "up"});
        this.rectangularWall(y, h, "fffe", {label: "out box wall"});
        this.rectangularWall(y, h, "fffe", {label: "out box wall", move: "up left"});
        this.rectangularWall(x, h, "fFfF", {label: "out box wall"});
    }

}

export { SlidingDrawer };