const { Boxes } = require('../boxes/boxes');
const { FingerJointSettings } = require('../boxes/edges');
const { LidSettings } = require('../boxes/lids');
const { edges } = require('../boxes/edges');
const { _TopEdge } = require('../boxes/lids');
const { Color } = require('../boxes/Color');

class AllEdges extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.StackableSettings);
        this.addSettingsArgs(edges.HingeSettings);
        this.addSettingsArgs(edges.SlideOnLidSettings);
        this.addSettingsArgs(edges.ClickSettings);
        this.addSettingsArgs(edges.FlexSettings);
        this.addSettingsArgs(edges.HandleEdgeSettings);
        // this.buildArgParser();
    }

    render() {
        let x = this.x;
        let t = this.thickness;
        let chars = list(this.edges.keys());
        chars.sort({key: (c) => (c.lower() + (c.isupper() ? c : ""))});
        chars.reverse();
        this.moveTo(0, (10 * t));
        for (let c of chars) {
            this.ctx.save();
            this.move(0, 0, "", true);
            this.moveTo(x, 0, 90);
            this.edge((t + this.edges[c].startwidth()));
            this.corner(90);
            this.edges[c](x, {h: (4 * t)});
            this.corner(90);
            this.edge((t + this.edges[c].endwidth()));
            this.move(0, 0, "");
            this.ctx.restore();
            this.moveTo(0, ((3 * t) + this.edges[c].spacing()));
            this.text(/* unknown node JoinedStr */);
            this.moveTo(0, (12 * t));
        }
    }

}

module.exports.AllEdges = AllEdges;