import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { SevenSegmentPattern  } from './sevensegmentpattern.js';

class SevenSegmentClock extends SevenSegmentPattern {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.argparser.add_argument("--height", {action: "store", type: "float", default: 100.0, help: "height of the front panel (with walls if outside is selected) in mm"});
        this.argparser.add_argument("--h", {action: "store", type: "float", default: 20.0, help: "depth (with walls if outside is selected) in mm"});
        // this.buildArgParser();
    }

    frontCB() {
        let x = this.height;
        this.hole((1.27 * x), (0.4 * x), (0.05 * x));
        this.hole((1.27 * x), (0.6 * x), (0.05 * x));
        this.moveTo((0.1 * x), (0.1 * x));
        for (let i = 0; i < 2; i += 1) {
            for (let j = 0; j < 2; j += 1) {
                this.seven_segments((0.8 * x));
                this.moveTo((0.6 * x));
            }
            this.moveTo((0.1 * x));
        }
    }

    backCB() {
        let x = this.height;
        this.moveTo((0.1 * x), (0.1 * x));
        for (let i = 0; i < 2; i += 1) {
            for (let j = 0; j < 2; j += 1) {
                this.seven_segment_holes((0.8 * x));
                this.moveTo((0.6 * x));
            }
            this.moveTo((0.1 * x));
        }
    }

    render() {
        let height;
        let h;
        [height, h] = [this.height, this.h];
        if (this.outside) {
        }
        let t = this.thickness;
        let y = (((((3 * 0.6) + 0.1) + 0.2) * height) + ((0.55 * 0.8) * height));
        this.rectangularWall(height, h, "FFFF", {move: "right"});
        this.rectangularWall(y, h, "FfFf", {move: "up"});
        this.rectangularWall(y, h, "FfFf");
        this.rectangularWall(height, h, "FFFF", {move: "left up"});
        this.ctx.save();
        this.rectangularWall(y, height, "ffff", {callback: [this.frontCB], move: "right"});
        this.rectangularWall(y, height, "ffff", {callback: [this.backCB], move: "right"});
        this.ctx.restore();
        this.rectangularWall(y, height, "ffff", {move: "up only"});
        this.seven_segment_separators((0.8 * height), h, 4);
    }

}

export { SevenSegmentClock };