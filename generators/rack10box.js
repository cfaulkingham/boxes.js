const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');
const { Rack19Box } = require('./rack19box');

class Rack10Box extends Rack19Box {
    render() {
        this._render({type: 10});
    }

}

module.exports.Rack10Box = Rack10Box;