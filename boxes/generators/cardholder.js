import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class CardHolder extends Boxes {
    // Default configuration for test runner and standalone usage
    static get defaultConfig() {
        return {
            sx: [65, 65, 65],  // Parsed form of "65*3"
            y: 50,
            h: 50,
            angle: 7.5,
            stackable: true
        };
    }

    constructor() {
        super();
        this.addSettingsArgs(edges.StackableSettings);
        this.addSettingsArgs(edges.GroovedSettings);
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 1.0});
        this.buildArgParser({sx: "65*3", y: 50, h: 50});
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 7.5, help: "backward angle of floor"});
        this.argparser.add_argument("--stackable", {action: "store", type: "boolean", default: true, help: "make holders stackable"});
    }

    _buildObjects() {
        super._buildObjects();
        // Create grooved edges (z, Z)
        const groovedSettings = new edges.GroovedSettings(this.thickness, true);
        groovedSettings.edgeObjects(this);
        // Create stackable edges (s, S, š, Š)
        const stackableSettings = new edges.StackableSettings(this.thickness, true);
        stackableSettings.edgeObjects(this);
    }

    side() {
        let t = this.thickness;
        let a = (this.angle * Math.PI / 180);
        let pos_y = (this.y - Math.abs(((0.5 * t) * Math.sin(a))));
        let pos_h = (t - ((Math.cos(a) * 0.5) * t));
        this.fingerHolesAt(pos_y, pos_h, this.y, (180 - this.angle));
    }

    fingerHoleCB(length, posy) {
        const CB = () => {
            let t = this.thickness;
            let px = (-0.5 * t);
            for (let x of this.sx.slice(0, -1)) {
                px += (x + t);
                this.fingerHolesAt(px, posy, length, 90);
            }
        };

        return CB;
    }

    middleWall(move) {
        let y;
        let h;
        [y, h] = [this.y, this.h];
        let a = this.angle;
        let t = this.thickness;
        let tw = (y + t);
        let th = h;
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(t, t, a);
        this.edges["f"].draw(y);
        this.polyline(0, (90 - a), ((h - t) - (y * Math.sin((a * Math.PI / 180)))), 90, (y * Math.cos((a * Math.PI / 180))), 90);
        this.edges["f"].draw((h - t));
        this.move(tw, th, move);
    }

    render() {
        let sx;
        let y;
        let h;
        [sx, y, h] = [this.sx, this.y, this.h];
        let t = this.thickness;
        let x = sx.reduce((a, b) => a + b, 0) + (sx.length - 1) * t;
        let bottom = (this.stackable ? "š" : "e");
        let top = (this.stackable ? "S" : "e");
        if (this.outside) {
        }
        else {
        }
        this.rectangularWall(y, h, [bottom, "F", top, "e"], {ignore_widths: [1, 6], callback: [this.side.bind(this)], move: "up"});
        this.rectangularWall(y, h, [bottom, "F", top, "e"], {ignore_widths: [1, 6], callback: [this.side.bind(this)], move: "up mirror"});
        let nx = sx.length;
        let f_lengths = [];
        for (let val of this.sx) {
            f_lengths.push(val);
            f_lengths.push(t);
        }
        f_lengths = f_lengths.slice(0, -1);
        let frontedge = new edges.CompoundEdge(this, "z".repeat(nx).split("").join("e"), f_lengths);
        this.rectangularWall(x, y, [frontedge, "f", "e", "f"], {callback: [this.fingerHoleCB(y)], move: "up"});
        this.rectangularWall(x, h, (((bottom + "f") + top) + "f"), {ignore_widths: [1, 6], callback: [this.fingerHoleCB((h - t), t)], move: "up"});
        for (let i = 0; i < (nx - 1); i += 1) {
            this.middleWall({move: "right"});
        }
    }

}

export { CardHolder };