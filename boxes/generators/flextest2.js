import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class FlexTest2 extends Boxes {
    constructor() {
        super();
        // this.buildArgParser("x", "y");
        this.argparser.add_argument("--fw", {action: "store", type: "float", default: 1, help: "distance of flex cuts in multiples of thickness"});
    }

    render() {
        let x;
        let y;
        [x, y] = [this.x, this.y];
        this.rectangularWall(x, y, {callback: [() => this.flex2D(x, y, this.fw)]});
    }

}

export { FlexTest2 };