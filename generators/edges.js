const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class Edges extends Boxes {
    constructor() {
        super();
    }

    render() {
        this.ctx = null;
        this._buildObjects();
        let chars = this.edges.keys();
        for (let c of sorted(chars)) {
            console.log(("%s %s - %s" % [c, this.edges[c].__class__.__name__, this.edges[c].__doc__]));
        }
    }

}

module.exports.Edges = Edges;