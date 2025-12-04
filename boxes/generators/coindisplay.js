import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class CoinHolderSideEdge extends Boxes {
    __call__(length) {
        let a_l = this.coin_plate;
        let a_l2 = (this.settings.coin_plate * Math.sin(this.settings.angle));
        let a = (this.settings.angle * 180 / Math.PI);
        this.corner(-a);
        this.edges["F"].settings.thickness = (this.thickness * 2);
        this.edges["F"](a_l);
        this.edges["F"].settings.thickness = this.thickness;
        this.polyline(0, (90 + a), a_l2, -90);
    }

    margin() {
        return this.settings.coin_plate_x;
    }

}

export { CoinHolderSideEdge };
class CoinDisplay extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser("x", "y", "h", "outside");
        this.argparser.add_argument("--coin_d", {action: "store", type: "float", default: 20.0, help: "The diameter of the coin in mm"});
        this.argparser.add_argument("--coin_plate", {action: "store", type: "float", default: 50.0, help: "The size of the coin plate"});
        this.argparser.add_argument("--coin_showcase_h", {action: "store", type: "float", default: 50.0, help: "The height of the coin showcase piece"});
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 30, help: "The angle that the coin will tilt as"});
    }

    bottomHoles() {;
        this.fingerHolesAt(((((this.x / 2) - this.thickness) - (this.thickness / 2)) - (this.coin_plate / 2)), (((this.y / 2) + (this.coin_plate_x / 2)) - this.thickness), this.coin_plate_x, -90);
        this.fingerHolesAt(((((this.x / 2) - this.thickness) + (this.thickness / 2)) + (this.coin_plate / 2)), (((this.y / 2) + (this.coin_plate_x / 2)) - this.thickness), this.coin_plate_x, -90);
        this.fingerHolesAt((((this.x / 2) - (this.coin_plate / 2)) - this.thickness), (((this.y / 2) - (this.coin_plate_x / 2)) - (this.thickness * 1.5)), this.coin_plate, 0);
    }

    coinCutout() {;
        this.hole((this.coin_plate / 2), (this.coin_plate / 2), (this.coin_d / 2));
    }

    render() {
        let x;
        let y;
        let h;
        [x, y, h] = [this.x, this.y, this.h];
        if (this.outside) {
            x = this.adjustSize(x);
            y = this.adjustSize(y);
            h = this.adjustSize(h);
        }
        let t = this.thickness;
        let d2 = new edges.Bolts(2);
        let d3 = new edges.Bolts(3);
        this.addPart(new CoinHolderSideEdge(this, this));
        this.angle = (this.angle * Math.PI / 180);
        this.coin_plate_x = (this.coin_plate * Math.cos(this.angle));
        this.rectangularWall(x, h, "FFFF", {bedBolts: ([d2] * 4), move: "right", label: "Wall 1"});
        this.rectangularWall(y, h, "FfFf", {bedBolts: [d3, d2, d3, d2], move: "up", label: "Wall 2"});
        this.rectangularWall(y, h, "FfFf", {bedBolts: [d3, d2, d3, d2], label: "Wall 4"});
        this.rectangularWall(x, h, "FFFF", {bedBolts: ([d2] * 4), move: "left up", label: "Wall 3"});
        this.rectangularWall(x, y, "ffff", {bedBolts: [d2, d3, d2, d3], move: "right", label: "Top"});
        this.rectangularWall(x, y, "ffff", {bedBolts: [d2, d3, d2, d3], move: "right", label: "Bottom", callback: [() => this.bottomHoles()]});
        let e = ["f", "f", "B", "e"];
        this.rectangularWall(this.coin_plate_x, this.coin_showcase_h, e, {move: "right", label: "CoinSide1"});
        this.rectangularWall(this.coin_plate_x, this.coin_showcase_h, e, {move: "right", label: "CoinSide2"});
        this.rectangularWall(this.coin_plate, this.coin_plate, "efef", {move: "left down", label: "Coin Plate Base"});
        this.rectangularWall(this.coin_plate, this.coin_plate, "efef", {move: "down", label: "Coin Plate", callback: [() => this.coinCutout()]});
        this.rectangularWall(this.coin_plate, this.coin_showcase_h, "fFeF", {move: "down", label: "CoinSide3"});
    }

}

export { CoinDisplay };