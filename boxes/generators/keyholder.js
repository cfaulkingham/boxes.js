const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class HangerEdge extends Boxes {
    margin() {
        return (this.hook_height * 0.7);
    }

    __call__(l) {
        let radius_outside = (this.hook_height * 0.5);
        let radius_inside = (radius_outside - this.hook_thickness);
        let radius_burr = 1.5;
        let hookInnerHeight = (this.hook_height * 0.7);
        let hookLength = (this.hook_height * 0.7);
        this.polyline(0, -90);
        this.edge((hookLength - radius_outside));
        this.corner(90, radius_outside);
        this.edge(((hookInnerHeight - radius_outside) - (this.hook_thickness / 2)));
        this.corner(180, (this.hook_thickness / 2));
        this.edge((((hookInnerHeight - this.hook_thickness) - (this.hook_thickness / 2)) - radius_inside));
        this.corner(-90, radius_inside);
        this.edge((((hookLength - this.hook_thickness) - (2 * radius_burr)) - radius_inside));
        this.corner(-90, radius_burr);
        this.edge(((this.hook_height - this.hook_thickness) - (2 * radius_burr)));
        this.corner(90, radius_burr);
        this.polyline(0, -90);
    }

}

module.exports.HangerEdge = HangerEdge;
class KeyHolder extends Boxes {
    constructor() {
        super();
        this.argparser.add_argument("--num_hooks", {action: "store", type: "int", default: 7, help: "Number of hooks"});
        this.argparser.add_argument("--hook_distance", {action: "store", type: "float", default: 20, help: "Distance between hooks"});
        this.argparser.add_argument("--hook_thickness", {action: "store", type: "float", default: 5, help: "Thickness of hook"});
        this.argparser.add_argument("--hook_height", {action: "store", type: "float", default: 20, help: "Height of back part of hook"});
        this.argparser.add_argument("--padding_top", {action: "store", type: "float", default: 10, help: "Padding above hooks"});
        this.argparser.add_argument("--padding_left_right", {action: "store", type: "float", default: 5, help: "Padding left/right from hooks"});
        this.argparser.add_argument("--padding_bot", {action: "store", type: "float", default: 30, help: "Padding below hooks"});
        this.argparser.add_argument("--mounting", {action: "store", type: boolarg, default: false, help: "Add mounting holes"});
        this.addSettingsArgs(edges.FingerJointSettings, {surroundingspaces: 0.0, finger: 1.0, space: 1.0});
        this.addSettingsArgs(edges.MountingSettings);
    }

    yHoles() {;
        let posx = (0.5 * this.thickness);
        posx += this.padding_left_right;
        for (let _ = 0; _ < this.num_hooks; _ += 1) {
            this.fingerHolesAt(posx, this.padding_bot, this.hook_height);
            posx += (this.hook_distance + this.thickness);
        }
    }

    render() {
        this.addPart(HangerEdge(this, 1));
        let h = ((this.hook_height + this.padding_bot) + this.padding_top);
        let w = (((this.padding_left_right * 2) + (this.num_hooks * this.thickness)) + ((this.num_hooks - 1) * this.hook_distance));
        this.rectangularWall(w, h, (this.mounting ? "eeGe" : "eeee"), {callback: [this.yHoles, null, null, null], move: "up"});
        for (let _ = 0; _ < this.num_hooks; _ += 1) {
            this.rectangularWall(this.hook_thickness, this.hook_height, "eHef", {move: "right"});
        }
    }

}

module.exports.KeyHolder = KeyHolder;