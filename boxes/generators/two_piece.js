import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class TwoPiece extends Boxes {
    constructor() {
        super();
        // this.buildArgParser("x", "y", "h", "hi", "outside");
        this.addSettingsArgs(edges.FingerJointSettings, {finger: 2.0, space: 2.0});
        this.argparser.add_argument("--play", {action: "store", type: "float", default: 0.15, help: "play between the two parts as multiple of the wall thickness"});
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        let hi = (this.hi || this.h);
        let t = this.thickness;
        let p = (this.play * t);
        if (this.outside) {
            x -= ((4 * t) + (2 * p));
            y -= ((4 * t) + (2 * p));
            h -= (2 * t);
            hi -= (2 * t);
        }
        this.edges["f"].settings.setValues(t, false, {edge_width: (this.edges["f"].settings.edge_width + p)});
        for (let i = 0; i < 2; i += 1) {
            let d = ((i * 2) * (t + p));
            let height = [hi, h][i];
            this.ctx.save();
            this.rectangularWall((x + d), height, "fFeF", {move: "right"});
            this.rectangularWall((y + d), height, "ffef", {move: "right"});
            this.rectangularWall((x + d), height, "fFeF", {move: "right"});
            this.rectangularWall((y + d), height, "ffef", {move: "right"});
            this.ctx.restore();
            this.rectangularWall(y, height, "ffef", {move: "up only"});
        }
        this.rectangularWall(x, y, "hhhh", {bedBolts: null, move: "right"});
        this.rectangularWall((x + d), (y + d), "FFFF", {bedBolts: null, move: "right"});
    }

}

export { TwoPiece };