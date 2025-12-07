import { Boxes  } from '../boxes.js';
import { FingerJointSettings  } from '../edges.js';
import { LidSettings  } from '../lids.js';
import { edges  } from '../edges.js';
import { _TopEdge  } from '../lids.js';
import { Color  } from '../Color.js';

class TrayLayoutFile extends Boxes {
    constructor(input, webargs) {
        super();
        this.argparser = argparse.ArgumentParser();
        // this.buildArgParser("sx", "sy");
        this.argparser.add_argument("--output", {action: "store", type: "str", default: "traylayout.txt", help: "Name of the layout text file."});
    }

    open() {
    }

    close() {
        return io.BytesIO(bytes(str(this), "utf-8"));
    }

    fillDefault(sx, sy) {
        this.sx = sx;
        this.sy = sy;
        let x = sx.length;
        let y = sy.length;
        this.hwalls = Array.from({length: y + 1}, () => Array(x).fill(true));
        this.vwalls = Array.from({length: y}, () => Array(x + 1).fill(true));
        this.floors = Array.from({length: y}, () => Array(x).fill(true));
    }

    __str__() {
        let r = [];
        for (let [i, x] of enumerate(this.sx)) {
            r.append(((" |" * i) + (" ,> %.1fmm
" % x)));
        }
        for (let [hwalls, vwalls, floors, y] of zip(this.hwalls, this.vwalls, this.floors, this.sy)) {
            r.append((unknown.join(/* unknown node GeneratorExp */) + "+
"));
            r.append(((unknown.join(/* unknown node GeneratorExp */) + " |"[vwalls[-1]]) + (" %.1fmm
" % y)));
        }
        r.append((unknown.join(/* unknown node GeneratorExp */) + "+
"));
        return unknown.join(r);
    }

    render() {
        this.fillDefault(this.sx, this.sy);
    }

}

export { TrayLayoutFile };
class TrayLayout extends Boxes {
    constructor() {
        super();
        this.addSettingsArgs(FingerJointSettings);
        this.addSettingsArgs(lids.LidSettings);
        // this.buildArgParser("h", "hi", "outside", "sx", "sy");
        this.argparser.add_argument("--layout", {action: "store", type: "str", default: "\n", help: "* Set **sx** and **sy** before editing this!
* You can still change measurements afterwards
* You can replace the hyphens and vertical bars representing the walls
with a space character to remove the walls.
* You can replace the space characters representing the floor by a "X"
to remove the floor for this compartment.
* Resize text area if necessary."});
        this.description = "";
        if (this.UI !== "web") {
            this.argparser.add_argument("--input", {action: "store", type: "str", default: "traylayout.txt", help: "layout file"});
        }
    }

    vWalls(x, y) {
        let result = 0;
        if ((y > 0 && this.vwalls[(y - 1)][x])) {
            result += 1;
        }
        if ((y < this.y.length && this.vwalls[y][x])) {
            result += 1;
        }
        return result;
    }

    hWalls(x, y) {
        let result = 0;
        if ((x > 0 && this.hwalls[y][(x - 1)])) {
            result += 1;
        }
        if ((x < this.x.length && this.hwalls[y][x])) {
            result += 1;
        }
        return result;
    }

    vFloor(x, y) {
        if (y >= this.y.length) {
            return false;
        }
        return ((x > 0 && this.floors[y][(x - 1)]) || (x < this.x.length && this.floors[y][x]));
    }

    hFloor(x, y) {
        if (x >= this.x.length) {
            return false;
        }
        return ((y > 0 && this.floors[(y - 1)][x]) || (y < this.y.length && this.floors[y][x]));
    }

    edgeAt(edge, x, y, length, angle) {
        this.moveTo(x, y, angle);
        edge = this.edges.get(edge, edge);
        edge(length);
    }

    prepare() {
        if (this.layout) {
            this.parse(this.layout.split("
"));
        }
        else {
            if (os.path.exists(this.input)) {
                // with open {
                this.parse(input_file);
                // }
            }
            else {
                if (callable(getattr(this, "generate_layout", null))) {
                    this.parse(this.generate_layout.split("
"));
                }
                else {
                    RuntimeError("traylayout requires --layout, --input, or implementation of generate_layout")
                }
            }
        }
        if (this.outside) {
            this.x = this.adjustSize(this.x);
            this.y = this.adjustSize(this.y);
            this.h = this.adjustSize(this.h);
            if (this.hi) {
                this.hi = this.adjustSize(this.hi);
            }
        }
        this.hi = (this.hi || this.h);
        if (this.hi > this.h) {
            ValueError("hi can't be bigger that h!")
        }
    }

    walls(move) {
        let lx = this.x.length;
        let ly = this.y.length;
        this.ctx.save();
        for (let y = 0; y < (ly + 1); y += 1) {
            if ((y === 0 || y === ly)) {
                let h = this.h;
            }
            else {
                h = this.hi;
            }
            let start = 0;
            let end = 0;
            let lengths = [];
            let edges = [];
            start += 1;
            if (start === lx) {
            }
            end = start;
            if (this.hFloor(end, y)) {
                edges.append("f");
            }
            else {
                edges.append("E");
            }
            lengths.append(this.x[end]);
            if ((this.hFloor(end, y) === 0 && this.hFloor((end + 1), y) === 0)) {
                edges.append("EDs"[this.vWalls((end + 1), y)]);
            }
            else {
                edges.append("eCs"[this.vWalls((end + 1), y)]);
            }
            lengths.append(this.thickness);
            end += 1;
            lengths.pop();
            edges.pop();
            this.rectangularWall(lengths.reduce((a, b) => a + b, 0), h, [new edges.CompoundEdge(this, edges, lengths), (this.vWalls(end, y) ? "f" : "e"), "e", (this.vWalls(start, y) ? "f" : "e")], {move: "right"});
            start = end;
        }
        this.ctx.restore();
        this.rectangularWall(10, h, "ffef", {move: "up only"});
        this.ctx.save();
        for (let x = 0; x < (lx + 1); x += 1) {
            if ((x === 0 || x === lx)) {
                h = this.h;
            }
            else {
                h = this.hi;
            }
            start = 0;
            end = 0;
            lengths = [];
            edges = [];
            start += 1;
            if (start === ly) {
            }
            end = start;
            if (this.vFloor(x, end)) {
                edges.append("f");
            }
            else {
                edges.append("E");
            }
            lengths.append(this.y[end]);
            if ((this.vFloor(x, end) === 0 && this.vFloor(x, (end + 1)) === 0)) {
                edges.append("EDS"[this.hWalls(x, (end + 1))]);
            }
            else {
                edges.append("eCs"[this.hWalls(x, (end + 1))]);
            }
            lengths.append(this.thickness);
            end += 1;
            lengths.pop();
            edges.pop();
            let upper = edges.map(e => e === 'f' ? 'f' : 'e');
            let edgesCopy = edges.slice();
            this.rectangularWall(lengths.reduce((a, b) => a + b, 0), h, [new edges.CompoundEdge(this, edgesCopy, lengths), "eFf"[this.hWalls(x, end)], new edges.CompoundEdge(this, upper, lengths.slice().reverse()), "eFf"[this.hWalls(x, start)]], {move: "right"});
            start = end;
        }
        this.ctx.restore();
        this.rectangularWall(10, h, "ffef", {move: "up only"});
    }

    base_plate(callback, move) {
        let lx = this.x.length;
        let ly = this.y.length;
        let t = this.thickness;
        let w = this.edges["F"].startwidth();
        let b = this.burn;
        let t2 = (this.thickness / 2.0);
        let tw = ((this.x.reduce((a, b) => a + b, 0) + ((lx - 1) * t)) + (2 * w));
        let th = ((this.y.reduce((a, b) => a + b, 0) + ((ly - 1) * t)) + (2 * w));
        if (this.move(tw, th, move, true)) {
            return;
        }
        for (let [i, [x, y, a]] of enumerate([[w, (w + b), 0], [(tw - w), (w + b), 90], [(tw - w), ((th - w) + b), 180], [w, ((th - w) + b), 270]])) {
            this.cc(callback, i, x, y, a);
        }
        let posy = (w - t);
        for (let y = ly; y < -1; y += -1) {
            let posx = w;
            for (let x = 0; x < lx; x += 1) {
                if (this.hwalls[y][x]) {
                    let e = "F";
                }
                else {
                    e = "e";
                }
                if ((y < ly && this.floors[y][x])) {
                    if ((y > 0 && this.floors[(y - 1)][x])) {
                        if (this.hwalls[y][x]) {
                            this.fingerHolesAt(posx, (posy + t2), this.x[x], {angle: 0});
                        }
                    }
                    else {
                        this.edgeAt(e, (posx + this.x[x]), ((posy + w) + b), this.x[x], -180);
                        if ((x === 0 || !this.floors[y][(x - 1)])) {
                            this.edgeAt("e", (posx - w), ((posy + w) + b), w, 0);
                        }
                        else {
                            if ((y === 0 || !this.floors[(y - 1)][(x - 1)])) {
                                this.edgeAt("e", (posx - t), ((posy + w) + b), t, 0);
                            }
                        }
                        if ((x === (lx - 1) || !this.floors[y][(x + 1)])) {
                            this.edgeAt("e", (posx + this.x[x]), ((posy + w) + b), w, 0);
                        }
                    }
                }
                else {
                    if ((y > 0 && this.floors[(y - 1)][x])) {
                        this.edgeAt(e, posx, (((posy - b) + t) - w), this.x[x]);
                        if ((x === 0 || !this.floors[(y - 1)][(x - 1)])) {
                            this.edgeAt("e", (posx - w), (((posy + t) - w) - b), w);
                        }
                        else {
                            if ((x === 0 || y === ly || !this.floors[y][(x - 1)])) {
                                this.edgeAt("e", (posx - t), (((posy + t) - w) - b), t);
                            }
                        }
                        if ((x === (lx - 1) || y === 0 || !this.floors[(y - 1)][(x + 1)])) {
                            this.edgeAt("e", (posx + this.x[x]), (((posy + t) - w) - b), w);
                        }
                    }
                }
                posx += (this.x[x] + this.thickness);
            }
            posy += (this.y[(y - 1)] + this.thickness);
        }
        posx = (w - t);
        for (let x = 0; x < (lx + 1); x += 1) {
            posy = w;
            for (let y = (ly - 1); y < -1; y += -1) {
                if (this.vwalls[y][x]) {
                    e = "F";
                }
                else {
                    e = "e";
                }
                if ((x > 0 && this.floors[y][(x - 1)])) {
                    if ((x < lx && this.floors[y][x])) {
                        if (this.vwalls[y][x]) {
                            this.fingerHolesAt((posx + t2), posy, this.y[y]);
                        }
                    }
                    else {
                        this.edgeAt(e, ((posx + w) + b), posy, this.y[y], 90);
                        if ((y === 0 || !this.floors[(y - 1)][(x - 1)])) {
                            this.edgeAt("e", ((posx + w) + b), (posy + this.y[y]), w, 90);
                        }
                        else {
                            if ((x === lx || y === 0 || !this.floors[(y - 1)][x])) {
                                this.edgeAt("e", ((posx + w) + b), (posy + this.y[y]), t, 90);
                            }
                        }
                        if ((y === (ly - 1) || !this.floors[(y + 1)][(x - 1)])) {
                            this.edgeAt("e", ((posx + w) + b), (posy - w), w, 90);
                        }
                    }
                }
                else {
                    if ((x < lx && this.floors[y][x])) {
                        this.edgeAt(e, (((posx + t) - w) - b), (posy + this.y[y]), this.y[y], -90);
                        if ((y === 0 || !this.floors[(y - 1)][x])) {
                            this.edgeAt("e", (((posx + t) - w) - b), ((posy + this.y[y]) + w), w, -90);
                        }
                        else {
                            if ((x === 0 || y === 0 || !this.floors[(y - 1)][(x - 1)])) {
                                this.edgeAt("e", (((posx + t) - w) - b), ((posy + this.y[y]) + t), t, -90);
                            }
                        }
                        if ((y === (ly - 1) || !this.floors[(y + 1)][x])) {
                            this.edgeAt("e", (((posx + t) - w) - b), posy, w, -90);
                        }
                    }
                }
                posy += (this.y[y] + this.thickness);
            }
            if (x < lx) {
                posx += (this.x[x] + this.thickness);
            }
        }
        this.move(tw, th, move);
    }

    parse(input) {
        let x = [];
        let y = [];
        let hwalls = [];
        let vwalls = [];
        let floors = [];
        for (let [nr, line] of enumerate(input)) {
            if ((!line || line[0] === "#")) {
            }
            let m = re.match("( \|)* ,>\s*(\d*\.?\d+)\s*mm\s*", line);
            if (m) {
                x.append(float(m.group(2)));
            }
            if (line[0] === "+") {
                let w = [];
                for (let [n, c] of enumerate(line.slice(0, ((x.length * 2) + 1)))) {
                    if ((n % 2)) {
                        if (c === " ") {
                            w.append(false);
                        }
                        else {
                            if (c === "-") {
                                w.append(true);
                            }
                            else {
                            }
                        }
                    }
                    else {
                        if (c !== "+") {
                        }
                    }
                }
                hwalls.append(w);
            }
            if (" |".includes(line[0])) {
                w = [];
                let f = [];
                for (let [n, c] of enumerate(line.slice(0, ((x.length * 2) + 1)))) {
                    if ((n % 2)) {
                        if ("xX".includes(c)) {
                            f.append(false);
                        }
                        else {
                            if (c === " ") {
                                f.append(true);
                            }
                            else {
                                ValueError(("Can't parse line %i in layout: expected " ", "x" or "X" for char #%i" % [(nr + 1), (n + 1)]))
                            }
                        }
                    }
                    else {
                        if (c === " ") {
                            w.append(false);
                        }
                        else {
                            if (c === "|") {
                                w.append(true);
                            }
                            else {
                                ValueError(("Can't parse line %i in layout: expected " ", or "|" for char #%i" % [(nr + 1), (n + 1)]))
                            }
                        }
                    }
                }
                floors.append(f);
                vwalls.append(w);
                m = re.match("([ |][ xX])+[ |]\s*(\d*\.?\d+)\s*mm\s*", line);
                if (!m) {
                    ValueError(("Can't parse line %i in layout: Can read height of the row" % (nr + 1)))
                }
                else {
                    y.append(float(m.group(2)));
                }
            }
        }
        let lx = x.length;
        let ly = y.length;
        if (lx === 0) {
            ValueError("Need more than one wall in x direction")
        }
        if (ly === 0) {
            ValueError("Need more than one wall in y direction")
        }
        if (hwalls.length !== (ly + 1)) {
            ValueError(("Wrong number of horizontal wall lines: %i (%i expected)" % [hwalls.length, (ly + 1)]))
        }
        for (let [nr, walls] of enumerate(hwalls)) {
            if (walls.length !== lx) {
                ValueError(("Wrong number of horizontal walls in line %i: %i (%i expected)" % [nr, walls.length, lx]))
            }
        }
        if (vwalls.length !== ly) {
            ValueError(("Wrong number of vertical wall lines: %i (%i expected)" % [vwalls.length, ly]))
        }
        for (let [nr, walls] of enumerate(vwalls)) {
            if (walls.length !== (lx + 1)) {
                ValueError(("Wrong number of vertical walls in line %i: %i (%i expected)" % [nr, walls.length, (lx + 1)]))
            }
        }
        this.x = x;
        this.y = y;
        this.hwalls = hwalls;
        this.vwalls = vwalls;
        this.floors = floors;
    }

    render() {
        this.prepare();
        this.walls();
        this.base_plate({move: "up"});
        this.lid((this.x.reduce((a, b) => a + b, 0) + ((this.x.length - 1) * this.thickness)), (this.y.reduce((a, b) => a + b, 0) + ((this.y.length - 1) * this.thickness)));
    }

}

export { TrayLayout };