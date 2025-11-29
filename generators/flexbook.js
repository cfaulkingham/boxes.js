const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class FlexBook extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        this.addSettingsArgs(edges.FlexSettings);
        // this.buildArgParser();
        this.argparser.add_argument("--latchsize", {action: "store", type: "float", default: 8, help: "size of latch in multiples of thickness"});
        this.argparser.add_argument("--recess_wall", {action: "store", type: boolarg, default: false, help: "Whether to recess the inner wall for easier object removal"});
    }

    flexBookSide(h, x, r, callback, move) {
        let t = this.thickness;
        let tw;
        let th;
        [tw, th] = [(h + t), ((x + (2 * t)) + r)];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.fingerHolesAt(0, (x + (1.5 * t)), h, 0);
        this.edges["F"](h);
        this.corner(90, 0);
        this.edges["e"](t);
        this.edges["f"]((x + t));
        this.corner(180, r);
        this.edges["e"]((x + (2 * t)));
        this.corner(90);
        this.move(tw, th, move);
    }

    flexBookRecessedWall(h, y, include_recess, callback, move) {
        let t = this.thickness;
        let tw;
        let th;
        [tw, th] = [h, (y + (2 * t))];
        if (this.move(tw, th, move, true)) {
            return;
        }
        let cutout_radius = Math.min((h / 4), (y / 8));
        let cutout_angle = 90;
        let cutout_predist = (y * 0.2);
        let cutout_angle_dist = ((h / 2) - (2 * cutout_radius));
        let cutout_base_dist = ((y - (y * 0.4)) - (4 * cutout_radius));
        this.moveTo(0, t);
        this.edges["f"](h);
        this.corner(90);
        this.edges["e"](y);
        this.corner(90);
        this.edges["f"](h);
        this.corner(90);
        if (include_recess) {
            this.polyline(cutout_predist, [cutout_angle, cutout_radius], cutout_angle_dist, [-cutout_angle, cutout_radius], cutout_base_dist, [-cutout_angle, cutout_radius], cutout_angle_dist, [cutout_angle, cutout_radius], cutout_predist);
        }
        else {
            this.edges["e"](y);
        }
        this.corner(90);
        this.move(tw, th, move);
    }

    flexBookLatchWall(h, y, latchSize, callback, move) {
        let t = this.thickness;
        if (this.recess_wall) {
            let x_adjust = 0;
        }
        else {
            x_adjust = (3 * t);
        }
        let tw;
        let th;
        [tw, th] = [((h + t) + x_adjust), (y + (2 * t))];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(x_adjust, t);
        this.edges["f"](h);
        this.corner(90);
        this.edges["f"](y);
        this.corner(90);
        this.edges["f"](h);
        this.corner(90);
        this.rectangularHole((y / 2), (-1.5 * t), (latchSize - (1.9 * t)), (t * 1.1));
        this.polyline(((y - latchSize) / 2), -90, (2.5 * t), [90, (t / 2)], (latchSize - t), [90, (t / 2)], (2.5 * t), -90, ((y - latchSize) / 2), 90);
        this.move(tw, th, move);
    }

    flexBookCover(move) {
        let x;
        let y;
        [x, y] = [this.x, this.y];
        let latchSize = this.latchsize;
        let c4 = this.c4;
        let t = this.thickness;
        let tw = ((((2 * x) + (6 * t)) + (2 * c4)) + t);
        let th = (y + (4 * t));
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo((2 * t), 0);
        this.edges["h"]((x + t));
        this.edges["X"](((2 * c4) + t), (y + (4 * t)));
        this.edges["e"]((x + t));
        this.corner(90, (2 * t));
        this.edges["e"]((y / 2));
        this.rectangularHole(0, (1.5 * t), (latchSize + (0.1 * t)), (1.15 * t));
        this.rectangularHole(((latchSize + (7 * t)) / 2), (3.5 * t), t, t);
        this.rectangularHole((-(latchSize + (7 * t)) / 2), (3.5 * t), t, t);
        this.edges["e"]((y / 2));
        this.corner(90, (2 * t));
        this.edges["e"]((((x + t) + (2 * c4)) + t));
        this.edges["h"]((x + t));
        this.corner(90, (2 * t));
        this.edges["h"](y);
        this.corner(90, (2 * t));
        if (false) {
            this.moveTo(0, (2 * t));
            this.edges["e"]((((((x + t) + (2 * c4)) + x) + t) + t));
            this.corner(90);
            this.edges["e"](y);
            this.corner(90);
            this.edges["e"]((((((x + t) + (2 * c4)) + x) + t) + t));
            this.corner(90);
            this.edges["e"](y);
            this.corner(90);
            this.edges["e"](x);
            this.corner(90);
            this.edges["e"](y);
            this.corner(90);
            this.edges["e"](x);
            this.corner(90);
            this.edges["e"](y);
            this.corner(90);
        }
        this.move(tw, th, move);
    }

    flexBookLatchBracket(isCover, move) {
        let t = this.thickness;
        let round = (t / 3);
        let tw;
        let th;
        [tw, th] = [(5 * t), (5.5 * t)];
        if (this.move(tw, th, move, true)) {
            return;
        }
        if (isCover) {
            this.edge((5 * t));
        }
        else {
            this.edge(t);
            this.corner(90);
            this.edge(((2 * t) - round));
            this.corner(-90, round);
            this.edge(((1.5 * t) - round));
            this.rectangularHole(0, (1.5 * t), t, t);
            this.edge(((1.5 * t) - round));
            this.corner(-90, round);
            this.edge(((2 * t) - round));
            this.corner(90);
            this.edge(t);
        }
        this.corner(90);
        this.edge((3 * t));
        this.corner(180, (2.5 * t));
        this.edge((3 * t));
        if (!isCover) {
            this.moveTo((-1.5 * t), (1.25 * t));
            this.ctx.stroke();
            this.rectangularWall(t, (2 * t));
        }
        this.move(tw, th, move);
    }

    flexBookLatchPin(move) {
        let t = this.thickness;
        let l = this.latchsize;
        let tw;
        let th;
        [tw, th] = [(l + (4 * t)), (5 * t)];
        if (this.move(tw, th, move, true)) {
            return;
        }
        let round = (t / 3);
        this.moveTo((2 * t), 0);
        this.polyline(l, 90, (2 * t), -90, ((2 * t) - round), [90, round], ((2 * t) - (2 * round)), [90, round], ((3 * t) - round), -90, (t - round), [90, round], ((l - (2 * t)) - (2 * round)), [90, round], (t - round), -90, ((3 * t) - round), [90, round], ((2 * t) - (2 * round)), [90, round], ((2 * t) - round), -90, (2 * t), 90);
        this.move(tw, th, move);
    }

    render() {
        let y = this.h;
        this.h = this.y;
        this.y = y;
        let t = this.thickness;
        this.radius = (this.h / 2);
        this.latchsize *= this.thickness;
        this.flexBookCover({move: "up"});
        this.flexBookRecessedWall(this.h, this.y, this.recess_wall, {move: "mirror right"});
        this.flexBookLatchWall(this.h, this.y, this.latchsize, {move: "right"});
        this.ctx.save();
        this.flexBookSide(this.h, this.x, this.radius, {move: "right"});
        this.flexBookSide(this.h, this.x, this.radius, {move: "mirror right"});
        this.ctx.restore();
        this.flexBookSide(this.h, this.x, this.radius, {move: "up only"});
        this.ctx.save();
        this.flexBookLatchBracket(false, {move: "up"});
        this.flexBookLatchBracket(false, {move: "up"});
        this.ctx.restore();
        this.flexBookLatchBracket(false, {move: "right only"});
        this.ctx.save();
        this.flexBookLatchBracket(true, {move: "up"});
        this.flexBookLatchBracket(true, {move: "up"});
        this.ctx.restore();
        this.flexBookLatchBracket(false, {move: "right only"});
        let l = this.latchsize;
        this.rectangularWall((4 * t), l, {callback: [() => this.rectangularHole((2 * t), (l / 2), (2.5 * t), (0.8 * l))], move: "right"});
        this.flexBookLatchPin({move: "right"});
    }

}

module.exports.FlexBook = FlexBook;