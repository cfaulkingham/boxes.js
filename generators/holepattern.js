const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class HolePattern extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(fillHolesSettings, {fill_pattern: "hex"});
        // this.buildArgParser("x", "y");
        this.argparser.add_argument("--shape", {action: "store", type: "str", default: "rectangle", choices: ["rectangle", "ellipse", "oval", "hexagon", "octagon"], help: "Shape of the hole pattern"});
    }

    render() {
        let x;
        let y;
        [x, y] = [this.x, this.y];
        if (this.shape === "ellipse") {
            let border = /* unknown node ListComp */;
        }
        else {
            if (this.shape === "oval") {
                let r = (Math.min(x, y) / 2);
                let dx = Math.max((x - y), 0);
                let dy = Math.max((y - x), 0);
                border = /* unknown node ListComp */;
            }
            else {
                if (this.shape === "hexagon") {
                    dx = Math.min(((y / (3 ** 0.5)) / 2), (x / 2));
                    border = [[dx, 0], [(x - dx), 0], [x, (0.5 * y)], [(x - dx), y], [dx, y], [0, (0.5 * y)]];
                }
                else {
                    if (this.shape === "octagon") {
                        let d = ((2 ** 0.5) / (2 + (2 * (2 ** 0.5))));
                        let d2 = (1 - d);
                        border = [[(d * x), 0], [(d2 * x), 0], [x, (d * y)], [x, (d2 * y)], [(d2 * x), y], [(d * x), y], [0, (d2 * y)], [0, (d * y)]];
                    }
                    else {
                        border = [[0, 0], [x, 0], [x, y], [0, y]];
                    }
                }
            }
        }
        this.fillHoles({pattern: this.fillHoles_fill_pattern, border: border, max_radius: this.fillHoles_hole_max_radius, hspace: this.fillHoles_space_between_holes, bspace: this.fillHoles_space_to_border, min_radius: this.fillHoles_hole_min_radius, style: this.fillHoles_hole_style, bar_length: this.fillHoles_bar_length, max_random: this.fillHoles_max_random});
    }

}

module.exports.HolePattern = HolePattern;