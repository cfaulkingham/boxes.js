import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class BinFrontEdge extends edges.BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "B";
    }
    
    draw(length, kw={}) {
        // Access settings from the parent BinTray instance (passed as settings)
        let f = this.settings.front || 0.4;
        let sy = this.settings.sy || [50, 50];
        let hi = this.settings.hi || 30;
        let thickness = this.boxes.thickness;
        
        let a1 = (Math.atan((f / (1 - f))) * 180 / Math.PI);
        let a2 = (45 + a1);
        this.boxes.corner(-a1);
        for (let i = 0; i < sy.length; i++) {
            let l = sy[i];
            this.boxes.edges["e"].draw((l * (((f ** 2) + ((1 - f) ** 2)) ** 0.5)));
            this.boxes.corner(a2);
            this.boxes.edges["f"].draw(((l * f) * (2 ** 0.5)));
            if (i < (sy.length - 1)) {
                if (this.char === "B") {
                    this.boxes.polyline(0, 45, (0.5 * hi), -90, thickness, -90, (0.5 * hi), (90 - a1));
                }
                else {
                    this.boxes.polyline(0, -45, thickness, -a1);
                }
            }
            else {
                this.boxes.corner(-45);
            }
        }
    }

    margin() {
        let sy = this.settings.sy || [50, 50];
        let f = this.settings.front || 0.4;
        return (Math.max(...sy) * f);
    }

}

export { BinFrontEdge };

class BinFrontSideEdge extends BinFrontEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "b";
    }
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
        
        // Initialize front if not provided
        if (!this.front) {
            this.front = 0.4; // Default 40% of bin height covered with slope
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
            this.h = this.adjustSize(this.h, false); // e2=False in Python
        }
        let x = (this.sx.reduce((a, b) => a + b, 0) + (this.thickness * (this.sx.length - 1)));
        let y = (this.sy.reduce((a, b) => a + b, 0) + (this.thickness * (this.sy.length - 1)));
        let h = this.h;
        let hi = this.hi = h; // Set hi = h as in Python
        let t = this.thickness;
        this.front = Math.min(this.front, 0.999);
        
        this.addPart(new BinFrontEdge(this, this));
        this.addPart(new BinFrontSideEdge(this, this));
        
        // Create new angled finger joint settings (equivalent to copy.deepcopy + setValues)
        let angledsettings = new edges.FingerJointSettings(this.thickness, true, {angle: 45});
        const gEdges = angledsettings.edgeObjects(this, {chars: "gGH"});
        const gEdge = gEdges[1]; // "G" edge (index 1 in "gGH")
        const gEdgeSmall = gEdges[0]; // "g" edge (index 0 in "gGH")
        
        // outer walls
        let e = ["F", "f", new edges.SlottedEdge(this, [...this.sx].reverse(), gEdge), "f"];
        this.rectangularWall(x, h, e, {callback: [this.xHoles.bind(this)], move: "right", label: "bottom"});
        this.rectangularWall(y, h, "FFbF", {callback: [this.yHoles.bind(this)], move: "up", label: "left"});
        this.rectangularWall(y, h, "FFbF", {callback: [this.yHoles.bind(this)], move: "", label: "right"});
        this.rectangularWall(x, h, "Ffef", {callback: [this.xHoles.bind(this)], move: "left", label: "top"});
        this.rectangularWall(y, h, "FFBF", {move: "up only"});
        
        // floor
        this.rectangularWall(x, y, "ffff", {callback: [this.xSlots.bind(this), this.ySlots.bind(this), this.addMount.bind(this)], move: "right", label: "back"});
        
        // Inner walls - vertical
        for (let i = 0; i < (this.sx.length - 1); i += 1) {
            e = [new edges.SlottedEdge(this, this.sy, "f"), "f", "B", "f"];
            this.rectangularWall(y, hi, e, {move: "up", label: `inner vertical ${i + 1}`});
        }
        
        // Inner walls - horizontal
        for (let i = 0; i < (this.sy.length - 1); i += 1) {
            e = [new edges.SlottedEdge(this, this.sx, "f", 0.5 * hi), "f",
                 new edges.SlottedEdge(this, [...this.sx].reverse(), gEdge), "f"];
            this.rectangularWall(x, hi, e, {move: "up", label: `inner horizontal ${i + 1}`});
        }
        
        // Front walls
        for (let i = 0; i < this.sy.length; i += 1) {
            e = [new edges.SlottedEdge(this, this.sx, gEdgeSmall), "F", "e", "F"];
            this.rectangularWall(x, ((this.sy[i] * this.front) * (2 ** 0.5)), e, {callback: [this.frontHoles(i).bind(this)], move: "up", label: `retainer ${i + 1}`});
        }
    }

}

export { BinTray };