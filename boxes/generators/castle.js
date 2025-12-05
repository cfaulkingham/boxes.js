import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Castle extends Boxes {
    // Default configuration for test runner and standalone usage
    static get defaultConfig() {
        return {
            t_x: 70,
            t_h: 250,
            w1_x: 300,
            w1_h: 120,
            w2_x: 100,
            w2_h: 120
        };
    }

    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
    }

    render(t_x = 70, t_h = 250, w1_x = 300, w1_h = 120, w2_x = 100, w2_h = 120) {
        let s = new edges.FingerJointSettings(10.0, true, {
            space: 1,
            finger: 1,
            width: this.thickness
        });
        s.edgeObjects(this, "pPQ");
        this.moveTo(0, 0);
        this.rectangularWall(t_x, t_h, "efPf", {move: "right", callback: [() => this.fingerHolesAt(t_x * 0.5, 0, w1_h, 90)]});
        this.rectangularWall(t_x, t_h, "efPf", {move: "right"});
        this.rectangularWall(t_x, t_h, "eFPF", {move: "right", callback: [() => this.fingerHolesAt(t_x * 0.5, 0, w2_h, 90)]});
        this.rectangularWall(t_x, t_h, "eFPF", {move: "right"});
        this.rectangularWall(w1_x, w1_h, "efpe", {move: "right"});
        this.rectangularWall(w2_x, w2_h, "efpe", {move: "right"});
    }

}

export { Castle };