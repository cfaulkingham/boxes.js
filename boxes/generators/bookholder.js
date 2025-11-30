import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class BookHolder extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.argparser.add_argument("--book_width", {action: "store", type: "float", default: 297.0, help: "total width of book stand"});
        this.argparser.add_argument("--book_height", {action: "store", type: "float", default: 210.0, help: "height of the front plate"});
        this.argparser.add_argument("--book_depth", {action: "store", type: "float", default: 40.0, help: "larger sizes for books with more pages"});
        this.argparser.add_argument("--ledge_height", {action: "store", type: "float", default: 0.0, help: "part in front to hold the book open (0 to turn off)"});
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 75.0, help: "degrees between floor and front plate"});
        this.argparser.add_argument("--bottom_support", {action: "store", type: "float", default: 20.0, help: "extra material on bottom to raise book up"});
        this.argparser.add_argument("--back_support", {action: "store", type: "float", default: 50.0, help: "height of additional support in the back (0 to turn off)"});
        this.argparser.add_argument("--radius", {action: "store", type: "float", default: -1.0, help: "radius at the sharp corners (negative for radius=thickness)"});
    }

    sideWall(move) {
        let alpha = this.angle;
        let beta = (90 - alpha);
        let a = (this.book_height * Math.sin((alpha * Math.PI / 180)));
        let b = (this.book_height * Math.sin((beta * Math.PI / 180)));
        let c = (this.book_depth * Math.sin((beta * Math.PI / 180)));
        let d = (this.book_depth * Math.sin((alpha * Math.PI / 180)));
        let max_height_back = ((a + this.bottom_support) + this.radius);
        let max_height_front = ((c + this.bottom_support) + this.radius);
        let total_height = Math.max(max_height_back, max_height_front);
        let offset_s = (Math.sin((alpha * Math.PI / 180)) * this.radius);
        let offset_c = (Math.cos((alpha * Math.PI / 180)) * this.radius);
        let total_width = (((((this.radius + offset_c) + b) + d) + offset_s) + this.radius);
        if (this.move(total_width, total_height, move, true)) {
            return;
        }
        this.polyline(total_width, 90);
        if (this.back_support > 0) {
            let posx = this.bottom_support;
            let posy = (2 * this.thickness);
            this.fingerHolesAt(posx, posy, this.back_support, 0);
        }
        this.polyline(((max_height_back - offset_c) - this.radius), 0);
        this.corner([(90 + alpha), this.radius]);
        this.edges.get(this.book_height);
        this.corner(-90);
        this.edges.get(this.book_depth);
        this.corner([(90 + beta), this.radius]);
        this.polyline(((max_height_front - offset_s) - this.radius), 90);
        this.move(total_width, total_height, move);
    }

    front_ledge(move) {
        let total_height = (this.ledge_height + this.thickness);
        if (this.move(this.width, total_height, move, true)) {
            return;
        }
        this.moveTo(this.radius, 0);
        let h = (total_height - this.radius);
        let w = (this.width - (2 * this.radius));
        this.edges.get(w);
        this.corner([90, this.radius]);
        this.edges.get(h);
        this.corner(90);
        this.edges.get(this.width);
        this.corner(90);
        this.edges.get(h);
        this.corner([90, this.radius]);
        this.move(this.width, total_height, move);
    }

    render() {
        this.width = (this.book_width - (2 * this.thickness));
        if (this.radius < 0) {
            this.radius = this.thickness;
        }
        if (this.back_support > 0) {
            this.rectangularWall(this.width, this.back_support, "efef", {move: "up", label: "back support"});
        }
        let e = "e";
        if (this.ledge_height > 0) {
            this.front_ledge({move: "up"});
            e = "f";
        }
        this.rectangularWall(this.width, this.book_depth, (e + "fFf"), {move: "up", label: "book bottom"});
        this.rectangularWall(this.width, this.book_height, "ffef", {move: "right", label: "book back"});
        this.sideWall({move: "right"});
        this.sideWall({move: "right"});
    }

}

export { BookHolder };