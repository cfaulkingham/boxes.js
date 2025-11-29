const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');
const { _WallMountedBox } = require('../walledges');

class WallPliersHolder extends _WallMountedBox {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 45, help: "bracing angle - less for more bracing"});
    }

    brace(h, d, a, outside, move) {
        let t = this.thickness;
        let tw = ((d + this.edges["b"].spacing()) + this.edges["f"].spacing());
        let th = this.h_t;
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(this.edges["b"].spacing());
        let r = (d / 4);
        let l = (((d + t) - r) / Math.sin((a * Math.PI / 180)));
        if (outside) {
            this.polyline(t, [(90 - a), r], l, [a, r]);
            this.edges["h"](h);
            this.polyline(0, 90, (d + (2 * t)), 90);
        }
        else {
            this.polyline(0, [(90 - a), r], l, [a, r], 0, 90, t, -90);
            this.edges["f"](h);
            this.polyline(0, 90, d, 90);
        }
        this.edges["b"](((h + (((d + t) - r) * Math.tan(((90 - a) * Math.PI / 180)))) + r));
        this.polyline(0, 90);
        this.move(tw, th, move);
    }

    frontCB() {
        let t = this.thickness;
        let posx = -t;
        for (let dx of this.sx.slice(0, -1)) {
            posx += (dx + t);
            this.fingerHolesAt(posx, 0, this.h, 90);
        }
    }

    backCB() {
        let t = this.thickness;
        let posx = -t;
        for (let dx of this.sx.slice(0, -1)) {
            posx += (dx + t);
            this.wallHolesAt(posx, 0, this.h_t, 90);
        }
    }

    render() {
        this.generateWallEdges();
        if (this.outside) {
            this.sx = this.adjustSize(this.sx);
        }
        let sx;
        let y;
        let h;
        [sx, y, h] = [this.sx, this.y, this.h];
        let t = this.thickness;
        let r = (y / 4);
        this.h_t = ((h + (((y + t) - r) * Math.tan(((90 - this.angle) * Math.PI / 180)))) + r);
        this.rectangularWall((sx.reduce((a, b) => a + b, 0) + ((sx.length - 1) * t)), h, "efef", {callback: [this.frontCB], move: "up"});
        this.rectangularWall((sx.reduce((a, b) => a + b, 0) + ((sx.length - 1) * t)), this.h_t, "eCec", {callback: [this.backCB], move: "up"});
        for (let i = 0; i < (sx.length + 1); i += 1) {
            this.brace(h, y, this.angle, i < 2, {move: "right"});
        }
    }

}

module.exports.WallPliersHolder = WallPliersHolder;