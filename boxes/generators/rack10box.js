import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { Rack19Box  } from './rack19box.js';

class Rack10Box extends Rack19Box {
    render() {
        this._render({type: 10});
    }

}

export { Rack10Box };