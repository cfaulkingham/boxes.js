import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class BasedBox extends Boxes {
    // Default configuration for test runner and standalone usage
    static get defaultConfig() {
        return {
            x: 100.0,
            y: 100.0,
            h: 100.0,
            outside: false
        };
    }

    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser("x", "y", "h", "outside");
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        if (this.outside) {
            x = this.adjustSize(x);
            y = this.adjustSize(y);
            h = this.adjustSize(h);
        }
        let t = this.thickness;
        this.rectangularWall(x, h, "fFFF", {move: "right", label: "Wall 1"});
        this.rectangularWall(y, h, "ffFf", {move: "up", label: "Wall 2"});
        this.rectangularWall(y, h, "ffFf", {label: "Wall 4"});
        this.rectangularWall(x, h, "fFFF", {move: "left up", label: "Wall 3"});
        this.rectangularWall(x, y, "ffff", {move: "right", label: "Top"});
        this.rectangularWall(x, y, "hhhh", {label: "Base"});
    }

}

export { BasedBox };