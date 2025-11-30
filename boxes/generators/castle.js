import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Castle extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
    }

    render(t_x, t_h, w1_x, w1_h, w2_x, w2_h) {
        let s = edges.FingerJointSettings(10.0);
        s.edgeObjects(this, "pPQ");
        this.moveTo(0, 0);
        this.rectangularWall(t_x, t_h, {edges: "efPf", move: "right", callback: [() => this.fingerHolesAt((t_x * 0.5), 0, w1_h, 90)]});
        this.rectangularWall(t_x, t_h, {edges: "efPf", move: "right"});
        this.rectangularWall(t_x, t_h, {edges: "eFPF", move: "right", callback: [() => this.fingerHolesAt((t_x * 0.5), 0, w2_h, 90)]});
        this.rectangularWall(t_x, t_h, {edges: "eFPF", move: "right"});
        this.rectangularWall(w1_x, w1_h, "efpe", {move: "right"});
        this.rectangularWall(w2_x, w2_h, "efpe", {move: "right"});
    }

}

export { Castle };