const { Boxes } = require('../boxes/boxes');
const { FingerJointSettings } = require('../boxes/edges');
const { LidSettings } = require('../boxes/lids');
const { edges } = require('../boxes/edges');
const { _TopEdge } = require('../boxes/lids');
const { Color } = require('../boxes/Color');

class BinFrontEdge extends Boxes {
    __call__(length) {
        let f = this.settings.front;
        let a1 = (Math.atan((f / (1 - f))) * 180 / Math.PI);
        let a2 = (45 + a1);
        this.corner(-a1);
        for (let [i, l] of enumerate(this.settings.sy)) {
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

module.exports.BinFrontEdge = BinFrontEdge;
class BinFrontSideEdge extends BinFrontEdge {
}

module.exports.BinFrontSideEdge = BinFrontSideEdge;
class BinTray extends Boxes {
    constructor() {
        super();
        // this.buildArgParser("sx", "sy", "h", "outside", "hole_dD");
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 0.5});
        this.argparser.add_argument("--front", {action: "store", type: "float", default: 0.4, help: "fraction of bin height covered with slope"});
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
            for (let x of reversed(this.sx)) {
                this.fingerHolesAt(posy, posx, x);
                posx += (x + this.thickness);
            }
        }
    }

    addMount() {
        let ds = this.hole_dD[0];
        if (this.hole_dD.length < 2) {
            let dh = 0;
            let y = Math.max((this.thickness * 1.25), ((this.thickness * 1.0) + ds));
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
        for (let y of reversed(this.sy.slice(1))) {
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
        this.addPart(BinFrontEdge(this, this));
        this.addPart(BinFrontSideEdge(this, this));
        let angledsettings = this.edges["f"].settings;
        angledsettings.setValues(this.thickness, true, {angle: 45});
        angledsettings.edgeObjects(this, {chars: "gGH"});
        let e = ["F", "f", edges.SlottedEdge(this, this.sx.slice(0,  /* step -1 ignored */), "G"), "f"];
        this.rectangularWall(x, h, e, {callback: [this.xHoles], move: "right", label: "bottom"});
        this.rectangularWall(y, h, "FFbF", {callback: [this.yHoles], move: "up", label: "left"});
        this.rectangularWall(y, h, "FFbF", {callback: [this.yHoles], label: "right"});
        this.rectangularWall(x, h, "Ffef", {callback: [this.xHoles], move: "left", label: "top"});
        this.rectangularWall(y, h, "FFBF", {move: "up only"});
        this.rectangularWall(x, y, "ffff", {callback: [this.xSlots, this.ySlots, this.addMount], move: "right", label: "back"});
        for (let i = 0; i < (this.sx.length - 1); i += 1) {
            e = [edges.SlottedEdge(this, this.sy, "f"), "f", "B", "f"];
            this.rectangularWall(y, hi, e, {move: "up", label: ("inner vertical " + str((i + 1)))});
        }
        for (let i = 0; i < (this.sy.length - 1); i += 1) {
            e = [edges.SlottedEdge(this, this.sx, "f"), "f", edges.SlottedEdge(this, this.sx.slice(0,  /* step -1 ignored */), "G"), "f"];
            this.rectangularWall(x, hi, e, {move: "up", label: ("inner horizontal " + str((i + 1)))});
        }
        for (let i = 0; i < this.sy.length; i += 1) {
            e = [edges.SlottedEdge(this, this.sx, "g"), "F", "e", "F"];
            this.rectangularWall(x, ((this.sy[i] * this.front) * (2 ** 0.5)), e, {callback: [this.frontHoles(i)], move: "up", label: ("retainer " + str((i + 1)))});
        }
    }

}

module.exports.BinTray = BinTray;