import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { _WallMountedBox  } from '../walledges.js';
import { DrillStand  } from './drillstand.js';

class WallDrillBox extends DrillStand {
    constructor() {
        super();
        this.addSettingsArgs(edges.StackableSettings, {height: 1.0, width: 3});
        // this.buildArgParser();
        this.argparser.add_argument("--extra_height", {action: "store", type: "float", default: 15.0, help: "height difference left to right"});
    }

    render() {
        this.generateWallEdges();
        let t = this.thickness;
        let sx;
        let sy;
        let sh;
        [sx, sy, sh] = [this.sx, this.sy, this.sh];
        let bottom_angle = Math.atan((this.extra_height / x));
        this.xOutsideWall(sh[0], "hFeF", {move: "up"});
        for (let i = 1; i < sy.length; i += 1) {
            this.xWall(i, {move: "up"});
        }
        this.xOutsideWall(sh[-1], "hCec", {move: "up"});
        this.rectangularWall(((x / Math.cos(bottom_angle)) - (t * Math.tan(bottom_angle))), y, "fefe", {callback: [this.bottomCB], move: "up"});
        this.sideWall({edges: "eBf", foot_height: (2 * t), move: "right"});
        for (let i = 1; i < sx.length; i += 1) {
            this.yWall(i, {move: "right"});
        }
        this.sideWall(this.extra_height, {foot_height: (2 * t), edges: "eBf", move: "right"});
    }

}

export { WallDrillBox };