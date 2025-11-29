const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');
const { _WallMountedBox } = require('../walledges');

class WallCaliper extends _WallMountedBox {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--width", {action: "store", type: "float", default: 18.0, help: "width of the long end"});
        this.argparser.add_argument("--height", {action: "store", type: "float", default: 6.0, help: "height of the body"});
    }

    side(move) {
        let t = this.thickness;
        let h = this.h;
        let hc = this.height;
        let tw = ((this.edges["b"].spacing() + hc) + (6 * t));
        if (this.move(tw, h, move, true)) {
            return;
        }
        this.moveTo(this.edges["b"].margin());
        this.polyline(((this.edges["b"].startwidth() + (4 * t)) + hc), [90, (2 * t)], ((h / 2) - (2 * t)), [180, (1.5 * t)], (0.25 * h), -90, hc, -90, ((0.75 * h) - (2 * t)), [90, (2 * t)], (2 * t), 90);
        this.edges["b"](h);
        this.move(tw, h, move);
    }

    render() {
        this.generateWallEdges();
        let t = this.thickness;
        let h = this.h;
        this.side({move: "right"});
        this.side({move: "right"});
        let w = this.width;
        this.flangedWall(w, h, {flanges: [0, (2 * t), 0, (2 * t)], edges: "eeee", r: (2 * t), callback: [() => [this.wallHolesAt((1.5 * t), 0, h, 90), this.wallHolesAt((w + (2.5 * t)), 0, h, 90)]]});
    }

}

module.exports.WallCaliper = WallCaliper;