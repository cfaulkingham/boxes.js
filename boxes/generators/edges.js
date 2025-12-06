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
        let chars = Object.keys(this.edges);
        chars.sort();
        for (let c of chars) {
            const edge = this.edges[c];
            const className = edge.constructor ? edge.constructor.name : 'unknown';
            const doc = edge.__doc__ || '';
            console.log(`${c} ${className} - ${doc}`);
        }
    }

}

export { Edges };