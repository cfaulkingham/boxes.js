const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class DisplayShelf extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--num", {action: "store", type: "int", default: 3, help: "number of shelves"});
        this.argparser.add_argument("--front_wall_height", {action: "store", type: "float", default: 20.0, help: "height of front walls"});
        this.argparser.add_argument("--angle", {action: "store", type: "float", default: 30.0, help: "angle of floors (negative values for slanting backwards)"});
        this.argparser.add_argument("--include_back", {action: "store", type: boolarg, default: false, help: "Include panel on the back of the shelf"});
        this.argparser.add_argument("--include_front", {action: "store", type: boolarg, default: false, help: "Include panel on the front of the shelf (to be used backwards)"});
        this.argparser.add_argument("--include_bottom", {action: "store", type: boolarg, default: false, help: "Include horizontal panel on the bottom of the shelf"});
        this.argparser.add_argument("--slope_top", {action: "store", type: boolarg, default: false, help: "Slope the sides and the top by front wall height"});
        this.argparser.add_argument("--divider_wall_height", {action: "store", type: "float", default: 20.0, help: "height of divider walls"});
        this.argparser.add_argument("--bottom_distance", {action: "store", type: "float", default: 0.0, help: "height below the bottom shelf"});
        this.argparser.add_argument("--top_distance", {action: "store", type: "float", default: 0.0, help: "extra height above the top shelf"});
    }

    generate_finger_holes() {
        let t = this.thickness;
        let a = this.radians;
        let hs = (((this.sl + t) * Math.sin(a)) + (Math.cos(a) * t));
        let b_offs = this.bottom_distance;
        let h = ((this.h - b_offs) - this.top_distance);
        if ((this.slope_top && this.include_bottom)) {
            this.moveTo(0, this.edges["h"].startwidth());
        }
        if (((h - abs(hs)) - ((3 * t) * (this.num - 1))) < 0) {
            ValueError("Need more height to fit shelves")
        }
        for (let i = 0; i < this.num; i += 1) {
            let pos_x = abs(((0.5 * t) * Math.sin(a)));
            let pos_y = (((hs - ((Math.cos(a) * 0.5) * t)) + ((i * (h - abs(hs))) / (this.num - 0.5))) + b_offs);
            if (a < 0) {
                pos_y += (-Math.sin(a) * this.sl);
            }
            this.fingerHolesAt(pos_x, pos_y, this.sl, -this.angle);
            pos_x += ((Math.cos(-a) * (this.sl + (0.5 * t))) + ((Math.sin(a) * 0.5) * t));
            pos_y += ((Math.sin(-a) * (this.sl + (0.5 * t))) + ((Math.cos(a) * 0.5) * t));
            this.fingerHolesAt(pos_x, pos_y, this.front_wall_height, (90 - this.angle));
        }
    }

    generate_sloped_sides(width, height) {
        let top_segment_height = (height / this.num);
        let a = this.radians;
        let vertical_cut = (top_segment_height - this.front_wall_height);
        let hypotenuse = (vertical_cut / Math.sin(a));
        let horizontal_cut = Math.sqrt(((hypotenuse ** 2) - (vertical_cut ** 2)));
        if (horizontal_cut > width) {
            horizontal_cut = (width - 1);
            vertical_cut = (horizontal_cut * Math.tan(a));
            hypotenuse = Math.sqrt(((horizontal_cut ** 2) + (vertical_cut ** 2)));
        }
        let top = (width - horizontal_cut);
        let edges = (this.include_bottom ? "he" : "ee");
        let le = (this.include_bottom ? this.edges["h"].startwidth() : this.edges["e"].startwidth());
        edges += (this.include_front ? "f" : "e");
        edges += (this.include_back ? "eefe" : "eeee");
        let borders = [width, 90, le, 0, front, (90 - this.angle), hypotenuse, this.angle, top, 90, height, 0, le, 90];
        this.polygonWall(borders, {edge: edges, callback: [this.generate_finger_holes], move: "up", label: "left side"});
        this.polygonWall(borders, {edge: edges, callback: [this.generate_finger_holes], move: "up", label: "right side"});
    }

    generate_rectangular_sides(width, height) {
        let edges = (this.include_bottom ? "h" : "e");
        edges += (this.include_front ? "fe" : "ee");
        edges += (this.include_back ? "f" : "e");
        this.rectangularWall(width, height, edges, {callback: [this.generate_finger_holes], move: "up", label: "left side"});
        this.rectangularWall(width, height, edges, {callback: [this.generate_finger_holes], move: "up", label: "right side"});
    }

    generate_shelve_finger_holes() {
        let t = this.thickness;
        let pos_x = (-0.5 * t);
        for (let x of this.sx.slice(0, -1)) {
            pos_x += (x + t);
            this.fingerHolesAt(pos_x, 0, this.sl, 90);
        }
    }

    generate_front_lip_finger_holes() {
        let t = this.thickness;
        let height = this.front_wall_height;
        if (this.divider_wall_height < height) {
            height = this.divider_wall_height;
        }
        let pos_x = (-0.5 * t);
        for (let x of this.sx.slice(0, -1)) {
            pos_x += (x + t);
            this.fingerHolesAt(pos_x, 0, height, 90);
        }
    }

    generate_shelves() {
        if (this.front_wall_height) {
            for (let i = 0; i < this.num; i += 1) {
                this.rectangularWall(this.x, this.sl, "ffef", {callback: [this.generate_shelve_finger_holes], move: "up", label: /* unknown node JoinedStr */});
                this.rectangularWall(this.x, this.front_wall_height, "Ffef", {callback: [this.generate_front_lip_finger_holes], move: "up", label: /* unknown node JoinedStr */});
            }
        }
        else {
            for (let i = 0; i < this.num; i += 1) {
                this.rectangularWall(this.x, this.sl, "Efef", {callback: [this.generate_shelve_finger_holes], move: "up", label: /* unknown node JoinedStr */});
            }
        }
    }

    generate_dividers() {
        let edges_ = "feee";
        if (this.front_wall_height) {
            edges_ = "ffee";
            if (this.divider_wall_height > this.front_wall_height) {
                edges_ = ["f", edges.CompoundEdge(this, "fe", [this.front_wall_height, (this.divider_wall_height - this.front_wall_height)]), "e", "e"];
            }
        }
        for (let i = 0; i < this.num; i += 1) {
            for (let j = 0; j < (this.sx.length - 1); j += 1) {
                this.rectangularWall(this.sl, this.divider_wall_height, edges_, {move: "up", label: /* unknown node JoinedStr */});
            }
        }
    }

    render() {
        let sx;
        let y;
        let h;
        [sx, y, h] = [this.sx, this.y, this.h];
        let front = this.front_wall_height;
        let thickness = this.thickness;
        if (this.outside) {
            let bottom = (this.include_bottom ? (thickness + this.edges["h"].startwidth()) : true);
        }
        this.sl = (((y - (thickness * (Math.cos(a) + abs(Math.sin(a))))) - Math.max(0, (Math.sin(a) * front))) / Math.cos(a));
        if (this.slope_top) {
            this.generate_sloped_sides(y, h);
        }
        else {
            this.generate_rectangular_sides(y, h);
        }
        this.generate_shelves();
        this.generate_dividers();
        let b = (this.include_bottom ? "h" : "e");
        if (this.include_back) {
            this.rectangularWall(x, h, (b + "FeF"), {label: "back wall", move: "up"});
        }
        if (this.include_front) {
            if (this.slope_top) {
                this.rectangularWall(x, this.front, (b + "FeF"), {label: "front wall", move: "up"});
            }
            else {
                this.rectangularWall(x, h, (b + "FeF"), {label: "front wall", move: "up"});
            }
        }
        if (this.include_bottom) {
            let edges = (this.include_front ? "ff" : "ef");
            edges += (this.include_back ? "ff" : "ef");
            this.rectangularWall(x, y, edges, {label: "bottom wall", move: "up"});
        }
    }

}

module.exports.DisplayShelf = DisplayShelf;