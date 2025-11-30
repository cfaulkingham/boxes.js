import { Boxes } from './boxes.js';
import { FingerJointSettings } from './edges.js';

export class _TopEdge extends Boxes {
    addTopEdgeSettings(fingerjoint, stackable, hinge, cabinethinge, slideonlid, click, roundedtriangle, mounting, handle) {
        this.addSettingsArgs(FingerJointSettings, {None: fingerjoint});
        // this.addSettingsArgs(edges.StackableSettings, {None: stackable});
        // ... omitted
    }

    // Simplified placeholder for topEdges
    topEdges(top_edge) {
        let tl = "e";
        let tr = "e";
        let tb = "e";
        let tf = "e";
        return [tl, tb, tr, tf];
    }

    drawLid(x, y, top_edge, bedBolts) {
        let d2;
        let d3;
        // bedBolts might be undefined
        if (bedBolts) [d2, d3] = bedBolts;

        if (top_edge === "c") {
            this.rectangularWall(x, y, "CCCC", {bedBolts: [d2, d3, d2, d3], move: "up", label: "top"});
        } else if (top_edge === "f") {
            this.rectangularWall(x, y, "FFFF", {move: "up", label: "top"});
        } else if ("FhŠY".includes(top_edge)) {
            this.rectangularWall(x, y, "ffff", {move: "up", label: "top"});
        } else if (top_edge === "E") {
            this.rectangularWall(x, y, "EEEE", {move: "up", label: "lid top"});
            this.rectangularWall(x, y, "eeee", {move: "up", label: "lid top"});
        }
        return true;
    }
}
