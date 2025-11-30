import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class FlexTest extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FlexSettings);
        // this.buildArgParser("x", "y");
    }

    render() {
        let x;
        let y;
        [x, y] = [this.x, this.y];
        this.moveTo(5, 5);
        this.edge(10);
        this.edges["X"](x, y);
        this.edge(10);
        this.corner(90);
        this.edge(y);
        this.corner(90);
        this.edge((x + 20));
        this.corner(90);
        this.edge(y);
        this.corner(90);
    }

}

export { FlexTest };