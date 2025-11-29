const { Boxes } = require('../boxes/boxes');
const { FingerJointSettings } = require('../boxes/edges');
const { LidSettings } = require('../boxes/lids');
const { edges } = require('../boxes/edges');
const { _TopEdge } = require('../boxes/lids');
const { Color } = require('../boxes/Color');
const { _WallMountedBox } = require('../boxes/walledges');

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