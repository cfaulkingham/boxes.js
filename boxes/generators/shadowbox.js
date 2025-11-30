import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class Shadowbox extends _TopEdge {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.DoveTailSettings, {angle: 10, depth: 1.5, radius: 0.1, size: 1});
        // this.buildArgParser();
        this.argparser.add_argument("--layers", {action: "store", type: "int", default: 7, help: "the number of paper layers; don't forget the back (blank) layer!"});
        this.argparser.add_argument("--framewidth", {action: "store", type: "float", default: 10, help: "the width of the paper layer frames"});
        this.argparser.add_argument("--frameheight", {action: "store", type: "float", default: 10, help: "the height of the paper layer frames"});
        this.argparser.add_argument("--extraheight", {action: "store", type: "float", default: 20, help: "cumulative height of your paper layers, play between frames, the LED strip, battery/wiring, anything else you want to fit in the case"});
        this.argparser.add_argument("--casejoinery", {action: "store", type: boolarg, default: true, help: "whether or not to join sides to front plate (disable if doing manual joins on fancy wood)"});
        this.argparser.add_argument("--back_edge", {action: "store", type: ArgparseEdgeType("eEfFh"), choices: list("eEfFh"), default: "e", help: "edge type for back edge (and back wall)"});
    }

    render() {
        let x;
        let y;
        [x, y] = [this.x, this.y];
        let t = this.thickness;
        let extraheight = this.extraheight;
        let frameheight = this.frameheight;
        let framewidth = this.framewidth;
        let casejoinery = this.casejoinery;
        let layers = this.layers;
        let height = ((layers * t) + extraheight);
        for (let _ = 0; _ < (2 * layers); _ += 1) {
            this.polygonWall([x, 90, frameheight, 90, framewidth, 0, (x - (framewidth * 2)), 0, framewidth, 90, frameheight, 90], "eeDeDe", {move: "up"});
        }
        for (let _ = 0; _ < (2 * layers); _ += 1) {
            this.rectangularWall((y - (frameheight * 2)), framewidth, "eded", {move: "up"});
        }
        let hypotenuse = Math.sqrt((((frameheight + t) ** 2) + ((framewidth + t) ** 2)));
        let angle = (Math.acos(((framewidth + t) / hypotenuse)) * 180 / Math.PI);
        let edgetypes = (casejoinery ? "eFeeee" : "eeeeee");
        let vframe_poly = [t, 0, y, 0, t, (90 + angle), hypotenuse, (90 - angle), (y - (frameheight * 2)), (90 - angle), hypotenuse, (90 + angle)];
        let hframe_poly = [t, 0, x, 0, t, (180 - angle), hypotenuse, angle, (x - (framewidth * 2)), angle, hypotenuse, (180 - angle)];
        this.polygonWall(vframe_poly, edgetypes, {move: "up"});
        this.polygonWall(vframe_poly, edgetypes, {move: "up"});
        this.polygonWall(hframe_poly, edgetypes, {move: "up"});
        this.polygonWall(hframe_poly, edgetypes, {move: "up"});
        if (casejoinery) {
            let top_edge = "f";
        }
        else {
            top_edge = "e";
        }
        this.rectangularWall(x, height, /* unknown node JoinedStr */, {move: "up"});
        this.rectangularWall(x, height, /* unknown node JoinedStr */, {move: "up"});
        this.rectangularWall(y, height, /* unknown node JoinedStr */, {move: "up"});
        this.rectangularWall(y, height, /* unknown node JoinedStr */, {move: "up"});
        this.rectangularWall((x - (2 * t)), 10, "efef", {move: "up"});
        this.rectangularWall((x - (2 * t)), 10, "efef", {move: "up"});
        this.rectangularWall((y - (2 * t)), 10, "eFeF", {move: "up"});
        this.rectangularWall((y - (2 * t)), 10, "eFeF", {move: "up"});
        this.drawLid(x, y, this.back_edge);
    }

}

export { Shadowbox };