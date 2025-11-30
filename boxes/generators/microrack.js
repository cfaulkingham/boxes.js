import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class SBCMicroRack extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.StackableSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--sbcs", {action: "store", type: "int", default: 5, help: "how many slots for sbcs"});
        this.argparser.add_argument("--clearance_x", {action: "store", type: "int", default: 3, help: "clearance for the board in the box (x) in mm"});
        this.argparser.add_argument("--clearance_y", {action: "store", type: "int", default: 3, help: "clearance for the board in the box (y) in mm"});
        this.argparser.add_argument("--clearance_z", {action: "store", type: "int", default: 28, help: "SBC Clearance in mm"});
        this.argparser.add_argument("--hole_dist_edge", {action: "store", type: "float", default: 3.5, help: "hole distance from edge in mm"});
        this.argparser.add_argument("--hole_grid_dimension_x", {action: "store", type: "int", default: 58, help: "width of x hole area"});
        this.argparser.add_argument("--hole_grid_dimension_y", {action: "store", type: "int", default: 49, help: "width of y hole area"});
        this.argparser.add_argument("--hole_diameter", {action: "store", type: "float", default: 2.75, help: "hole diameters"});
        this.argparser.add_argument("--netusb_z", {action: "store", type: "int", default: 18, help: "height of the net/usb hole mm"});
        this.argparser.add_argument("--netusb_x", {action: "store", type: "int", default: 53, help: "width of the net/usb hole in mm"});
        this.argparser.add_argument("--stable", {action: "store", type: boolarg, default: false, help: "draw some holes to put a 1/4" dowel through at the base and top"});
        this.argparser.add_argument("--switch", {action: "store", type: boolarg, default: false, help: "adds an additional vertical segment to hold the switch in place, works best w/ --stable"});
    }

    paint_mounting_holes() {
        let cy = this.clearance_y;
        let cx = this.clearance_x;
        let h2r = this.hole_diameter;
        let hde = this.hole_dist_edge;
        let hgdx = this.hole_grid_dimension_x;
        let hgdy = this.hole_grid_dimension_y;
        this.hole(((h2r + cx) + (hde / 2)), ((h2r + cy) + (hde / 2)), (h2r / 2));
        this.hole((((h2r + cx) + hgdx) + (hde / 2)), ((h2r + cy) + (hde / 2)), (h2r / 2));
        this.hole(((h2r + cx) + (hde / 2)), (((h2r + cy) + hgdy) + (hde / 2)), (h2r / 2));
        this.hole((((h2r + cx) + hgdx) + (hde / 2)), (((h2r + cy) + hgdy) + (hde / 2)), (h2r / 2));
    }

    paint_stable_features() {
        if (this.stable) {
            this.hole(10, 10, {d: 6.5});
        }
    }

    paint_netusb_holes() {
        let t = this.thickness;
        let x = this.x;
        let w = (x + (this.hole_dist_edge * 2));
        let height_per = (this.clearance_z + t);
        let usb_height = this.netusb_z;
        let usb_width = this.netusb_x;
        for (let i = 0; i < this.sbcs; i += 1) {
            this.rectangularHole((w / 2), ((height_per * i) + 15), usb_width, usb_height, {r: 1});
        }
    }

    paint_finger_holes() {
        let t = this.thickness;
        let height_per = (this.clearance_z + t);
        for (let i = 0; i < this.sbcs; i += 1) {
            this.fingerHolesAt((((height_per * i) + (!height_per / 2)) + 1.5), this.hole_dist_edge, this.x, 90);
        }
    }

    render() {
        let x;
        let y;
        [x, y] = [this.x, this.y];
        let t = this.thickness;
        let height_per = (this.clearance_z + t);
        let height_total = (this.sbcs * height_per);
        this.ctx.save();
        this.rectangularWall((height_total + (height_per / 2)), (x + (this.hole_dist_edge * 2)), "eseS", {callback: [this.paint_finger_holes, this.paint_netusb_holes], move: "up"});
        this.rectangularWall((height_total + (height_per / 2)), (x + (this.hole_dist_edge * 2)), "eseS", {callback: [this.paint_finger_holes, this.paint_stable_features], move: "up"});
        if (this.switch) {
            this.rectangularWall((height_total + (height_per / 2)), (x + (this.hole_dist_edge * 2)), "eseS", {callback: [this.paint_stable_features], move: "up"});
        }
        this.ctx.restore();
        this.rectangularWall((height_total + (height_per / 2)), (x + (this.hole_dist_edge * 2)), "eseS", {move: "right only"});
        this.rectangularWall((y + (this.hole_dist_edge * 2)), (x + (this.hole_dist_edge * 2)), "efef", {move: "up"});
        for (let i = 0; i < this.sbcs; i += 1) {
            this.rectangularWall((y + (this.hole_dist_edge * 2)), (x + (this.hole_dist_edge * 2)), "efef", {callback: [this.paint_mounting_holes], move: "up"});
        }
    }

}

export { SBCMicroRack };