import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

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
        let border;
        if (this.shape === "ellipse") {
            // Ellipse border points
            let steps = 36;
            border = [];
            for (let i = 0; i < steps; i++) {
                let angle = (2 * Math.PI * i) / steps;
                border.push([(x/2) + (x/2) * Math.cos(angle), (y/2) + (y/2) * Math.sin(angle)]);
            }
        }
        else {
            if (this.shape === "oval") {
                let r = (Math.min(x, y) / 2);
                let dx = Math.max((x - y), 0);
                let dy = Math.max((y - x), 0);
                // Oval border: two semicircles connected by straight lines
                let steps = 18;
                border = [];
                for (let i = 0; i <= steps; i++) {
                    let angle = Math.PI * i / steps;
                    border.push([r + dx/2 + r * Math.cos(angle + Math.PI/2), r + r * Math.sin(angle + Math.PI/2)]);
                }
                for (let i = 0; i <= steps; i++) {
                    let angle = Math.PI * i / steps;
                    border.push([r + dx/2 + r * Math.cos(angle - Math.PI/2), y - r + r * Math.sin(angle - Math.PI/2)]);
                }
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

export { HolePattern };