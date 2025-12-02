import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class BinFrontEdge extends Boxes {
    __call__(length) {
        let f = this.settings.front;
        let a1 = (Math.atan((f / (1 - f))) * 180 / Math.PI);
        let a2 = (45 + a1);
        this.corner(-a1);
        for (let [i, l] of this.settings.sy.entries()) {
            this.edges["e"]((l * (((f ** 2) + ((1 - f) ** 2)) ** 0.5)));
            this.corner(a2);
            this.edges["f"](((l * f) * (2 ** 0.5)));
            if (i < (this.settings.sy.length - 1)) {
                if (this.char === "B") {
                    this.polyline(0, 45, (0.5 * this.settings.hi), -90, this.thickness, -90, (0.5 * this.settings.hi), (90 - a1));
                }
                else {
                    this.polyline(0, -45, this.thickness, -a1);
                }
            }
            else {
                this.corner(-45);
            }
        }
    }

    margin() {
        return (Math.max(this.settings.sy) * this.settings.front);
    }

}

export { BinFrontEdge };
class BinFrontSideEdge extends BinFrontEdge {
}

export { BinFrontSideEdge };
class BinTray extends Boxes {
    constructor() {
        super();
        // this.buildArgParser("sx", "sy", "h", "outside", "hole_dD");
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 0.5});
        this.argparser.add_argument("--front", {action: "store", type: "float", default: 0.4, help: "fraction of bin height covered with slope"});
    }

    parseArgs(args) {
        // Call parent method to set common defaults
        super.parseArgs(args);
        
        // Initialize sx and sy with default values if not provided
        if (!this.sx || !Array.isArray(this.sx)) {
            this.sx = [50, 50]; // Default 2 compartments of 50mm each
        }
        
        if (!this.sy || !Array.isArray(this.sy)) {
            this.sy = [50, 50]; // Default 2 compartments of 50mm each
        }
        
        // Initialize hole_dD if not provided
        if (!this.hole_dD) {
            this.hole_dD = [3.0]; // Default 3mm hole diameter
        }
        
        // Initialize hi (inner height) if not provided
        if (!this.hi) {
            this.hi = 30; // Default 30mm inner height
        }
        
        // Override with args
        for (const [key, value] of Object.entries(args)) {
            this[key] = value;
        }
    }

    xSlots() {
        let posx = (-0.5 * this.thickness);
        for (let x of this.sx.slice(0, -1)) {
            posx += (x + this.thickness);
            let posy = 0;
            for (let y of this.sy) {
                this.fingerHolesAt(posx, posy, y);
                posy += (y + this.thickness);
            }
        }
    }

    ySlots() {
        let posy = (-0.5 * this.thickness);
        for (let y of this.sy.slice(0, -1)) {
            posy += (y + this.thickness);
            let posx = 0;
            for (let x of [...this.sx].reverse()) {
                this.fingerHolesAt(posy, posx, x);
                posx += (x + this.thickness);
            }
        }
    }

    addMount() {
        let ds = this.hole_dD[0];
        let dh = 0;
        let y = 0;
        
        if (this.hole_dD.length < 2) {
            y = Math.max((this.thickness * 1.25), ((this.thickness * 1.0) + ds));
        }
        else {
            dh = this.hole_dD[1];
            y = Math.max((this.thickness * 1.25), ((this.thickness * 1.0) + (dh / 2)));
        }
        let dx = (this.sx.reduce((a, b) => a + b, 0) + (this.thickness * (this.sx.length - 1)));
        let x1 = (dx * 0.125);
        let x2 = (dx * 0.875);
        this.mountingHole(x1, y, ds, dh, -90);
        this.mountingHole(x2, y, ds, dh, -90);
    }

    xHoles() {
        let posx = (-0.5 * this.thickness);
        for (let x of this.sx.slice(0, -1)) {
            posx += (x + this.thickness);
            this.fingerHolesAt(posx, 0, this.hi);
        }
    }

    frontHoles(i) {
        const CB = () => {
            let posx = (-0.5 * this.thickness);
            for (let x of this.sx.slice(0, -1)) {
                posx += (x + this.thickness);
                this.fingerHolesAt(posx, 0, ((this.sy[i] * this.front) * (2 ** 0.5)));
            }
        };

        return CB;
    }

    yHoles() {
        let posy = (-0.5 * this.thickness);
        for (let y of [...this.sy.slice(1)].reverse()) {
            posy += (y + this.thickness);
            this.fingerHolesAt(posy, 0, this.hi);
        }
    }

    render() {
        if (this.outside) {
            this.sx = this.adjustSize(this.sx);
            this.sy = this.adjustSize(this.sy);
            this.h = this.adjustSize(this.h);
        }
        let x = (this.sx.reduce((a, b) => a + b, 0) + (this.thickness * (this.sx.length - 1)));
        let y = (this.sy.reduce((a, b) => a + b, 0) + (this.thickness * (this.sy.length - 1)));
        let h = this.h;
        let t = this.thickness;
        this.front = Math.min(this.front, 0.999);
        this.addPart(new BinFrontEdge(this, this));
        this.addPart(new BinFrontSideEdge(this, this));
        let angledsettings = this.edges["f"].settings;
        angledsettings.setValues(this.thickness, true, {angle: 45});
        const gEdges = angledsettings.edgeObjects(this, {chars: "gGH"});
        const gEdge = gEdges[2]; // Get "G" edge
        const gEdgeSmall = gEdges[0]; // Get "g" edge
        
        // Now we can use the edges
        let e = ["F", "f", new edges.SlottedEdge(this, this.sx.slice(0, -1).reverse(), gEdge), "f"];
        this.rectangularWall(x, h, e, {callback: [this.xHoles.bind(this)], move: "right", label: "bottom"});
        this.rectangularWall(y, h, "FFbF", {callback: [this.yHoles.bind(this)], move: "up", label: "left"});
        this.rectangularWall(y, h, "FFbF", {callback: [this.yHoles.bind(this)], label: "right"});
        this.rectangularWall(x, h, "Ffef", {callback: [this.xHoles.bind(this)], move: "left", label: "top"});
        this.rectangularWall(y, h, "FFBF", {move: "up only"});
        this.rectangularWall(x, y, "ffff", {callback: [this.xSlots.bind(this), this.ySlots.bind(this), this.addMount.bind(this)], move: "right", label: "back"});
        for (let i = 0; i < (this.sx.length - 1); i += 1) {
            e = [new edges.SlottedEdge(this, this.sy, "f"), "f", "B", "f"];
            this.rectangularWall(y, this.hi, e, {move: "up", label: `inner vertical ${i + 1}`});
        }
        for (let i = 0; i < (this.sy.length - 1); i += 1) {
            e = [new edges.SlottedEdge(this, this.sx, gEdgeSmall), "F", "e", "F"];
            this.rectangularWall(x, this.hi, e, {move: "up", label: `inner horizontal ${i + 1}`});
        }
        for (let i = 0; i < this.sy.length; i += 1) {
            e = [new edges.SlottedEdge(this, this.sx, gEdgeSmall), "F", "e", "F"];
            this.rectangularWall(x, ((this.sy[i] * this.front) * (2 ** 0.5)), e, {callback: [this.frontHoles(i).bind(this)], move: "up", label: `retainer ${i + 1}`});
        }
    }

}

export { BinTray };