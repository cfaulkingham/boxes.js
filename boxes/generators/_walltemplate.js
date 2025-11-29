const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');
const { _WallMountedBox } = require('../walledges');

class WallXXX extends _WallMountedBox {
    constructor() {
        super();
        // this.buildArgParser();
        this.argparser.add_argument("--XX", {action: "store", type: "float", default: 0.5, help: "DESCRIPTION"});
        this.argparser.add_argument("--XXX", {action: "store", type: boolarg, default: false, help: "DESCRIPTION"});
    }

    render() {
        this.generateWallEdges();
    }

}

module.exports.WallXXX = WallXXX;