import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class AllEdges extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.StackableSettings);
        this.addSettingsArgs(edges.HingeSettings);
        this.addSettingsArgs(edges.SlideOnLidSettings);
        this.addSettingsArgs(edges.ClickSettings);
        this.addSettingsArgs(edges.FlexSettings);
        this.addSettingsArgs(edges.HandleEdgeSettings);
        // this.buildArgParser();
    }

    render() {
        let x = this.x;
        let t = this.thickness;
        let chars = Object.keys(this.edges);
        // Sort: lowercase first, then uppercase (Python: c.lower() + (c.isupper() ? c : ""))
        chars.sort((a, b) => {
            const keyA = a.toLowerCase() + (a === a.toUpperCase() && a !== a.toLowerCase() ? a : "");
            const keyB = b.toLowerCase() + (b === b.toUpperCase() && b !== b.toLowerCase() ? b : "");
            return keyA.localeCompare(keyB);
        });
        chars.reverse();
        this.moveTo(0, (10 * t));
        for (let c of chars) {
            this.ctx.save();
            this.move(0, 0, "", true);
            this.moveTo(x, 0, 90);
            this.edge((t + this.edges[c].startwidth()));
            this.corner(90);
            this.edges[c].draw(x, {h: (4 * t)});
            this.corner(90);
            this.edge((t + this.edges[c].endwidth()));
            this.move(0, 0, "");
            this.ctx.restore();
            this.moveTo(0, ((3 * t) + this.edges[c].spacing()));
            this.text(`${c} - ${this.edges[c].description || ''}`);
            this.moveTo(0, (12 * t));
        }
    }

}

export { AllEdges };