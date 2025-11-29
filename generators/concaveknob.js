const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class ConcaveKnob extends Boxes {
    constructor() {
        super();
        this.argparser.add_argument("--diameter", {action: "store", type: "float", default: 50.0, help: "Diameter of the knob (mm)"});
        this.argparser.add_argument("--serrations", {action: "store", type: "int", default: 3, help: "Number of serrations"});
        this.argparser.add_argument("--rounded", {action: "store", type: "float", default: 0.2, help: "Amount of circumference used for non convex parts"});
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 70.0, help: "Angle between convex and concave parts"});
        this.argparser.add_argument("--bolthole", {action: "store", type: "float", default: 6.0, help: "Diameter of the bolt hole (mm)"});
        this.argparser.add_argument("--dhole", {action: "store", type: "float", default: 1.0, help: "D-Flat in fraction of the diameter"});
        this.argparser.add_argument("--hexhead", {action: "store", type: "float", default: 10.0, help: "Width of the hex bolt head (mm)"});
    }

    render() {
        let t = this.thickness;
        this.parts.concaveKnob(this.diameter, this.serrations, this.rounded, this.angle, {callback: () => this.dHole(0, 0), move: "right"});
        this.parts.concaveKnob(this.diameter, this.serrations, this.rounded, this.angle, {callback: () => this.nutHole(this.hexhead), move: "right"});
        this.parts.concaveKnob(this.diameter, this.serrations, this.rounded, this.angle);
    }

}

module.exports.ConcaveKnob = ConcaveKnob;