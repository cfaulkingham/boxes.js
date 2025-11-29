const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class JigsawPuzzle extends Boxes {
    constructor() {
        super();
        this.count = 0;
        this.argparser.add_argument("--size", {action: "store", type: "float", default: 100, help: "size of the puzzle in mm"});
        this.argparser.add_argument("--depth", {action: "store", type: "int", default: 5, help: "depth of the recursion/level of detail"});
    }

    peano(level) {
        if (level === 0) {
            this.edge((this.size / this.depth));
            return;
        }
        this.peano(this, (level - 1));
        this.corner();
    }

    edge(l) {
        this.count += 1;
        Boxes.edge(this, l);
    }

    hilbert(level, parity) {
        if (level === 0) {
            return;
        }
        this.corner((parity * 90));
        this.hilbert((level - 1), -parity);
        this.edge((this.size / (2 ** this.depth)));
        this.corner((parity * -90));
        this.hilbert((level - 1), parity);
        this.edge((this.size / (2 ** this.depth)));
        this.hilbert((level - 1), parity);
        this.corner((parity * -90));
        this.edge((this.size / (2 ** this.depth)));
        this.hilbert((level - 1), -parity);
        this.corner((parity * 90));
    }

    render() {
        let size = this.size;
        let t = this.thickness;
        this.burn = 0.0;
        this.moveTo(10, 10);
        this.hilbert(this.depth);
    }

}

module.exports.JigsawPuzzle = JigsawPuzzle;