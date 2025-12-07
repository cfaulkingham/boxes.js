import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class HalfBox extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings, {finger: 2.0, space: 2.0});
        this.addSettingsArgs(edges.MountingSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--Clamping", {action: "store", type: boolarg, default: false, help: "add clamping holes"});
        this.argparser.add_argument("--ClampingSize", {action: "store", type: "float", default: 25.0, help: "diameter of clamping holes"});
        this.argparser.add_argument("--Mounting", {action: "store", type: boolarg, default: false, help: "add mounting holes"});
        this.argparser.add_argument("--Sturdy", {action: "store", type: boolarg, default: false, help: "create sturdy construction (e.g. shelf, clamping jig, ...)"});
    }

    polygonWallExt(borders, edge, turtle, callback, move) {
        for (let i = 0; i < borders.length; i += 4) {
            this.cc(callback, i);
            let length = borders[i];
            let next_angle = borders[(i + 1)];
            let next_radius = borders[(i + 2)];
            let next_edge = borders[(i + 3)];
            let e = this.edges.get(next_edge, next_edge);
            if (i === 0) {
                this.moveTo(0, e.margin(), 0);
            }
            e(length);
            if (this.debug) {
                this.hole(0, 0, 1, {color: Color.ANNOTATIONS});
            }
            this.corner(next_angle, {tabs: 0, radius: next_radius});
        }
    }

    xHoles() {
        let posy = (-0.5 * this.thickness);
        for (let y of this.sy.slice(0, -1)) {
            posy += (y + this.thickness);
            this.fingerHolesAt(posy, 0, this.x);
        }
    }

    hHoles() {
        let posy = (-0.5 * this.thickness);
        for (let y of reversed(this.sy.slice(1))) {
            posy += (y + this.thickness);
            this.fingerHolesAt(posy, 0, this.h);
        }
    }

    render() {
        let x;
        let h;
        [x, h] = [this.x, this.h];
        let d = this.ClampingSize;
        let t = this.thickness;
        let l = Math.sqrt(((x * x) + (h * h)));
        let b = (Math.sin((x / l)) * 180 / Math.PI);
        let c = (Math.sin((h / l)) * 180 / Math.PI);
        if (x > h) {
            if (((90 + b) + c) < 179) {
                b = (180 - b);
            }
        }
        else {
            if (((90 + b) + c) < 179) {
                c = (180 - c);
            }
        }
        let h1 = (((2 * t) / x) * h);
        let l1 = (((2 * t) / x) * l);
        let x2 = (((2 * t) / h) * x);
        let l2 = (((2 * t) / h) * l);
        if (this.Sturdy) {
            let width = (this.sy.reduce((a, b) => a + b, 0) + ((this.sy.length - 1) * t));
            this.rectangularWall(x, width, "fffe", {callback: [null, this.xHoles, null, null], move: "right", label: "bottom"});
            this.rectangularWall(h, width, (this.Mounting ? "fGfF" : "fefF"), {callback: [null, null, null, this.hHoles], move: "up", label: "back"});
            this.rectangularWall(x, width, "fffe", {callback: [null, this.xHoles, null, null], move: "left only", label: "invisible"});
            for (let i = 0; i < 2; i += 1) {
                this.move((((x + x2) + (2 * t)) + this.edges["f"].margin()), (((h + h1) + (2 * t)) + this.edges["f"].margin()), "right", true, {label: ("side " + str(i))});
                this.polygonWallExt({borders: [x2, 0, 0, "e", x, 0, 0, "h", (2 * t), 90, 0, "e", (2 * t), 0, 0, "e", h, 0, 0, "h", h1, (180 - b), 0, "e", ((l + l1) + l2), (180 - c), 0, "e"]});
                if (this.Clamping) {
                    this.hole(0, 0, 1, {color: Color.ANNOTATIONS});
                    this.rectangularHole(((x / 2) + x2), ((2 * t) + (d / 2)), {dx: d, dy: d, r: (d / 8)});
                    this.rectangularHole(((((x + x2) + (2 * t)) - (2 * t)) - (d / 2)), ((h / 2) + (2 * t)), {dx: d, dy: d, r: (d / 8)});
                }
                this.move((((x + x2) + (2 * t)) + this.edges["f"].margin()), (((h + h1) + (2 * t)) + this.edges["f"].margin()), "right", false, {label: ("side " + str(i))});
            }
            if (this.sy.length > 1) {
                for (let i = 0; i < (this.sy.length - 1); i += 1) {
                    this.move((x + this.edges["f"].margin()), (h + this.edges["f"].margin()), "right", true, {label: ("support " + str(i))});
                    this.polygonWallExt({borders: [x, 90, 0, "f", h, (180 - b), 0, "f", l, (180 - c), 0, "e"]});
                    if (this.Clamping) {
                        this.rectangularHole((x / 2), ((d / 2) - (t / 2)), {dx: d, dy: (d + t), r: (d / 8)});
                        this.rectangularHole(((x - (d / 2)) + (t / 2)), (h / 2), {dx: (d + t), dy: d, r: (d / 8)});
                    }
                    this.move((x + this.edges["f"].margin()), (h + this.edges["f"].margin()), "right", false, {label: ("support " + str(i))});
                }
            }
        }
        else {
            this.sy.insert(0, 0);
            this.sy.append(0);
            width = (this.sy.reduce((a, b) => a + b, 0) + ((this.sy.length - 1) * t));
            this.rectangularWall(x, width, "efee", {callback: [null, this.xHoles, null, null], move: "right", label: "bottom"});
            this.rectangularWall(h, width, (this.Mounting ? "eGeF" : "eeeF"), {callback: [null, null, null, this.hHoles], move: "up", label: "side"});
            this.rectangularWall(x, width, "efee", {callback: [null, this.xHoles, null, null], move: "left only", label: "invisible"});
            for (let i = 0; i < (this.sy.length - 1); i += 1) {
                this.move((x + this.edges["f"].margin()), (h + this.edges["f"].margin()), "right", true, {label: ("support " + str(i))});
                this.polygonWallExt({borders: [x, 90, 0, "f", h, (180 - b), 0, "f", l, (180 - c), 0, "e"]});
                if (this.Clamping) {
                    this.rectangularHole((x / 2), (d / 2), {dx: d, dy: d, r: (d / 8)});
                    this.rectangularHole((x - (d / 2)), (h / 2), {dx: d, dy: d, r: (d / 8)});
                }
                this.move((x + this.edges["f"].margin()), (h + this.edges["f"].margin()), "right", false, {label: ("support " + str(i))});
            }
        }
    }

}

export { HalfBox };