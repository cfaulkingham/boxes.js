const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');
const { _WallMountedBox } = require('../walledges');

class WallConsole extends _WallMountedBox {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--top_depth", {action: "store", type: "float", default: 50, help: "depth at the top"});
        this.argparser.add_argument("--bottom_depth", {action: "store", type: "float", default: 35, help: "depth at the bottom"});
    }

    backHoles() {
        let posx = (-0.5 * this.thickness);
        for (let x of this.sx.slice(0, -1)) {
            posx += (x + this.thickness);
            this.wallHolesAt(posx, 0, this.h, 90);
        }
    }

    frontHoles() {
        let posx = (-0.5 * this.thickness);
        for (let x of this.sx.slice(0, -1)) {
            posx += (x + this.thickness);
            this.fingerHolesAt(posx, 0, this.front, 90);
        }
    }

    render() {
        this.generateWallEdges();
        if (this.outside) {
            this.sx = this.adjustSize(this.sx);
            this.h = this.adjustSize(this.h);
        }
        let x = (this.sx.reduce((a, b) => a + b, 0) + (this.thickness * (this.sx.length - 1)));
        let h = this.h;
        let td = this.top_depth;
        let bd = this.bottom_depth;
        this.front = (((h ** 2) + ((td - bd) ** 2)) ** 0.5);
        this.rectangularWall(x, h, "eCec", {callback: [this.backHoles], move: "up"});
        this.rectangularWall(x, this.front, "eFeF", {callback: [this.frontHoles], move: "up"});
        for (let i = 0; i < (this.sx.length + 1); i += 1) {
            this.trapezoidWall(h, td, bd, "befe", {move: "up"});
        }
    }

}

module.exports.WallConsole = WallConsole;