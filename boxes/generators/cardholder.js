const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class CardHolder extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.StackableSettings);
        this.addSettingsArgs(edges.GroovedSettings);
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 1.0});
        // this.buildArgParser();
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 7.5, help: "backward angle of floor"});
        this.argparser.add_argument("--stackable", {action: "store", type: boolarg, default: true, help: "make holders stackable"});
    }

    side() {
        let t = this.thickness;
        let a = (this.angle * Math.PI / 180);
        let pos_y = (this.y - abs(((0.5 * t) * Math.sin(a))));
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
        this.edges["f"](y);
        this.polyline(0, (90 - a), ((h - t) - (y * Math.sin((a * Math.PI / 180)))), 90, (y * Math.cos((a * Math.PI / 180))), 90);
        this.edges["f"]((h - t));
        this.move(tw, th, move);
    }

    render() {
        let sx;
        let y;
        [sx, y] = [this.sx, this.y];
        let t = this.thickness;
        let bottom = (this.stackable ? "š" : "e");
        let top = (this.stackable ? "S" : "e");
        if (this.outside) {
        }
        else {
        }
        this.rectangularWall(y, h, [bottom, "F", top, "e"], {ignore_widths: [1, 6], callback: [this.side], move: "up"});
        this.rectangularWall(y, h, [bottom, "F", top, "e"], {ignore_widths: [1, 6], callback: [this.side], move: "up mirror"});
        let nx = sx.length;
        let f_lengths = [];
        for (let val of this.sx) {
            f_lengths.append(val);
            f_lengths.append(t);
        }
        f_lengths = f_lengths.slice(0, -1);
        let frontedge = edges.CompoundEdge(this, unknown.join(("z" * nx)), f_lengths);
        this.rectangularWall(x, y, [frontedge, "f", "e", "f"], {callback: [this.fingerHoleCB(y)], move: "up"});
        this.rectangularWall(x, h, (((bottom + "f") + top) + "f"), {ignore_widths: [1, 6], callback: [this.fingerHoleCB((h - t), t)], move: "up"});
        for (let i = 0; i < (nx - 1); i += 1) {
            this.middleWall({move: "right"});
        }
    }

}

module.exports.CardHolder = CardHolder;