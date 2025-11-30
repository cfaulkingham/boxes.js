import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Edges extends Boxes {
    constructor() {
        super();
    }

    render() {
        this.ctx = null;
        this._buildObjects();
        let chars = this.edges.keys();
        for (let c of sorted(chars)) {
            console.log(("%s %s - %s" % [c, this.edges[c].__class__.__name__, this.edges[c].__doc__]));
        }
    }

}

export { Edges };