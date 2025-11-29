const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class FlexTest extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FlexSettings);
        // this.buildArgParser("x", "y");
    }

    render() {
        let x;
        let y;
        [x, y] = [this.x, this.y];
        this.moveTo(5, 5);
        this.edge(10);
        this.edges["X"](x, y);
        this.edge(10);
        this.corner(90);
        this.edge(y);
        this.corner(90);
        this.edge((x + 20));
        this.corner(90);
        this.edge(y);
        this.corner(90);
    }

}

module.exports.FlexTest = FlexTest;