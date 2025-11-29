const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class PaintStorage extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.StackableSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--canheight", {action: "store", type: "int", default: 50, help: "Height of the paintcans"});
        this.argparser.add_argument("--candiameter", {action: "store", type: "int", default: 30, help: "Diameter of the paintcans"});
        this.argparser.add_argument("--minspace", {action: "store", type: "int", default: 10, help: "Minimum space between the paintcans"});
        this.argparser.add_argument("--additional_bottom", {action: "store", type: boolarg, default: false, help: "Additional bottom/floor with holes the paintcans go through"});
        this.argparser.add_argument("--additional_top", {action: "store", type: boolarg, default: false, help: "Additional top/floor with holes the paintcans go through"});
        this.argparser.add_argument("--hexpattern", {action: "store", type: boolarg, default: false, help: "Use hexagonal arrangement for the holes instead of orthogonal"});
        this.argparser.add_argument("--drawer", {action: "store", type: boolarg, default: false, help: "Create a stackable drawer instead"});
    }

    paintholes() {;
        if (this.hexpattern) {
            this.moveTo((this.minspace / 2), (this.minspace / 2));
            let settings = this.hexHolesSettings;
            settings.diameter = this.candiameter;
            settings.distance = this.minspace;
            settings.style = "circle";
            this.hexHolesRectangle((this.y - (1 * this.minspace)), (this.x - (1 * this.minspace)), settings);
            return;
        }
        let n_x = parseInt((this.x / (this.candiameter + this.minspace)));
        let n_y = parseInt((this.y / (this.candiameter + this.minspace)));
        if ((n_x <= 0 || n_y <= 0)) {
            return;
        }
        let spacing_x = ((this.x - (n_x * this.candiameter)) / n_x);
        let spacing_y = ((this.y - (n_y * this.candiameter)) / n_y);
        for (let i = 0; i < n_y; i += 1) {
            for (let j = 0; j < n_x; j += 1) {
                this.hole(((i * (this.candiameter + spacing_y)) + ((this.candiameter + spacing_y) / 2)), ((j * (this.candiameter + spacing_x)) + ((this.candiameter + spacing_x) / 2)), (this.candiameter / 2));
            }
        }
    }

    sidesCb() {
        let x;
        let y;
        [x, y] = [this.x, this.y];
        let t = this.thickness;
        let stack = this.edges["s"].settings;
        let h = (((this.canheight - stack.height) - stack.holedistance) + t);
        let hx = ((1 / 2.0) * x);
        let hh = (h / 4.0);
        let hr = (Math.min(hx, hh) / 2);
        if (!this.drawer) {
            this.rectangularHole((h / 3), ((x / 2.0) - t), hh, hx, {r: hr});
            this.fingerHolesAt((((this.canheight / 3) * 2) - (t * 2)), -t, x, 90);
            if (this.additional_bottom) {
                this.fingerHolesAt(((this.canheight / 6) - (t / 2)), -t, x, 90);
            }
            if (this.additional_top) {
                this.fingerHolesAt((this.canheight - ((this.canheight / 6) + t)), -t, x, 90);
            }
        }
        else {
            this.rectangularHole((h / 3), ((x / 2.0) - t), hh, hx, {r: hr});
        }
    }

    render() {
        let x;
        let y;
        [x, y] = [this.x, this.y];
        let t = this.thickness;
        let stack = this.edges["s"].settings;
        let h = (((this.canheight - stack.height) - stack.holedistance) + t);
        let wall_callbacks = [this.sidesCb];
        if (!this.drawer) {
            let wall_keys = "EsES";
            let bottom_keys = "EfEf";
        }
        else {
            wall_keys = "FsFS";
            bottom_keys = "FfFf";
        }
        this.rectangularWall(h, (x - (2 * t)), wall_keys, {ignore_widths: [1, 2, 5, 6], callback: wall_callbacks, move: "up"});
        this.rectangularWall(h, (x - (2 * t)), wall_keys, {ignore_widths: [1, 2, 5, 6], callback: wall_callbacks, move: "right"});
        this.rectangularWall(((0.8 * stack.height) + stack.holedistance), x, "eeee", {move: ""});
        this.rectangularWall(((0.8 * stack.height) + stack.holedistance), x, "eeee", {move: "down right"});
        this.rectangularWall(y, (x - (2 * t)), bottom_keys, {ignore_widths: [1, 2, 5, 6], move: "up"});
        if (!this.drawer) {
            this.rectangularWall(y, x, "efef", {callback: [this.paintholes], move: "up"});
            if (this.additional_bottom) {
                this.rectangularWall(y, x, "efef", {callback: [this.paintholes], move: "up"});
            }
            if (this.additional_top) {
                this.rectangularWall(y, x, "efef", {callback: [this.paintholes], move: "up"});
            }
        }
        else {
            this.rectangularWall(y, h, "efff", {move: "up"});
            this.rectangularWall(y, h, "efff", {move: "up"});
        }
    }

}

module.exports.PaintStorage = PaintStorage;