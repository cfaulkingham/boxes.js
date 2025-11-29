const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class Tetris extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.argparser.add_argument("--blocksize", {action: "store", type: "float", default: 40.0, help: "size of a square"});
        this.argparser.add_argument("--shape", {action: "store", type: "str", default: "L", choices: ["I", "L", "O", "S", "T"], help: "shape of the piece"});
    }

    cb(nr) {
        let t = this.thickness;
        let s = this.blocksize;
        this.ctx.stroke();
        this.set_source_color(Color.ETCHING);
        if (nr === 0) {
            if ("LT".includes(this.shape)) {
                for (let i = 1; i < 3; i += 1) {
                    this.ctx.save();
                    this.moveTo(((s * i) - t), 0, 90);
                    this.edge((s - (2 * t)));
                    this.ctx.restore();
                }
                if (this.shape === "L") {
                    this.moveTo((s * 2), (s - t), 0);
                }
                else {
                    this.moveTo(s, (s - t), 0);
                }
                this.edge((s - (2 * t)));
            }
            if (this.shape === "I") {
                for (let i = 1; i < 4; i += 1) {
                    this.ctx.save();
                    this.moveTo(((s * i) - t), 0, 90);
                    this.edge((s - (2 * t)));
                    this.ctx.restore();
                }
            }
        }
        if ((this.shape === "S" && [0, 1, 4, 5].includes(nr))) {
            this.moveTo((s - t), 0, 90);
            this.edge((s - (2 * t)));
        }
        if (this.shape === "O") {
            this.moveTo((s - t), 0, 90);
            this.edge((s - t));
        }
        this.ctx.stroke();
    }

    render() {
        let t = this.thickness;
        let s = this.blocksize;
        if (this.shape === "L") {
            let borders = [((3 * s) - (2 * t)), 90, ((2 * s) - (2 * t)), 90, (s - (2 * t)), 90, s, -90, (2 * s), 90, (s - (2 * t)), 90];
        }
        else {
            if (this.shape === "I") {
                borders = ([((4 * s) - (2 * t)), 90, (s - (2 * t)), 90] * 2);
            }
            else {
                if (this.shape === "S") {
                    borders = ([((2 * s) - (2 * t)), 90, s, -90, s, 90, (s - (2 * t)), 90] * 2);
                }
                else {
                    if (this.shape === "O") {
                        borders = ([((2 * s) - (2 * t)), 90] * 4);
                    }
                    else {
                        if (this.shape === "T") {
                            borders = [90, (s - (2 * t)), 90, s, -90, s, 90];
                            borders = ((([((3 * s) - (2 * t))] + borders) + [(s - (2 * t))]) + list(reversed(borders)));
                        }
                    }
                }
            }
        }
        this.polygonWall({borders: borders, callback: this.cb, move: "right"});
        this.polygonWall({borders: borders, callback: this.cb, move: "mirror right"});
        this.polygonWalls({borders: borders, h: (s - (2 * t))});
    }

}

module.exports.Tetris = Tetris;