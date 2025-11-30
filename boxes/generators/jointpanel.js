import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class JointPanel extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.DoveTailSettings, {size: 1, depth: 0.5, radius: 0.1});
        // this.buildArgParser();
        this.argparser.add_argument("--separate", {action: "store", type: boolarg, default: false, help: "draw pieces apart so they can be cut to form a large sheet"});
    }

    render() {
        let sx;
        let sy;
        [sx, sy] = [this.sx, this.sy];
        let t = this.thickness;
        for (let [ny, y] of enumerate(sy)) {
            let t0 = (ny === 0 ? "e" : "d");
            let t2 = (ny === (sy.length - 1) ? "e" : "D");
            this.ctx.save();
            for (let [nx, x] of enumerate(sx)) {
                let t1 = (nx === (sx.length - 1) ? "e" : "d");
                let t3 = (nx === 0 ? "e" : "D");
                this.rectangularWall(x, y, [t0, t1, t2, t3]);
                if (this.separate) {
                    this.rectangularWall(x, y, [t0, t1, t2, t3], {move: "right only"});
                }
                else {
                    this.moveTo(x);
                }
            }
            this.ctx.restore();
            if (this.separate) {
                this.rectangularWall(x, y, [t0, t1, t2, t3], {move: "up only"});
            }
            else {
                this.moveTo(0, (ny === 0 ? (y - this.edges["d"].spacing()) : y));
            }
        }
    }

}

export { JointPanel };