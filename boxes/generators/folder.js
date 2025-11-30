import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Folder extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FlexSettings);
        // this.buildArgParser("x", "y", "h");
        this.argparser.add_argument("--r", {action: "store", type: "float", default: 10.0, help: "radius of the corners"});
        this.argparser.set_defaults({h: 20});
    }

    render() {
        let x;
        let y;
        let r;
        let h;
        [x, y, r, h] = [this.x, this.y, this.r, this.h];
        let c2 = (Math.PI * h);
        this.moveTo((r + this.thickness), this.thickness);
        this.edge((x - r));
        this.edges["X"](c2, y);
        this.edge((x - r));
        this.corner(90, r);
        this.edge((y - (2 * r)));
        this.corner(90, r);
        this.edge((((2 * x) - (2 * r)) + c2));
        this.corner(90, r);
        this.edge((y - (2 * r)));
        this.corner(90, r);
    }

}

export { Folder };