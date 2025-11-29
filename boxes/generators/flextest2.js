const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class FlexTest2 extends Boxes {
    constructor() {
        super();
        // this.buildArgParser("x", "y");
        this.argparser.add_argument("--fw", {action: "store", type: "float", default: 1, help: "distance of flex cuts in multiples of thickness"});
    }

    render() {
        let x;
        let y;
        [x, y] = [this.x, this.y];
        this.rectangularWall(x, y, {callback: [() => this.flex2D(x, y, this.fw)]});
    }

}

module.exports.FlexTest2 = FlexTest2;