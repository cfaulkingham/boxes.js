const { Boxes } = require('../boxes');
const { FingerJointSettings } = require('../edges');
const { LidSettings } = require('../lids');
const { edges } = require('../edges');
const { _TopEdge } = require('../lids');
const { Color } = require('../Color');

class RoyalGame extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(edges.FingerJointSettings);
        // this.buildArgParser();
    }

    dice(size, num, move) {
        let s = size;
        let r = (s / 20.0);
        let dr = (r * 2);
        let h = ((s / 2) * (3 ** 0.5));
        let t = this.thickness;
        let tw;
        let th;
        [tw, th] = [((num + 0.5) * size), size];
        if (this.move(tw, th, move, true)) {
            return;
        }
        this.moveTo(r, 0);
        for (let i = 0; i < (2 * num); i += 1) {
            this.polyline((((s - t) / 2) - dr), 90, ((h / 2) - r), -90, t, -90, ((h / 2) - r), 90, (((s - t) / 2) - dr), [120, r], (s - (2 * dr)), [120, r], (s - (2 * dr)), [120, r]);
            this.ctx.stroke();
            if ((i % 2)) {
                this.moveTo(((0.5 * s) - (2 * dr)), s, 180);
            }
            else {
                this.moveTo(((1.5 * s) - (2 * dr)), s, 180);
            }
        }
        this.move(tw, th, move);
    }

    five(x, y, s) {
        this.hole(x, y, (0.05 * s));
        this.hole(x, y, (0.12 * s));
        for (let dx of [-1, 1]) {
            for (let dy of [-1, 1]) {
                this.hole((x + ((dx * 0.25) * s)), (y + ((dy * 0.25) * s)), (0.05 * s));
                this.hole((x + ((dx * 0.25) * s)), (y + ((dy * 0.25) * s)), (0.12 * s));
            }
        }
    }

    _castle(x, y, s) {
        let l = ((s / 7) * (2 ** 0.5));
        this.moveTo(((x - (s / 2)) + (s / 14)), (y - (s / 2)), 45);
        this.polyline(...((([l, -90, l, 90] * 3) + [(l / 2), 90]) * 4));
    }

    castle(x, y, s) {
        this._castle(x, y, (0.9 * s));
        this._castle(x, y, (0.5 * s));
        this.five(x, y, (0.4 * s));
    }

    castles(x, y, s) {
        for (let dx of [-1, 1]) {
            for (let dy of [-1, 1]) {
                this._castle((x + ((dx * 0.25) * s)), (y + ((dy * 0.25) * s)), (0.4 * s));
                this.five((x + ((dx * 0.25) * s)), (y + ((dy * 0.25) * s)), (0.3 * s));
            }
        }
    }

    rosette(x, y, s) {
        this.moveTo(x, y, 22.5);
        this.ctx.save();
        this.moveTo((0.1 * s), 0, -30);
        for (let i = 0; i < 8; i += 1) {
            this.polyline(0, [60, (0.35 * s)], 0, 120, 0, [60, (0.35 * s)], 0, -120, 0, [45, (0.1 * s)], 0, -120);
        }
        this.ctx.restore();
        this.moveTo(0, 0, -22.5);
        this.moveTo((0.175 * s), 0);
        for (let i = 0; i < 8; i += 1) {
            this.polyline(0, [67.5, (0.32 * s)], 0, 90, 0, [67.5, (0.32 * s)], 0, -180);
        }
    }

    eyes(x, y, s) {
        for (let dx of [-1, 1]) {
            for (let dy of [-1, 1]) {
                let posx = (x + ((dx * 0.3) * s));
                let posy = (y + ((dy * 0.25) * s));
                this.rectangularHole(posx, posy, (0.4 * s), (0.5 * s));
                this.hole(posx, posy, (0.05 * s));
                this.ctx.save();
                this.moveTo(posx, (posy - (0.2 * s)), 60);
                this.corner(60, (0.4 * s));
                this.corner(120);
                this.corner(60, (0.4 * s));
                this.corner(120);
                this.moveTo(0, 0, -60);
                this.moveTo(0, (-0.05 * s), 60);
                this.corner(60, (0.5 * s));
                this.corner(120);
                this.corner(60, (0.5 * s));
                this.ctx.restore();
            }
        }
        for (let i = 0; i < 4; i += 1) {
            this.rectangularHole(x, (y + (((i - 1.5) * s) * 0.25)), (0.12 * s), (0.12 * s));
        }
    }

    race(x, y, s) {
        for (let dx = 0; dx < 4; dx += 1) {
            for (let dy = 0; dy < 4; dy += 1) {
                let posx = ((((dx - 1.5) * s) / 4.5) + x);
                let posy = ((((dy - 1.5) * s) / 4.5) + y);
                this.rectangularHole(posx, posy, (s / 5), (s / 5));
                if (([1, 2].includes(dx) && [0, 3].includes(dy))) {
                }
                this.hole(posx, posy, (s / 20));
            }
        }
    }

    top() {
        let patterns = [[this.castle, this.rosette, null, null, this.eyes, this.five, this.eyes, this.rosette], [this.five, this.eyes, this.castles, this.five, this.rosette, this.castles, this.five, this.race]];
        let s = this.size;
        for (let x = 0; x < 8; x += 1) {
            for (let y = 0; y < 3; y += 1) {
                if (([2, 3].includes(x) && y !== 1)) {
                }
                let posx = ((0.5 + x) * s);
                let posy = ((0.5 + y) * s);
                this.rectangularHole(posx, posy, (0.9 * s), (0.9 * s));
                let pattern = patterns[(y % 2)][x];
                if (pattern) {
                    pattern(posx, posy, (0.9 * s));
                }
            }
        }
    }

    player1() {
        for (let i = 0; i < 3; i += 1) {
            this.hole(0, 0, {r: ((this.size * (i + 2)) / 12)});
        }
    }

    player2(x, y) {
        let s = this.size;
        this.hole(x, y, (0.07 * s));
        for (let dx of [-1, 1]) {
            for (let dy of [-1, 1]) {
                this.hole((x + ((dx * 0.2) * s)), (y + ((dy * 0.2) * s)), (0.07 * s));
            }
        }
    }

    render() {
        let x = this.x;
        let t = this.thickness;
        let h = ((size / 2) * (3 ** 0.5));
        let y = (3 * size);
        this.rectangularWall(x, h, "FLFF", {move: "right"});
        this.rectangularWall(y, h, "nlmE", {callback: [() => this.hole((y / 2), (h / 2))], move: "up"});
        this.rectangularWall(y, h, "FfFf");
        this.rectangularWall(x, h, "FeFF", {move: "left up"});
        this.rectangularWall(x, y, "fMff", {move: "up"});
        this.rectangularWall(x, y, "fNff", {callback: [this.top], move: "up"});
        this.partsMatrix(7, 7, "up", this.parts.disc, (0.8 * size), {callback: this.player1});
        this.partsMatrix(7, 7, "up", this.parts.disc, (0.8 * size), {callback: this.player2});
        this.dice(size, 4, {move: "up"});
        this.dice(size, 4, {move: "up"});
    }

}

module.exports.RoyalGame = RoyalGame;