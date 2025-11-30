import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';
import { FingerJointEdge  } from '../edges.js';

class UnevenFingerJointEdge extends FingerJointEdge {
    __call__(length, bedBolts, bedBoltSettings) {
        let positive = this.positive;
        let s;
        let f;
        let thickness;
        [s, f, thickness] = [this.settings.space, this.settings.finger, this.settings.thickness];
        let p = (positive ? 1 : -1);
        let fingers;
        let leftover;
        [fingers, leftover] = this.calcFingers(length, bedBolts);
        if (!positive) {
            let play = this.settings.play;
            f += play;
            s -= play;
            leftover -= play;
        }
        let shift = ((f + s) / 2);
        if (leftover < shift) {
            leftover = shift;
        }
        this.edge(((leftover + shift) / 2), {tabs: 1});
        let l1;
        let l2;
        [l1, l2] = this.fingerLength(this.settings.angle);
        let h = (l1 - l2);
        let d = (bedBoltSettings || this.bedBoltSettings)[0];
        for (let i = 0; i < fingers; i += 1) {
            if (i !== 0) {
                if ((!positive && bedBolts && bedBolts.drawBolt(i))) {
                    this.hole((0.5 * s), (0.5 * this.settings.thickness), (0.5 * d));
                }
                if ((positive && bedBolts && bedBolts.drawBolt(i))) {
                    this.bedBoltHole(s, bedBoltSettings);
                }
                else {
                    this.edge(s);
                }
            }
            if ((positive && this.settings.style === "springs")) {
                this.polyline(0, (-90 * p), (0.8 * h), [(90 * p), (0.2 * h)], (0.1 * h), 90, (0.9 * h), -180, (0.9 * h), 90, (f - (0.6 * h)), 90, (0.9 * h), -180, (0.9 * h), 90, (0.1 * h), [(90 * p), (0.2 * h)], (0.8 * h), (-90 * p));
            }
            else {
                this.polyline(0, (-90 * p), h, (90 * p), f, (90 * p), h, (-90 * p));
            }
        }
        this.edge(((leftover - shift) / 2), {tabs: 1});
    }

}

export { UnevenFingerJointEdge };
class UnevenFingerJointEdgeCounterPart extends UnevenFingerJointEdge {
}

export { UnevenFingerJointEdgeCounterPart };
class Platonic extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 0});
        // this.buildArgParser();
        this.argparser.add_argument("--type", {action: "store", type: "str", default: list(this.SOLIDS)[0], choices: list(this.SOLIDS), help: "type of platonic solid"});
    }

    render() {
        let e = this.x;
        let t = this.thickness;
        let faces;
        let corners;
        [faces, corners] = this.SOLIDS[this.type];
        let u = UnevenFingerJointEdge(this, this.edges["f"].settings);
        this.addPart(u);
        let uc = UnevenFingerJointEdgeCounterPart(this, this.edges["f"].settings);
        this.addPart(uc);
        for (let _ = 0; _ < faces; _ += 1) {
            this.regularPolygonWall(corners, {side: e, edges: "u", move: "right"});
        }
    }

}

export { Platonic };