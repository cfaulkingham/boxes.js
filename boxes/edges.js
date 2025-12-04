import { Color  } from './Color.js';
import { SVGContext  } from './svg_context.js';
import { Matrix  } from './matrix.js';
import { normalize, vlength, vclip, vdiff, vadd, vorthogonal, vscalmul, dotproduct, circlepoint, tangent, kerf  } from './vectors.js';
import { Gears  } from './gears.js';

function argparseSections(s) {
    const result = [];
    const parse = s.split(/[\s:]+/);

    for (const part of parse) {
        if (!part) continue;
        let m = part.match(/^(\d+(\.\d+)?)\/(\d+)$/);
        if (m) {
            const n = parseInt(m[3]);
            const val = parseFloat(m[1]) / n;
            for (let i = 0; i < n; i++) result.push(val);
            continue;
        }
        m = part.match(/^(\d+(\.\d+)?)\*(\d+)$/);
        if (m) {
            const n = parseInt(m[3]);
            const val = parseFloat(m[1]);
            for (let i = 0; i < n; i++) result.push(val);
            continue;
        }
        const val = parseFloat(part);
        if (isNaN(val)) throw new Error("Don't understand sections string");
        result.push(val);
    }

    if (result.length === 0) {
        result.push(0.0);
    }

    return result;
}

class BoltPolicy {
    drawBolt(pos) {
        return false;
    }

    numFingers(numFingers) {
        return numFingers;
    }

    _even(numFingers) {
        return Math.floor(numFingers / 2) * 2;
    }

    _odd(numFingers) {
        if (numFingers % 2) return numFingers;
        return numFingers - 1;
    }
}

class Bolts extends BoltPolicy {
    constructor(bolts = 1) {
        super();
        this.bolts = bolts;
    }

    numFingers(numFingers) {
        if (this.bolts % 2) {
            this.fingers = this._even(numFingers);
        } else {
            this.fingers = numFingers;
        }
        return this.fingers;
    }

    drawBolt(pos) {
        let p = pos;
        if (p > Math.floor(this.fingers / 2)) {
            p = this.fingers - p;
        }

        if (p === 0) return false;

        if (p === Math.floor(this.fingers / 2) && !(this.bolts % 2)) {
            return false;
        }

        return (Math.floor((p * (this.bolts + 1) / this.fingers) - 0.01) !==
                Math.floor(((p + 1) * (this.bolts + 1) / this.fingers) - 0.01));
    }
}

class Settings {
    constructor(thickness, relative = true, kwargs = {}) {
        this.values = {};
        this.absolute_params = this.constructor.absolute_params || {};
        this.relative_params = this.constructor.relative_params || {};

        for (const [name, value] of Object.entries(this.absolute_params)) {
             let val = value;
             if (Array.isArray(value) || (typeof value === 'object' && value !== null && !Array.isArray(value))) {
                 // In python tuple can be choices. JS doesn't have tuples.
                 // Assuming tuple in python is array in JS if converted directly or check logic.
                 // Python: if isinstance(value, tuple): value = value[0]
                 if (Array.isArray(value)) val = value[0];
             }
             this.values[name] = val;
        }

        this.thickness = thickness;
        let factor = 1.0;
        if (relative) {
            factor = thickness;
        }

        for (const [name, value] of Object.entries(this.relative_params)) {
             this.values[name] = value * factor;
        }

        this.setValues(thickness, relative, kwargs);
    }

    setValues(thickness, relative = true, kwargs = {}) {
        let factor = 1.0;
        if (relative) {
            factor = thickness;
        }
        for (const [name, value] of Object.entries(kwargs)) {
            if (name in this.absolute_params) {
                this.values[name] = value;
            } else if (name in this.relative_params) {
                this.values[name] = value * factor;
            } else {
                 this[name] = value;
            }
        }
        this.checkValues();
    }

    checkValues() {}

    // Helper to simulate __getattr__
    get(name) {
        if (name in this.values) return this.values[name];
        if (name in this) return this[name];
        return undefined;
    }
}

class BaseEdge {
    constructor(boxes, settings) {
        this.boxes = boxes;
        this.ctx = boxes.ctx;
        this.settings = settings;
        this.char = null;
    }

    startwidth() { return 0.0; }
    endwidth() { return this.startwidth(); }
    margin() { return 0.0; }
    spacing() { return this.startwidth() + this.margin(); }

    // __call__ equivalent
    draw(length, kw = {}) {
        throw new Error("Not implemented");
    }
}

class Edge extends BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'e';
        this.positive = false;
        this.bedBoltSettings = null;
    }

    draw(length, kw = {}) {
        const { bedBolts, bedBoltSettings } = kw;
        if (bedBolts) {
            const interval_length = length / bedBolts.bolts;
            if (this.positive) {
                const d = (bedBoltSettings || this.bedBoltSettings)[0];
                for (let i = 0; i < bedBolts.bolts; i++) {
                    this.boxes.hole(0.5 * interval_length, 0.5 * this.thickness, 0.5 * d);
                    this.boxes.edge(interval_length, (i === 0 || i === bedBolts.bolts - 1) ? 1 : 0);
                }
            } else {
                for (let i = 0; i < bedBolts.bolts; i++) {
                    this.boxes.bedBoltHole(interval_length, bedBoltSettings, (i === 0 || i === bedBolts.bolts - 1) ? 1 : 0);
                }
            }
        } else {
            this.boxes.edge(length, 2);
        }
    }
}

class OutSetEdge extends Edge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'E';
        this.positive = true;
    }

    startwidth() {
        return this.settings ? this.settings.get('thickness') : this.boxes.thickness;
    }
}

class NoopEdge extends BaseEdge {
    constructor(boxes, margin=0) {
        super(boxes, null);
        this._margin = margin;
    }

    draw(length, kw={}) {
        this.boxes.corner(-90);
    }

    margin() {
        return this._margin;
    }
}

class MountingSettings extends Settings {
    static absolute_params = {
        "style": ["straight edge, within", "straight edge, extended", "mounting tab"],
        "side": ["back", "left", "right", "front"],
        "num": 2,
        "margin": 0.125,
        "d_shaft": 3.0,
        "d_head": 6.5
    };

    edgeObjects(boxes, chars = "G", add = true) {
        const edges = [new MountingEdge(boxes, this)];
        if (edges[0]) edges[0].char = chars[0];
        if (add) boxes.addParts(edges);
        return edges;
    }
}

class MountingEdge extends BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'G';
    }

    margin() {
        if (this.settings.get('style') === "mounting tab") {
            return 2.75 * this.boxes.thickness + this.settings.get('d_head');
        }
        return 0.0;
    }

    startwidth() {
        if (this.settings.get('style') === "straight edge, extended") {
            return 2.5 * this.boxes.thickness + this.settings.get('d_head');
        }
        return 0.0;
    }

    draw(length, kw={}) {
        if (length === 0.0) return;

        const style = this.settings.get('style');
        const margin_val = this.settings.get('margin');
        const num = this.settings.get('num');
        const ds = this.settings.get('d_shaft');
        const dh = this.settings.get('d_head');

        let width;
        if (dh > 0) {
            width = 3 * this.settings.thickness + dh;
        } else {
            width = ds;
        }

        // JS numbers are floats, check if integer
        if (!Number.isInteger(num)) {
             throw new Error("MountingEdge: num needs to be an integer number");
        }

        if (margin_val < 0 || margin_val > 0.5) {
             throw new Error(`MountingEdge: margin needs to be in [0, 0.5] but is ${margin_val}`);
        }

        if (dh !== 0 && dh <= ds) {
             throw new Error(`MountingEdge: d_head needs to be 0 or > ${ds}, but is ${dh}`);
        }

        let count = Math.max(1, Math.floor(num));
        let gap, margin_;

        if (count > 1) {
            margin_ = length * margin_val;
            gap = (length - 2 * margin_ - width * count) / (count - 1);
            if (gap < width) {
                count = Math.floor(((length - 2 * margin_val + width) / (2 * width)) - 0.5);
                if (count < 1) {
                    this.boxes.edge(length);
                    return;
                }
                if (count < 2) {
                    margin_ = (length - width) / 2;
                    gap = 0;
                } else {
                    gap = (length - 2 * margin_ - width * count) / (count - 1);
                }
            }
        } else {
            margin_ = (length - width) / 2;
            gap = 0;
        }

        if (style === "mounting tab") {
             this.boxes.edge(margin_, 1);
             for (let i = 0; i < count; i++) {
                 if (i > 0) this.boxes.edge(gap);
                 this.boxes.corner(-90, this.settings.thickness / 2);
                 this.boxes.edge(dh + 1.5 * ds - this.settings.thickness / 4 - dh / 2);
                 this.boxes.corner(90, this.settings.thickness + dh / 2);
                 this.boxes.corner(-90);
                 this.boxes.corner(90);
                 // mountingHole(x, y, d_shaft, d_head, angle)
                 this.boxes.mountingHole(0, this.settings.thickness * 1.25 + ds / 2, ds, dh, -90);
                 this.boxes.corner(90, this.settings.thickness + dh / 2);
                 this.boxes.edge(dh + 1.5 * ds - this.settings.thickness / 4 - dh / 2);
                 this.boxes.corner(-90, this.settings.thickness / 2);
             }
             this.boxes.edge(margin_, 1);
        } else {
            let x = margin_;
            for (let i = 0; i < count; i++) {
                x += width / 2;
                this.boxes.mountingHole(x, ds / 2 + this.settings.thickness * 1.5, ds, dh, -90);
                x += width / 2;
                x += gap;
            }
            this.boxes.edge(length);
        }
    }
}

class GroovedSettings extends Settings {
    static absolute_params = {
        "style": ["arc", "flat", "triangle", "softarc"],
        "tri_angle": 30,
        "arc_angle": 120,
        "width": 0.2,
        "gap": 0.1,
        "margin": 0.3,
        "inverse": false,
        "interleave": false,
    };

    edgeObjects(boxes, chars = "zZ", add = true) {
        const edges = [
            new GroovedEdge(boxes, this),
            new GroovedEdgeCounterPart(boxes, this)
        ];
        if (edges[0]) edges[0].char = chars[0];
        if (edges[1] && chars[1]) edges[1].char = chars[1];
        if (add) boxes.addParts(edges);
        return edges;
    }
}

class GroovedEdgeBase extends BaseEdge {
    is_inverse() {
        return this.settings.get('inverse') !== this.inverse;
    }

    groove_arc(width, angle = 90.0, inv = -1.0) {
        const side_length = width / Math.sin(angle * Math.PI / 180) / 2;
        this.boxes.corner(inv * -angle);
        this.boxes.corner(inv * angle, side_length);
        this.boxes.corner(inv * angle, side_length);
        this.boxes.corner(inv * -angle);
    }

    groove_soft_arc(width, angle = 60.0, inv = -1.0) {
        const side_length = width / Math.sin(angle * Math.PI / 180) / 4;
        this.boxes.corner(inv * -angle, side_length);
        this.boxes.corner(inv * angle, side_length);
        this.boxes.corner(inv * angle, side_length);
        this.boxes.corner(inv * -angle, side_length);
    }

    groove_triangle(width, angle = 45.0, inv = -1.0) {
        const side_length = width / Math.cos(angle * Math.PI / 180) / 2;
        this.boxes.corner(inv * -angle);
        this.boxes.edge(side_length);
        this.boxes.corner(inv * 2 * angle);
        this.boxes.edge(side_length);
        this.boxes.corner(inv * -angle);
    }

    draw(length, kw={}) {
        if (length === 0.0) return;

        const style = this.settings.get('style');
        let width = this.settings.get('width');
        let margin = this.settings.get('margin');
        let gap = this.settings.get('gap');
        const interleave = this.settings.get('interleave');

        if (width < 0 || width > 1) throw new Error(`width needs to be in [0, 1] but is ${width}`);
        if (margin < 0 || margin > 0.5) throw new Error(`margin needs to be in [0, 0.5] but is ${margin}`);
        if (gap < 0 || gap > 1) throw new Error(`gap needs to be in [0, 1] but is ${gap}`);

        // Check how many grooves fit
        let count = Math.max(0, Math.floor((1 - 2 * margin + gap) / (width + gap)));
        let inside_width = Math.max(0, count * (width + gap) - gap);
        margin = (1 - inside_width) / 2;

        // Convert to actual length
        margin = length * margin;
        gap = length * gap;
        width = length * width;

        let inv = this.is_inverse() ? 1 : -1;
        if (interleave && this.inverse && count % 2 === 0) {
            inv = -inv;
        }

        this.boxes.edge(margin, 1);

        for (let i = 0; i < count; i++) {
            if (i > 0) {
                this.boxes.edge(gap);
                if (interleave) inv = -inv;
            }
            if (style === "flat") {
                this.boxes.edge(width);
            } else if (style === "arc") {
                const angle = this.settings.get('arc_angle') / 2;
                this.groove_arc(width, angle, inv);
            } else if (style === "softarc") {
                const angle = this.settings.get('arc_angle') / 2;
                this.groove_soft_arc(width, angle, inv);
            } else if (style === "triangle") {
                const angle = this.settings.get('tri_angle');
                this.groove_triangle(width, angle, inv);
            } else {
                throw new Error(`Unknown GroovedEdge style: ${style}`);
            }
        }

        this.boxes.edge(margin, 1);
    }
}

class GroovedEdge extends GroovedEdgeBase {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'z';
        this.inverse = false;
    }
}

class GroovedEdgeCounterPart extends GroovedEdgeBase {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'Z';
        this.inverse = true;
    }
}

class GripSettings extends Settings {
    static absolute_params = {
        "style": ["wave", "bumps"],
        "outset": true,
    };

    static relative_params = {
        "depth": 0.3,
    };

    edgeObjects(boxes, chars = "g", add = true) {
        const edges = [new GrippingEdge(boxes, this)];
        if (edges[0]) edges[0].char = chars[0];
        if (add) boxes.addParts(edges);
        return edges;
    }
}

class GrippingEdge extends BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'g';
    }

    wave(length) {
        let depth = this.settings.get('depth');
        const grooves = Math.floor(length / (depth * 2.0)) + 1;
        depth = length / grooves / 4.0;

        const o = this.settings.get('outset') ? 1 : -1;
        for (let groove = 0; groove < grooves; groove++) {
            this.boxes.corner(o * -90, depth);
            this.boxes.corner(o * 180, depth);
            this.boxes.corner(o * -90, depth);
        }
    }

    bumps(length) {
        let depth = this.settings.get('depth');
        const grooves = Math.floor(length / (depth * 2.0)) + 1;
        depth = length / grooves / 2.0;
        const o = this.settings.get('outset') ? 1 : -1;

        if (this.settings.get('outset')) {
            this.boxes.corner(-90);
        } else {
            this.boxes.corner(90);
            this.boxes.edge(depth);
            this.boxes.corner(-180);
        }

        for (let groove = 0; groove < grooves; groove++) {
            this.boxes.corner(180, depth);
            this.boxes.corner(-180, 0);
        }

        if (this.settings.get('outset')) {
            this.boxes.corner(90);
        } else {
            this.boxes.edge(depth);
            this.boxes.corner(90);
        }
    }

    margin() {
        if (this.settings.get('outset')) {
            return this.settings.get('depth');
        }
        return 0.0;
    }

    draw(length, kw={}) {
        if (length === 0.0) return;
        const style = this.settings.get('style');
        if (typeof this[style] === 'function') {
            this[style](length);
        } else {
            throw new Error(`Unknown GrippingEdge style: ${style}`);
        }
    }
}

class CompoundEdge extends BaseEdge {
    constructor(boxes, types, lengths) {
        super(boxes, null);
        
        // Handle case where types is a string (e.g., "EFE") instead of an array
        if (typeof types === 'string') {
            this.types = types.split('').map(edge => {
                if (typeof edge === 'string') {
                     return boxes.edges[edge] || edge;
                }
                return edge;
            });
        } else {
            this.types = types.map(edge => {
                if (typeof edge === 'string') {
                     return boxes.edges[edge] || edge;
                }
                return edge;
            });
        }
        
        this.lengths = lengths;
        this.length = lengths.reduce((a, b) => a + b, 0);
    }

    startwidth() {
        return this.types[0].startwidth();
    }

    endwidth() {
        return this.types[this.types.length - 1].endwidth();
    }

    margin() {
        const margins = this.types.map(e => e.margin() + e.startwidth());
        return Math.max(...margins) - this.types[0].startwidth();
    }

    draw(length, kw={}) {
        if (length && Math.abs(length - this.length) > 1E-5) {
             throw new Error("Wrong length for CompoundEdge");
        }
        let lastwidth = this.types[0].startwidth();

        for (let i = 0; i < this.types.length; i++) {
             const e = this.types[i];
             const l = this.lengths[i];
             this.boxes.step(e.startwidth() - lastwidth);
             e.draw(l);
             lastwidth = e.endwidth();
        }
    }
}

class Slot extends BaseEdge {
    constructor(boxes, depth) {
        super(boxes, null);
        this.depth = depth;
    }

    draw(length, kw={}) {
        if (this.depth) {
            this.boxes.corner(90);
            this.boxes.edge(this.depth);
            this.boxes.corner(-90);
            this.boxes.edge(length);
            this.boxes.corner(-90);
            this.boxes.edge(this.depth);
            this.boxes.corner(90);
        } else {
            this.boxes.edge(length);
        }
    }
}

class SlottedEdge extends BaseEdge {
    constructor(boxes, sections, edge="e", slots=0) {
        super(boxes, new Settings(boxes.thickness));
        this.edge = (typeof edge === 'string') ? (boxes.edges[edge] || edge) : edge;
        this.sections = sections;
        this.slots = slots;
    }

    startwidth() {
        return this.edge.startwidth();
    }

    endwidth() {
        return this.edge.endwidth();
    }

    margin() {
        return this.edge.margin();
    }

    draw(length, kw={}) {
        for (let i = 0; i < this.sections.length - 1; i++) {
            const l = this.sections[i];
            this.edge.draw(l);

            if (this.slots) {
                new Slot(this.boxes, this.slots).draw(this.settings.thickness);
            } else {
                this.boxes.edge(this.settings.thickness);
            }
        }
        this.edge.draw(this.sections[this.sections.length - 1]);
    }
}

class FingerJointSettings extends Settings {
    static absolute_params = {
        "style": ["rectangular", "springs", "barbs", "snap"],
        "surroundingspaces": 2.0,
    };
    static relative_params = {
        "space": 2.0,
        "finger": 2.0,
        "width": 1.0,
        "edge_width": 1.0,
        "play": 0.0,
        "extra_length": 0.0,
        "bottom_lip": 0.0,
    };

    constructor(thickness, relative=true, kwargs={}) {
        super(thickness, relative, kwargs);
        this.angle = 90;
    }

    checkValues() {
        if (Math.abs(this.get('space') + this.get('finger')) < 0.1) {
            throw new Error("FingerJointSettings: space + finger must not be close to zero");
        }
    }

    edgeObjects(boxes, chars="fFh", add=true) {
        const edges = [
            new FingerJointEdge(boxes, this),
            new FingerJointEdgeCounterPart(boxes, this),
            new FingerHoleEdge(boxes, this)
        ];

        // Assign chars
        for (let i=0; i<edges.length; i++) {
             if (i < chars.length) edges[i].char = chars[i];
        }

        if (add) boxes.addParts(edges);
        return edges;
    }
}

class FingerJointBase extends BaseEdge {
    calcFingers(length, bedBolts) {
        const space = this.settings.get('space');
        const finger = this.settings.get('finger');
        const surroundingspaces = this.settings.get('surroundingspaces');

        let fingers = Math.floor((length - (surroundingspaces - 1) * space) / (space + finger));

        if (fingers === 0 && length > finger + 1.0 * this.settings.thickness) {
            fingers = 1;
        }
        if (!finger) fingers = 0;

        // ignoring bedBolts

        let leftover = length - fingers * (space + finger) + space;

        if (fingers <= 0) {
            fingers = 0;
            leftover = length;
        }

        return { fingers, leftover };
    }

    fingerLength(angle) {
        const thickness = this.settings.thickness;
        const extra_length = this.settings.get('extra_length');

        if (angle >= 90 || angle <= -90) {
            return [thickness + extra_length, 0.0];
        }

        if (angle < 0) {
            return [Math.sin(-angle * Math.PI / 180) * thickness + extra_length, 0];
        }

        const a = 90 - (180 - angle) / 2.0;
        const fingerlength = thickness * Math.tan(a * Math.PI / 180);
        const b = 90 - 2 * a;
        const spacerecess = -Math.sin(b * Math.PI / 180) * fingerlength;

        return [fingerlength + extra_length, spacerecess];
    }
}

class FingerJointEdge extends FingerJointBase {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'f';
        this.positive = true;
    }

    draw_finger(f, h, style, positive, firsthalf) {
        const t = this.settings.thickness;

        if (positive) {
            if (style === "rectangular" || true) { // simplified: only rectangular for now or add others if needed
                 this.boxes.polyline(0, -90, h, 90, f, 90, h, -90);
            }
        } else {
             this.boxes.polyline(0, 90, h, -90, f, -90, h, 90);
        }
    }

    draw(length, kw={}) {
        const positive = this.positive;
        const t = this.settings.thickness;

        let s = this.settings.get('space');
        let f = this.settings.get('finger');
        const thickness = this.settings.thickness;
        let style = this.settings.get('style');
        const play = this.settings.get('play');
        const { bedBolts, bedBoltSettings } = kw;

        const { fingers, leftover } = this.calcFingers(length, bedBolts);

        let leftover_val = leftover;

        if (fingers === 0 && f && leftover_val > 0.75 * thickness && leftover_val > 4 * play) {
             // fingers = 1; // logic in python
             // ...
        }

        if (!positive) {
            f += play;
            s -= play;
            leftover_val -= play;
        }

        this.boxes.edge(leftover_val / 2.0, 1);

        const [l1, l2] = this.fingerLength(this.settings.angle);
        const h = l1 - l2;

        for (let i = 0; i < fingers; i++) {
            if (i !== 0) {
                this.boxes.edge(s);
            }
            this.draw_finger(f, h, style, positive, i < Math.floor(fingers/2));
        }

        this.boxes.edge(leftover_val / 2.0, 1);
    }

    margin() {
        const widths = this.fingerLength(this.settings.angle);
        if (this.positive) {
            return widths[0] - widths[1];
        }
        return 0.0;
    }

    startwidth() {
        const widths = this.fingerLength(this.settings.angle);
        // Python: return widths[self.positive]
        // True is 1, False is 0. positive edge (f) returns widths[1], negative edge (F) returns widths[0]
        // Python: startwidth return widths[self.positive]
        // If self.positive is True (1), returns widths[1].
        // If self.positive is False (0), returns widths[0].
        // My array is [l1+extra, recess].
        // Python fingerLength returns (fingerlength, spacerecess).
        // So width[0] is fingerlength, width[1] is spacerecess.

        // Wait, Python:
        // return widths[self.positive]
        // True is 1, False is 0.
        // So positive edge returns widths[1] (recess/spacerecess).
        // Negative edge returns widths[0] (fingerlength).

        // Let's recheck logic.
        // FingerJointEdge positive=True.
        // startwidth returns widths[1].

        // FingerJointEdgeCounterPart positive=False.
        // startwidth returns widths[0].

        return this.positive ? widths[1] : widths[0];
    }
}

class FingerJointEdgeCounterPart extends FingerJointEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'F';
        this.positive = false;
    }
}

class FingerHoles extends FingerJointBase {
    constructor(boxes, settings) {
        super(boxes, settings);
    }

    draw(x, y, length, angle=90, bedBolts=null, bedBoltSettings=null) {
        this.boxes.ctx.save();
        this.boxes.moveTo(x, y, angle);

        const s = this.settings.get('space');
        const f = this.settings.get('finger');
        const p = this.settings.get('play');
        const b = this.boxes.burn;

        const { fingers, leftover } = this.calcFingers(length, bedBolts);

        // Simplified logic

        for (let i = 0; i < fingers; i++) {
            const pos = leftover / 2.0 + i * (s + f);

            // rectangularHole(x, y, dx, dy)
            // Python: rectangularHole(pos + 0.5 * f, 0, f + p, self.settings.width + p)
            this.boxes.rectangularHole(pos + 0.5 * f, 0, f + p, this.settings.get('width') + p);
        }
        this.boxes.ctx.restore();
    }
}

class FingerHoleEdge extends BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'h';
        // In python: self.fingerHoles = fingerHoles or boxes.fingerHolesAt
        // But here we construct FingerHoles. Python uses FingerHoles class too.
        // It seems the python code allows passing a settings object or FingerHoles instance.
        // Here we assume settings.
        this.fingerHoles = new FingerHoles(boxes, settings);
    }

    draw(length, kw={}) {
        const { bedBolts, bedBoltSettings } = kw;
        const dist = this.settings.get('edge_width');
        this.boxes.ctx.save();
        this.fingerHoles.draw(0, this.boxes.burn + dist + this.settings.thickness / 2, length, 0, bedBolts, bedBoltSettings);

        if (this.settings.get('bottom_lip')) {
            const h = this.settings.get('bottom_lip') + this.settings.get('edge_width');
            const sp = this.boxes.spacing; // Assuming boxes.spacing exists
            this.boxes.moveTo(-sp / 2, -h - sp);
            this.boxes.rectangularWall(length - 1.05 * this.boxes.thickness, h);
        }

        this.boxes.ctx.restore();
        this.boxes.edge(length, 2);
    }

    startwidth() {
        return this.settings.get('edge_width') + this.settings.thickness;
    }

    margin() {
        if (this.settings.get('bottom_lip')) {
            return this.settings.get('bottom_lip') + this.settings.get('edge_width') + this.boxes.spacing;
        }
        return 0.0;
    }
}

class CrossingFingerHoleEdge extends Edge {
    constructor(boxes, height, fingerHoles=null, outset=0.0) {
        super(boxes, null);
        this.char = '|';
        this.fingerHoles = fingerHoles || boxes.fingerHolesAt.bind(boxes); // Using bind to ensure correct context if it's a method
        this.height = height;
        this.outset = outset;
    }

    draw(length, kw={}) {
        // Python: self.fingerHoles(length / 2.0, self.outset + self.burn, self.height)
        // If fingerHoles is a method on boxes, we call it. If it is an object (FingerHoles instance), we call draw?
        // Python says: self.fingerHoles = fingerHoles or boxes.fingerHolesAt
        // boxes.fingerHolesAt is likely a method in Boxes class.
        // I'll assume it's a function I can call.

        if (typeof this.fingerHoles === 'function') {
             this.fingerHoles(length / 2.0, this.outset + this.boxes.burn, this.height);
        } else if (this.fingerHoles.draw) {
             // FingerHoles instance doesn't have same signature as boxes.fingerHolesAt probably?
             // boxes.fingerHolesAt(x, y, length, angle=90)
             // FingerHoles.draw(x, y, length, angle=90)
             // So it matches.
             this.fingerHoles.draw(length / 2.0, this.outset + this.boxes.burn, this.height);
        }

        super.draw(length, kw);
    }

    startwidth() {
        return this.outset;
    }
}

class StackableSettings extends Settings {
    static absolute_params = {
        "angle": 60,
    };
    static relative_params = {
        "height": 2.0,
        "width": 4.0,
        "holedistance": 1.0,
        "bottom_stabilizers": 0.0,
    };

    checkValues() {
        const angle = this.get('angle');
        if (angle < 20) throw new Error("StackableSettings: 'angle' is too small. Use value >= 20");
        if (angle > 260) throw new Error("StackableSettings: 'angle' is too big. Use value < 260");
    }

    edgeObjects(boxes, chars = "sSšŠ", add = true, fingersettings = null) {
        fingersettings = fingersettings || boxes.edges["f"].settings;
        const edges = [
            new StackableEdge(boxes, this, fingersettings),
            new StackableEdgeTop(boxes, this, fingersettings),
            new StackableFeet(boxes, this, fingersettings),
            new StackableHoleEdgeTop(boxes, this, fingersettings),
        ];

        for (let i = 0; i < edges.length; i++) {
             if (i < chars.length) edges[i].char = chars[i];
        }

        if (add) boxes.addParts(edges);
        return edges;
    }
}

class StackableBaseEdge extends BaseEdge {
    constructor(boxes, settings, fingerjointsettings) {
        super(boxes, settings);
        this.fingerjointsettings = fingerjointsettings;
        this.char = "s";
        this.bottom = true;
    }

    draw(length, kw={}) {
        const s = this.settings;
        const height = s.get('height');
        const angle = s.get('angle');
        const width = s.get('width');
        const bottom_stabilizers = s.get('bottom_stabilizers');

        const r = height / 2.0 / (1 - Math.cos(angle * Math.PI / 180));
        const l = r * Math.sin(angle * Math.PI / 180);
        const p = this.bottom ? 1 : -1;

        if (this.bottom && bottom_stabilizers) {
            this.boxes.ctx.save();
            const sp = this.boxes.spacing;
            this.boxes.moveTo(-sp / 2);
            this.boxes.rectangularWall(length - 1.05 * this.boxes.thickness, bottom_stabilizers, "down");
            this.boxes.ctx.restore();
        }

        this.boxes.edge(width, 1);
        this.boxes.corner(p * angle, r);
        this.boxes.corner(-p * angle, r);
        this.boxes.edge(length - 2 * width - 4 * l);
        this.boxes.corner(-p * angle, r);
        this.boxes.corner(p * angle, r);
        this.boxes.edge(width, 1);
    }

    _height() {
        return this.settings.get('height') + this.settings.get('holedistance') + this.settings.thickness;
    }

    startwidth() {
        return this.bottom ? this._height() : 0;
    }

    margin() {
        if (this.bottom) {
            if (this.settings.get('bottom_stabilizers')) {
                 return this.settings.get('bottom_stabilizers') + this.boxes.spacing;
            }
            return 0;
        } else {
            return this.settings.get('height');
        }
    }
}

class StackableEdge extends StackableBaseEdge {
    constructor(boxes, settings, fingerjointsettings) {
        super(boxes, settings, fingerjointsettings);
        this.char = "s";
        this.bottom = true;
    }

    draw(length, kw={}) {
        const s = this.settings;
        // boxes.fingerHolesAt(x, y, length, angle)
        this.boxes.fingerHolesAt(
            0,
            s.get('height') + s.get('holedistance') + 0.5 * this.boxes.thickness,
            length, 0
        );
        super.draw(length, kw);
    }
}

class StackableEdgeTop extends StackableBaseEdge {
    constructor(boxes, settings, fingerjointsettings) {
        super(boxes, settings, fingerjointsettings);
        this.char = "S";
        this.bottom = false;
    }
}

class StackableFeet extends StackableBaseEdge {
    constructor(boxes, settings, fingerjointsettings) {
        super(boxes, settings, fingerjointsettings);
        this.char = "š";
        this.bottom = true;
    }

    _height() {
        return this.settings.get('height');
    }
}

class StackableHoleEdgeTop extends StackableBaseEdge {
    constructor(boxes, settings, fingerjointsettings) {
        super(boxes, settings, fingerjointsettings);
        this.char = "Š";
        this.bottom = false;
    }

    startwidth() {
        return this.settings.thickness + this.settings.get('holedistance');
    }

    draw(length, kw={}) {
        const s = this.settings;
        this.boxes.fingerHolesAt(
            0,
            s.get('holedistance') + 0.5 * this.boxes.thickness,
            length, 0
        );
        super.draw(length, kw);
    }
}

class HingeSettings extends Settings {
    static absolute_params = {
        "outset": false,
        "pinwidth": 0.5,
        "grip_percentage": 0,
    };
    static relative_params = {
        "hingestrength": 1,
        "axle": 2.0,
        "grip_length": 0,
    };

    constructor(thickness, relative=true, kwargs={}) {
        super(thickness, relative, kwargs);
        this.style = "outset";
    }

    checkValues() {
        if (this.get('axle') / this.thickness < 0.1) {
             throw new Error("HingeSettings: 'axle' need to be at least 0.1 strong");
        }
    }

    edgeObjects(boxes, chars="iIjJkK", add=true) {
        const edges = [
            new Hinge(boxes, this, 1),
            new HingePin(boxes, this, 1),
            new Hinge(boxes, this, 2),
            new HingePin(boxes, this, 2),
            new Hinge(boxes, this, 3),
            new HingePin(boxes, this, 3),
        ];

        for (let i = 0; i < edges.length; i++) {
             if (i < chars.length) edges[i].char = chars[i];
        }

        if (add) boxes.addParts(edges);
        return edges;
    }
}

class Hinge extends BaseEdge {
    constructor(boxes, settings, layout=1) {
        super(boxes, settings);
        if (layout < 1 || layout > 3) throw new Error(`layout must be 1, 2 or 3 (got ${layout})`);
        this.layout = layout;
        this.char = "eijk"[layout];
    }

    margin() {
        const t = this.settings.thickness;
        if (this.settings.style === "outset") {
            const r = 0.5 * this.settings.get('axle');
            const alpha = Math.asin(Math.min(1.0, 0.5 * t / r)) * 180 / Math.PI;
            const pos = Math.cos(alpha * Math.PI / 180) * r;
            return 1.5 * t + pos;
        } else {
            return 0.5 * t + 0.5 * this.settings.get('axle') + this.settings.get('hingestrength');
        }
    }

    outset(_reversed = false) {
        const t = this.settings.thickness;
        const r = 0.5 * this.settings.get('axle');
        const alpha = Math.asin(Math.min(1.0, 0.5 * t / r)) * 180 / Math.PI;
        const pinl = Math.pow(Math.pow(this.settings.get('axle'), 2) - Math.pow(t, 2), 0.5) * this.settings.get('pinwidth');
        const pos = Math.cos(alpha * Math.PI / 180) * r;

        // Polyline arguments format: [x1, y1, x2, y2, ...] or [x, angle, length, ...] ?
        // boxes.polyline is (x, angle, length, angle, length ...)
        // In python: (0., 90. - alpha, 0., (-360., r), 0., 90. + alpha, t, 90., 0.5 * t, (180., t + pos), 0., (-90., 0.5 * t), 0.)
        // This format in python seems to be: (length, angle, length, ...) where some lengths are tuples (angle, radius) for arc.

        let hinge = [
            0.,
            90. - alpha, 0.,
            -360., r, 0., // tuple (-360, r) means arc? boxes.polyline handles this if passed as args?
            // Wait, JS boxes.polyline takes arguments. Python uses *hinge.
            // Python polyline: if arg is tuple it's corner/arc.
            // My JS polyline implementation: checks if arg is array for corner/arc.

            90. + alpha, t,
            90., 0.5 * t,
            180., t + pos, 0., // (180, t+pos)
            -90., 0.5 * t, 0.
        ];

        // Let's adjust for JS polyline expectation.
        // JS polyline: (l1, a1, l2, a2, ...) where lX can be [angle, radius].

        // Python: (0., 90.-alpha, 0., (-360., r), 0., ...)
        // Length 0, Turn 90-alpha, Length 0, Arc(-360, r), Length 0...

        const hinge_poly = [
            0.,
            90. - alpha, 0.,
            [-360., r], 0.,
            90. + alpha, t,
            90., 0.5 * t,
            [180., t + pos], 0.,
            [-90., 0.5 * t], 0.
        ];

        if (_reversed) {
             // Reversing polyline in Python is tricky because of turn/length/turn/length structure.
             // But here we need to draw it.
             // For now assume standard direction. If reversed, we need to reverse the sequence of operations.
             // Or construct reversed polyline.
             // Since I don't have a generic reverse function for this polyline format easily available (it depends on semantics),
             // I will implement reversed logic manually or rely on python logic which just calls reversed().
             // reversed((l1, a1, l2, a2, l3)) -> (l3, a2, l2, a1, l1).
             // It reverses the order.
             // If I reverse the array in JS:
             const rev_poly = [...hinge_poly].reverse();
             this.boxes.polyline(...rev_poly);
             this.boxes.rectangularHole(-pos, -0.5 * t, pinl, this.settings.thickness);
        } else {
             this.boxes.rectangularHole(pos, -0.5 * t, pinl, this.settings.thickness);
             this.boxes.polyline(...hinge_poly);
        }
    }

    outsetlen() {
        const t = this.settings.thickness;
        const r = 0.5 * this.settings.get('axle');
        const alpha = Math.asin(Math.min(1.0, 0.5 * t / r)) * 180 / Math.PI;
        const pos = Math.cos(alpha * Math.PI / 180) * r;
        return 2.0 * pos + 1.5 * t;
    }

    flush(_reversed = false) {
        const t = this.settings.thickness;
        const hinge_poly = [
            0., -90.,
            0.5 * t,
            [180., 0.5 * this.settings.get('axle') + this.settings.get('hingestrength')], 0.,
            [-90., 0.5 * t], 0.
        ];

        const pos = 0.5 * this.settings.get('axle') + this.settings.get('hingestrength');
        const pinl = Math.pow(Math.pow(this.settings.get('axle'), 2) - Math.pow(t, 2), 0.5) * this.settings.get('pinwidth');

        if (_reversed) {
            this.boxes.hole(0.5 * t + pos, -0.5 * t, 0.5 * this.settings.get('axle'));
            this.boxes.rectangularHole(0.5 * t + pos, -0.5 * t, pinl, this.settings.thickness);
            this.boxes.polyline(...[...hinge_poly].reverse());
        } else {
            this.boxes.hole(pos, -0.5 * t, 0.5 * this.settings.get('axle'));
            this.boxes.rectangularHole(pos, -0.5 * t, pinl, this.settings.thickness);
            this.boxes.polyline(...hinge_poly);
        }
    }

    flushlen() {
        return this.settings.get('axle') + 2.0 * this.settings.get('hingestrength') + 0.5 * this.settings.thickness;
    }

    draw(l, kw={}) {
        const style = this.settings.style; // "outset" by default in HingeSettings constructor
        const len_method = style + 'len';
        const hlen = this[len_method] ? this[len_method]() : this.flushlen();

        if (this.layout === 1 || this.layout === 3) {
            if (this[style]) this[style]();
            else this.flush();
        }

        const edge_len = l - (this.layout & 1 ? hlen : 0) - (this.layout & 2 ? hlen : 0);
        this.boxes.edge(edge_len, 2);

        if (this.layout === 2 || this.layout === 3) {
            if (this[style]) this[style](true);
            else this.flush(true);
        }
    }
}

class HingePin extends BaseEdge {
    constructor(boxes, settings, layout=1) {
        super(boxes, settings);
        if (layout < 1 || layout > 3) throw new Error(`layout must be 1, 2 or 3 (got ${layout})`);
        this.layout = layout;
        this.char = "EIJK"[layout];
    }

    startwidth() {
        if (this.layout & 1) return 0.0;
        return (this.settings.get('outset') ? 1 : 0) * this.boxes.thickness;
    }

    endwidth() {
        if (this.layout & 2) return 0.0;
        return (this.settings.get('outset') ? 1 : 0) * this.boxes.thickness;
    }

    margin() {
        if (this.settings.get('outset') && (
            this.settings.get('grip_percentage') > 0.0 ||
            this.settings.get('grip_length') > 0.0 )) {
            // Need to access GrippingEdge margin. Assuming 'g' edge is available or construct one.
            // In python: self.boxes.edges['g'].margin()
            // Here we can create a temporary edge or assume we know margin.
            // GrippingEdge margin is depth if outset else 0.
            // Let's create one.
            const g = new GrippingEdge(this.boxes, new GripSettings(this.settings.thickness));
            return this.settings.thickness + g.margin();
        } else {
            return this.settings.thickness;
        }
    }

    outset(_reversed = false) {
        const t = this.settings.thickness;
        const r = 0.5 * this.settings.get('axle');
        const alpha = Math.asin(Math.min(1.0, 0.5 * t / r)) * 180 / Math.PI;
        const pos = Math.cos(alpha * Math.PI / 180) * r;
        const pinl = Math.pow(Math.pow(this.settings.get('axle'), 2) - Math.pow(t, 2), 0.5) * this.settings.get('pinwidth');

        let pin = [
            pos - 0.5 * pinl, -90.,
            t, 90.,
            pinl,
            90.,
            t,
            -90.
        ];

        if (this.settings.get('outset')) {
            pin.push(
                pos - 0.5 * pinl + 1.5 * t,
                -90.,
                t,
                90.,
                0.
            );
        } else {
             pin.push(pos - 0.5 * pinl);
        }

        if (_reversed) {
            this.boxes.polyline(...[...pin].reverse());
        } else {
            this.boxes.polyline(...pin);
        }
    }

    outsetlen() {
        const t = this.settings.thickness;
        const r = 0.5 * this.settings.get('axle');
        const alpha = Math.asin(Math.min(1.0, 0.5 * t / r)) * 180 / Math.PI;
        const pos = Math.cos(alpha * Math.PI / 180) * r;

        if (this.settings.get('outset')) {
            return 2 * pos + 1.5 * this.settings.thickness;
        }
        return 2 * pos;
    }

    flush(_reversed = false) {
        const t = this.settings.thickness;
        const pinl = Math.pow(Math.pow(this.settings.get('axle'), 2) - Math.pow(t, 2), 0.5) * this.settings.get('pinwidth');
        let d = (this.settings.get('axle') - pinl) / 2.0;
        let d1 = d;
        if (this.settings.style === "flush_inset") {
            d1 -= this.settings.thickness;
        }

        let pin = [
            this.settings.get('hingestrength') + d1, -90.,
            t, 90.,
            pinl,
            90.,
            t,
            -90., d
        ];

        if (this.settings.get('outset')) {
            pin.push(
                0.,
                this.settings.get('hingestrength') + 0.5 * t,
                -90.,
                t,
                90.,
                0.
            );
        }

        if (_reversed) {
            this.boxes.polyline(...[...pin].reverse());
        } else {
            this.boxes.polyline(...pin);
        }
    }

    flushlen() {
        let l = this.settings.get('hingestrength') + this.settings.get('axle');
        if (this.settings.style === "flush_inset") {
            l -= this.settings.thickness;
        }

        if (this.settings.get('outset')) {
            l += this.settings.get('hingestrength') + 0.5 * this.settings.thickness;
        }

        return l;
    }

    draw(l, kw={}) {
        const style = this.settings.style;
        const len_method = style + 'len';
        const plen = this[len_method] ? this[len_method]() : this.flushlen();

        let glen = l * this.settings.get('grip_percentage') / 100 + this.settings.get('grip_length');

        if (!this.settings.get('outset')) {
            glen = 0.0;
        }

        glen = Math.min(glen, l - plen);

        if (this.layout === 3) {
            if (this[style]) this[style](); else this.flush();
            this.boxes.edge(l - 2 * plen, 2);
            if (this[style]) this[style](true); else this.flush(true);
        } else if (this.layout === 1) {
            if (this[style]) this[style](); else this.flush();
            this.boxes.edge(l - plen - glen, 2);
            // Draw grip edge.
            const g = new GrippingEdge(this.boxes, new GripSettings(this.settings.thickness));
            g.draw(glen);
        } else { // layout === 2
            const g = new GrippingEdge(this.boxes, new GripSettings(this.settings.thickness));
            g.draw(glen);
            this.boxes.edge(l - plen - glen, 2);
            if (this[style]) this[style](true); else this.flush(true);
        }
    }
}

class ChestHingeSettings extends Settings {
    static relative_params = {
        "pin_height": 2.0,
        "hinge_strength": 1.0,
        "play": 0.1,
    };
    static absolute_params = {
        "finger_joints_on_box": false,
        "finger_joints_on_lid": false,
    };

    checkValues() {
        if (this.get('pin_height') / this.thickness < 1.2) {
             throw new Error("ChestHingeSettings: 'pin_height' must be >= 1.2");
        }
    }

    pinheight() {
        return Math.pow(Math.pow(0.9 * this.get('pin_height'), 2) - Math.pow(this.thickness, 2), 0.5);
    }

    edgeObjects(boxes, chars="oOpPqQ", add=true) {
        const edges = [
            new ChestHinge(boxes, this),
            new ChestHinge(boxes, this, true),
            new ChestHingeTop(boxes, this),
            new ChestHingeTop(boxes, this, true),
            new ChestHingePin(boxes, this),
            new ChestHingeFront(boxes, this),
        ];

        for (let i = 0; i < edges.length; i++) {
             if (i < chars.length) edges[i].char = chars[i];
        }

        if (add) boxes.addParts(edges);
        return edges;
    }
}

class ChestHinge extends BaseEdge {
    constructor(boxes, settings, reversed = false) {
        super(boxes, settings);
        this.reversed = reversed;
        this.char = reversed ? 'O' : 'o';
    }

    draw(l, kw={}) {
        const t = this.settings.thickness;
        const p = this.settings.get('pin_height');
        const s = this.settings.get('hinge_strength');
        const pinh = this.settings.pinheight();

        if (this.reversed) {
            this.boxes.hole(l + t, 0, p, 4);
            this.boxes.rectangularHole(l + 0.5 * t, -0.5 * pinh, t, pinh);
        } else {
            this.boxes.hole(-t, -s - p, p, 4);
            this.boxes.rectangularHole(-0.5 * t, -s - p - 0.5 * pinh, t, pinh);
        }

        let final_segment, draw_rest_of_edge;
        if (this.settings.get('finger_joints_on_box')) {
            final_segment = t - s;
            draw_rest_of_edge = () => this.boxes.edges["F"].draw(l - p);
        } else {
            final_segment = l + t - p - s;
            draw_rest_of_edge = () => {};
        }

        const poly = [0, -180, t, [270, p + s], 0, -90, final_segment];

        if (this.reversed) {
            draw_rest_of_edge();
            this.boxes.polyline(...[...poly].reverse());
        } else {
            this.boxes.polyline(...poly);
            draw_rest_of_edge();
        }
    }

    margin() {
        if (this.reversed) return 0.0;
        return 1 * (this.settings.get('pin_height') + this.settings.get('hinge_strength'));
    }

    startwidth() {
        if (this.reversed) return this.settings.get('pin_height') + this.settings.get('hinge_strength');
        return 0.0;
    }

    endwidth() {
        if (this.reversed) return 0.0;
        return this.settings.get('pin_height') + this.settings.get('hinge_strength');
    }
}

class ChestHingeTop extends ChestHinge {
    constructor(boxes, settings, reversed = false) {
        super(boxes, settings, reversed);
        this.char = reversed ? 'O' : 'o';
    }

    draw(l, kw={}) {
        const t = this.settings.thickness;
        const p = this.settings.get('pin_height');
        const s = this.settings.get('hinge_strength');
        const play = this.settings.get('play');

        let final_segment, draw_rest_of_edge;
        if (this.settings.get('finger_joints_on_lid')) {
            final_segment = t - s - play;
            draw_rest_of_edge = () => this.boxes.edges["F"].draw(l - p);
        } else {
            final_segment = l + t - p - s - play;
            draw_rest_of_edge = () => {};
        }

        const poly = [0, -180, t, -180, 0, [-90, p + s + play], 0, 90, final_segment];

        if (this.reversed) {
            draw_rest_of_edge();
            this.boxes.polyline(...[...poly].reverse());
        } else {
            this.boxes.polyline(...poly);
            draw_rest_of_edge();
        }
    }

    startwidth() {
        if (this.reversed) return this.settings.get('play') + this.settings.get('pin_height') + this.settings.get('hinge_strength');
        return 0.0;
    }

    endwidth() {
        if (this.reversed) return 0.0;
        return this.settings.get('play') + this.settings.get('pin_height') + this.settings.get('hinge_strength');
    }

    margin() {
        if (this.reversed) return 0.0;
        return 1 * (this.settings.get('play') + this.settings.get('pin_height') + this.settings.get('hinge_strength'));
    }
}

class ChestHingePin extends BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'q';
    }

    draw(l, kw={}) {
        const t = this.settings.thickness;
        const p = this.settings.get('pin_height');
        const s = this.settings.get('hinge_strength');
        const pinh = this.settings.pinheight();

        let middle_segment, draw_rest_of_edge;
        if (this.settings.get('finger_joints_on_lid')) {
            middle_segment = [0];
            draw_rest_of_edge = () => {
                this.boxes.edge(t);
                this.boxes.edges["F"].draw(l);
                this.boxes.edge(t);
            };
        } else {
            middle_segment = [l + 2 * t];
            draw_rest_of_edge = () => {};
        }

        const poly = [0, -90, this.settings.get('play') + s + p - pinh, -90, t, 90, pinh, 90];

        this.boxes.polyline(...poly);
        draw_rest_of_edge();
        this.boxes.polyline(...middle_segment.concat([...poly].reverse()));
    }

    margin() {
        return this.settings.get('play') + this.settings.get('pin_height') + this.settings.get('hinge_strength');
    }
}

class ChestHingeFront extends Edge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'Q';
    }

    startwidth() {
        return this.settings.get('pin_height') + this.settings.get('hinge_strength');
    }
}

class CabinetHingeSettings extends Settings {
    static absolute_params = {
        "bore": 3.2,
        "eyes_per_hinge": 5,
        "hinges": 2,
        "style": ["inside", "outside"],
    };
    static relative_params = {
        "eye": 1.5,
        "play": 0.05,
        "spacing": 2.0,
    };

    edgeObjects(boxes, chars="uUvV", add=true) {
        const edges = [
            new CabinetHingeEdge(boxes, this),
            new CabinetHingeEdge(boxes, this, true),
            new CabinetHingeEdge(boxes, this, false, true),
            new CabinetHingeEdge(boxes, this, true, true),
        ];

        for (let i = 0; i < edges.length; i++) {
             if (i < chars.length) edges[i].char = chars[i];
        }

        if (add) boxes.addParts(edges);
        return edges;
    }
}

class CabinetHingeEdge extends BaseEdge {
    constructor(boxes, settings, top = false, angled = false) {
        super(boxes, settings);
        this.top = top;
        this.angled = angled;
        this.char = "uUvV"[(top ? 1 : 0) + 2 * (angled ? 1 : 0)];
    }

    startwidth() {
        return (this.top && this.angled) ? this.settings.thickness : 0.0;
    }

    __poly() {
        const n = this.settings.get('eyes_per_hinge');
        const p = this.settings.get('play');
        const e = this.settings.get('eye');
        const t = this.settings.thickness;
        const spacing = this.settings.get('spacing');

        let e_val = e;
        if (this.settings.get('style') === "outside" && this.angled) {
            e_val = t;
        } else if (this.angled && !this.top) {
            e_val -= t;
        }

        let poly = [];

        if (this.top) {
            poly = [spacing, 90, e_val + p];
        } else {
            poly = [spacing + p, 90, e_val + p, 0];
        }

        for (let i = 0; i < n; i++) {
            if ((i % 2 !== 0) ^ this.top) { // XOR logic
                // space
                if (i === 0) {
                    poly.push(-90, t + 2 * p, 90);
                } else {
                    poly.push(90, t + 2 * p, 90);
                }
            } else {
                // hinge eye
                poly.push(t - p, -90, t, -90, t - p);
            }
        }

        if ((n % 2 !== 0) ^ this.top) {
             // stopped with hinge eye
             poly.push(0, e_val + p, 90, p + spacing);
        } else {
             // stopped with space
             // poly[-1:] = ... replaces last element?
             // Python: poly[-1:] = [-90, e + p, 90, 0 + spacing]
             // Python poly end was ... ?
             // If stopped with space, the last added was 90.
             // We replace the last 90 with [-90, e+p, 90, spacing]
             poly.pop();
             poly.push(-90, e_val + p, 90, spacing);
        }

        const width = (t + p) * n + p + 2 * spacing;

        return { poly, width };
    }

    draw(l, kw={}) {
        const n = this.settings.get('eyes_per_hinge');
        const p = this.settings.get('play');
        const e = this.settings.get('eye');
        const t = this.settings.thickness;
        let hn = this.settings.get('hinges');

        let { poly, width } = this.__poly();

        let e_val = e;
        if (this.settings.get('style') === "outside" && this.angled) {
            e_val = t;
        } else if (this.angled && !this.top) {
            e_val -= t;
        }

        hn = Math.min(hn, Math.floor(l / width));

        if (hn === 1) {
            this.boxes.edge((l - width) / 2, 2);
        }

        for (let j = 0; j < hn; j++) {
            for (let i = 0; i < n; i++) {
                if (!((i % 2 !== 0) ^ this.top)) {
                    this.boxes.rectangularHole(this.settings.get('spacing') + 0.5 * t + p + i * (t + p), e_val + 2.5 * t, t, t);
                }
            }
            this.boxes.polyline(...poly);
            if (j < (hn - 1)) {
                this.boxes.edge((l - hn * width) / (hn - 1), 2);
            }
        }

        if (hn === 1) {
            this.boxes.edge((l - width) / 2, 2);
        }
    }
}

class SlideOnLidSettings extends FingerJointSettings {
    static relative_params = {
        ...FingerJointSettings.relative_params,
        "play": 0.05,
        "finger": 3.0,
        "space": 2.0,
    };
    static absolute_params = {
        ...FingerJointSettings.absolute_params,
        "second_pin": true,
        "spring": ["both", "none", "left", "right"],
        "hole_width": 0
    };

    edgeObjects(boxes, chars=null, add=true) {
        const edges = [
            new LidEdge(boxes, this),
            new LidHoleEdge(boxes, this),
            new LidRight(boxes, this),
            new LidLeft(boxes, this),
            new LidSideRight(boxes, this),
            new LidSideLeft(boxes, this),
        ];
        if (add) boxes.addParts(edges);
        return edges;
    }
}

class LidEdge extends FingerJointEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "l";
    }

    draw(length, kw={}) {
        const hole_width = this.settings.get('hole_width');
        if (hole_width > 0) {
            super.draw((length - hole_width) / 2, kw);
            // Calling groove_arc from GroovedEdgeBase. Since we don't inherit from it, we need to create a dummy or use a helper.
            // Or just reimplement. Or use a mixin.
            // GroovedEdgeBase.prototype.groove_arc is available if exposed or I can copy logic.
            // I'll create a temporary GroovedEdgeBase to use its method or just copy logic.
            // Copying logic is safer for now.

            // groove_arc(width, angle=90.0, inv=-1.0)
            const width = hole_width;
            const angle = 90.0;
            const inv = -1.0;
            const side_length = width / Math.sin(angle * Math.PI / 180) / 2;
            this.boxes.corner(inv * -angle);
            this.boxes.corner(inv * angle, side_length);
            this.boxes.corner(inv * angle, side_length);
            this.boxes.corner(inv * -angle);

            super.draw((length - hole_width) / 2, kw);
        } else {
            super.draw(length, kw);
        }
    }
}

class LidHoleEdge extends FingerHoleEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "L";
    }

    draw(length, kw={}) {
        const hole_width = this.settings.get('hole_width');
        if (hole_width > 0) {
            super.draw((length - hole_width) / 2, kw);
            this.boxes.edge(hole_width);
            super.draw((length - hole_width) / 2, kw);
        } else {
            super.draw(length, kw);
        }
    }
}

class LidRight extends BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "n";
        this.rightside = true;
    }

    draw(length, kw={}) {
        const t = this.boxes.thickness;

        let spring;
        if (this.rightside) {
             spring = ["right", "both"].includes(this.settings.get('spring'));
        } else {
             spring = ["left", "both"].includes(this.settings.get('spring'));
        }

        let p;
        if (spring) {
            const l = Math.min(6 * t, length - 2 * t);
            const a = 30;
            const sqt = 0.4 * t / Math.cos(a * Math.PI / 180);
            const sw = 0.5 * t;
            // [0, 90, 1.5 * t + sw, -90, l, (-180, 0.25 * t), l - 0.2 * t, 90, sw, 90 - a, sqt, 2 * a, sqt, -a, length - t]
            // -180, 0.25*t is arc? [-180, 0.25*t]
            p = [
                0, 90, 1.5 * t + sw, -90, l,
                [-180, 0.25 * t],
                l - 0.2 * t, 90, sw, 90 - a, sqt, 2 * a, sqt, -a, length - t
            ];
        } else {
            p = [t, 90, t, -90, length - t];
        }

        const pin = this.settings.get('second_pin');

        if (pin) {
            const pinl = 2 * t;
            // p[-1:] = [length - 2 * t - pinl, -90, t, 90, pinl, 90, t, -90, t]
            // replace last element
            p.pop();
            p.push(length - 2 * t - pinl, -90, t, 90, pinl, 90, t, -90, t);
        }

        if (!this.rightside) {
             // reverse p
             // Reversing polyline array manually is tricky because of mix of numbers and arrays.
             // We need helper or logic.
             // Logic: elements are (length, angle, length, ...) or (length, [angle, radius], length...)
             // reversed: reverse the list, then swap angles?
             // No, standard reverse logic for polyline description.
             // [l1, a1, l2, a2, l3] -> [l3, a2, l2, a1, l1]
             // But here we have [..., l_before, corner, l_after, ...]
             // If we reverse array, we get [t, -90, t, 90, pinl, 90, t, -90, ..., 0]
             // corner params [angle, radius] should stay as corner params but order reversed?
             // Actually, if we use boxes.polyline(...reversed(p)), does it work?
             // Python reversed() iterator. boxes.polyline(*reversed(p)).
             // My JS polyline implementation accepts args.
             // Yes, reversing the array should work if structure is symmetric (length, turn, length, turn...).
             // My p array construction:
             // [0, 90, 1.5*t+sw, -90, l, [..], l-..., 90, sw, 90-a, sqt, 2*a, sqt, -a, length-t]
             // Lengths: 0, 1.5*t+sw, l, l-0.2*t, sw, sqt, sqt, length-t
             // Turns: 90, -90, [..], 90, 90-a, 2*a, -a
             // It alternates.
             // So p.reverse() should work.
             p.reverse();
        }
        this.boxes.polyline(...p);
    }

    startwidth() {
        if (this.rightside) return this.boxes.thickness;
        return 0.0;
    }

    endwidth() {
        if (!this.rightside) return this.boxes.thickness;
        return 0.0;
    }

    margin() {
        if (!this.rightside) return this.boxes.thickness;
        return 0.0;
    }
}

class LidLeft extends LidRight {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "m";
        this.rightside = false;
    }
}

class LidSideRight extends BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "N";
        this.rightside = true;
    }

    draw(length, kw={}) {
        const t = this.boxes.thickness;
        const s = this.settings.get('play');
        const pin = this.settings.get('second_pin');
        const edge_width = this.settings.get('edge_width');
        const r = edge_width / 3;

        let spring;
        if (this.rightside) {
             spring = ["right", "both"].includes(this.settings.get('spring'));
        } else {
             spring = ["left", "both"].includes(this.settings.get('spring'));
        }

        let p;
        if (spring) {
            p = [s, -90, t + s, -90, t + s, 90, edge_width - s / 2, 90, length + t];
        } else {
            p = [t + s, -90, t + s, -90, 2 * t + s, 90, edge_width - s / 2, 90, length + t];
        }

        if (pin) {
            const pinl = 2 * t;
            // p[-1:] = [p[-1] - 1.5 * t - 2 * pinl - r, (90, r), edge_width + t + s / 2 - r, -90, 2 * pinl + s + 0.5 * t, -90, t + s, -90, pinl - r, (90, r), edge_width - s / 2 - 2 * r, (90, r), pinl + t - s - r]
            const last = p.pop();
            p.push(
                last - 1.5 * t - 2 * pinl - r,
                [90, r],
                edge_width + t + s / 2 - r, -90,
                2 * pinl + s + 0.5 * t, -90,
                t + s, -90,
                pinl - r, [90, r],
                edge_width - s / 2 - 2 * r, [90, r],
                pinl + t - s - r
            );
        }

        let holex = 0.6 * t;
        let holey = -0.5 * t + this.boxes.burn - s / 2;
        if (this.rightside) {
            p.reverse();
            holex = length - holex;
            holey = edge_width + 0.5 * t + this.boxes.burn;
        }

        if (spring) {
            this.boxes.rectangularHole(holex, holey, 0.4 * t, t + 2 * s);
        }
        this.boxes.polyline(...p);
    }

    startwidth() {
        return this.boxes.thickness + this.settings.get('edge_width') + (this.rightside ? 0 : -this.settings.get('play') / 2);
    }

    endwidth() {
        return this.boxes.thickness + this.settings.get('edge_width') + (!this.rightside ? 0 : -this.settings.get('play') / 2);
    }

    margin() {
        return this.boxes.thickness + this.settings.get('edge_width') + (this.settings.get('play') / 2) * (this.rightside ? 0 : 1);
    }
}

class LidSideLeft extends LidSideRight {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "M";
        this.rightside = false;
    }
}

class ClickSettings extends Settings {
    static absolute_params = {
        "angle": 5.0,
    };
    static relative_params = {
        "depth": 3.0,
        "bottom_radius": 0.1,
    };

    edgeObjects(boxes, chars="cC", add=true) {
        const edges = [
            new ClickConnector(boxes, this),
            new ClickEdge(boxes, this)
        ];
        if (edges[0]) edges[0].char = chars[0];
        if (edges[1] && chars.length > 1) edges[1].char = chars[1];

        if (add) boxes.addParts(edges);
        return edges;
    }
}

class ClickConnector extends BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "c";
    }

    hook(reverse = false) {
        const t = this.settings.thickness;
        const a = this.settings.get('angle');
        const d = this.settings.get('depth');
        const r = this.settings.get('bottom_radius');
        const c = Math.cos(a * Math.PI / 180);
        const s = Math.sin(a * Math.PI / 180);

        const p1 = [0, 90 - a, c * d];
        const p2 = [
            d + t,
            -90,
            t * 0.5,
            135,
            t * Math.pow(2, 0.5),
            135,
            d + 2 * t + s * 0.5 * t
        ];
        const p3 = [c * d - s * c * 0.2 * t, -a, 0];

        if (!reverse) {
            this.boxes.polyline(...p1);
            this.boxes.corner(-180, r);
            this.boxes.polyline(...p2);
            this.boxes.corner(-180 + 2 * a, r);
            this.boxes.polyline(...p3);
        } else {
            // Reversing logic for polyline
            // p3 is [len, angle, len]
            // p3 = [c*d..., -a, 0]
            // reversed p3:
            // 0, -a, c*d...
            // JS reverse p3:
            this.boxes.polyline(...[...p3].reverse());
            this.boxes.corner(-180 + 2 * a, r);
            this.boxes.polyline(...[...p2].reverse());
            this.boxes.corner(-180, r);
            this.boxes.polyline(...[...p1].reverse());
        }
    }

    hookWidth() {
        const t = this.settings.thickness;
        const a = this.settings.get('angle');
        const d = this.settings.get('depth');
        const r = this.settings.get('bottom_radius');
        const c = Math.cos(a * Math.PI / 180);
        const s = Math.sin(a * Math.PI / 180);

        return 2 * s * d * c + 0.5 * c * t + c * 4 * r;
    }

    hookOffset() {
        const a = this.settings.get('angle');
        const d = this.settings.get('depth');
        const r = this.settings.get('bottom_radius');
        const c = Math.cos(a * Math.PI / 180);
        const s = Math.sin(a * Math.PI / 180);

        return s * d * c + 2 * r;
    }

    finger(length) {
        const t = this.settings.thickness;
        this.boxes.polyline(
            2 * t,
            90,
            length,
            90,
            2 * t,
        );
    }

    draw(length, kw={}) {
        const t = this.settings.thickness;
        this.boxes.edge(4 * t);
        this.hook();
        this.finger(2 * t);
        this.hook(true);

        this.boxes.edge(length - 2 * (6 * t + 2 * this.hookWidth()), 2);

        this.hook();
        this.finger(2 * t);
        this.hook(true);
        this.boxes.edge(4 * t);
    }

    margin() {
        return 2 * this.settings.thickness;
    }
}

class ClickEdge extends ClickConnector {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "C";
    }

    startwidth() {
        return this.boxes.thickness;
    }

    margin() {
        return 0.0;
    }

    draw(length, kw={}) {
        const t = this.settings.thickness;
        const o = this.hookOffset();
        const w = this.hookWidth();
        const p1 = [
            4 * t + o,
            90,
            t,
            -90,
            2 * (t + w - o),
            -90,
            t,
            90,
            0
        ];
        this.boxes.polyline(...p1);
        this.boxes.edge(length - 2 * (6 * t + 2 * w) + 2 * o, 2);
        this.boxes.polyline(...[...p1].reverse());
    }
}

class DoveTailSettings extends Settings {
    static absolute_params = {
        "angle": 50,
    };
    static relative_params = {
        "size": 3,
        "depth": 1.5,
        "radius": 0.2,
    };

    edgeObjects(boxes, chars="dD", add=true) {
        const edges = [
            new DoveTailJoint(boxes, this),
            new DoveTailJointCounterPart(boxes, this)
        ];
        if (edges[0]) edges[0].char = chars[0];
        if (edges[1] && chars.length > 1) edges[1].char = chars[1];

        if (add) boxes.addParts(edges);
        return edges;
    }
}

class DoveTailJoint extends BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'd';
        this.positive = true;
    }

    draw(length, kw={}) {
        const s = this.settings;
        const radius = Math.max(s.get('radius'), this.boxes.burn);
        const positive = this.positive;
        const a = s.get('angle') + 90;
        const alpha = 0.5 * Math.PI - Math.PI * s.get('angle') / 180.0;

        const l1 = radius / Math.tan(alpha / 2.0);
        const diffx = 0.5 * s.get('depth') / Math.tan(alpha);
        const l2 = 0.5 * s.get('depth') / Math.sin(alpha);

        const sections = Math.floor(length / (s.get('size') * 2));
        const leftover = length - sections * s.get('size') * 2;

        if (sections === 0) {
            this.boxes.edge(length);
            return;
        }

        const p = positive ? 1 : -1;

        this.boxes.edge((s.get('size') + leftover) / 2.0 + diffx - l1, 1);

        for (let i = 0; i < sections; i++) {
            this.boxes.corner(-1 * p * a, radius);
            this.boxes.edge(2 * (l2 - l1));
            this.boxes.corner(p * a, radius);
            this.boxes.edge(2 * (diffx - l1) + s.get('size'));
            this.boxes.corner(p * a, radius);
            this.boxes.edge(2 * (l2 - l1));
            this.boxes.corner(-1 * p * a, radius);

            if (i < sections - 1) {
                this.boxes.edge(2 * (diffx - l1) + s.get('size'));
            }
        }

        this.boxes.edge((s.get('size') + leftover) / 2.0 + diffx - l1, 1);
    }

    margin() {
        return this.settings.get('depth');
    }
}

class DoveTailJointCounterPart extends DoveTailJoint {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'D';
        this.positive = false;
    }

    margin() {
        return 0.0;
    }
}

class FlexSettings extends Settings {
    static absolute_params = {
        "stretch": 1.05,
    };
    static relative_params = {
        "distance": 0.5,
        "connection": 1.0,
        "width": 5.0,
    };

    checkValues() {
        if (this.get('distance') < 0.01) {
            throw new Error("Flex Settings: distance parameter must be > 0.01mm");
        }
        if (this.get('width') < 0.1) {
            throw new Error("Flex Settings: width parameter must be > 0.1mm");
        }
    }
}

class FlexEdge extends BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'X';
    }

    draw(x, h, kw={}) {
        const dist = this.settings.get('distance');
        const connection = this.settings.get('connection');
        const width = this.settings.get('width');

        const burn = this.boxes.burn;
        const h_adj = h + 2 * burn;

        const lines = Math.floor(x / dist);
        const leftover = x - lines * dist;
        const sections = Math.max(Math.floor((h_adj - connection) / width), 1);
        const sheight = ((h_adj - connection) / sections) - connection;

        for (let i = 1; i < lines; i++) {
            const pos = i * dist + leftover / 2;

            if (i % 2 !== 0) {
                this.boxes.ctx.move_to(pos, 0);
                this.boxes.ctx.line_to(pos, connection + sheight);

                for (let j = 0; j < Math.floor((sections - 1) / 2); j++) {
                    this.boxes.ctx.move_to(pos, (2 * j + 1) * sheight + (2 * j + 2) * connection);
                    this.boxes.ctx.line_to(pos, (2 * j + 3) * (sheight + connection));
                }

                if (sections % 2 === 0) {
                    this.boxes.ctx.move_to(pos, h_adj - sheight - connection);
                    this.boxes.ctx.line_to(pos, h_adj);
                }
            } else {
                if (sections % 2 !== 0) {
                    this.boxes.ctx.move_to(pos, h_adj);
                    this.boxes.ctx.line_to(pos, h_adj - connection - sheight);

                    for (let j = 0; j < Math.floor((sections - 1) / 2); j++) {
                        this.boxes.ctx.move_to(
                            pos, h_adj - ((2 * j + 1) * sheight + (2 * j + 2) * connection));
                        this.boxes.ctx.line_to(
                            pos, h_adj - (2 * j + 3) * (sheight + connection));
                    }
                } else {
                    for (let j = 0; j < Math.floor(sections / 2); j++) {
                        this.boxes.ctx.move_to(pos,
                                         h_adj - connection - 2 * j * (sheight + connection));
                        this.boxes.ctx.line_to(pos, h_adj - 2 * (j + 1) * (sheight + connection));
                    }
                }
            }
        }

        // Draw the baseline like a normal edge and then advance
        this.boxes.ctx.move_to(0, 0);
        this.boxes.ctx.line_to(x, 0);
        // Match the behavior of Boxes.edge(): move the local origin forward
        this.boxes.ctx.translate(x, 0);
    }
}

class GearSettings extends Settings {
    static absolute_params = {
        "dimension": 3.0,
        "angle": 20.0,
        "profile_shift": 20.0,
        "clearance": 0.0,
    };
}

class RackEdge extends BaseEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "R";
        this.gear = new Gears(boxes);
    }

    draw(length, kw={}) {
        const params = { ...this.settings.values };
        params["draw_rack"] = true;
        params["rack_base_height"] = -1E-36;
        params["rack_teeth_length"] = Math.floor(length / (params["dimension"] * Math.PI));
        params["rack_base_tab"] = (length - (params["rack_teeth_length"]) * params["dimension"] * Math.PI) / 2.0;

        const s_tmp = this.boxes.spacing;
        this.boxes.spacing = 0;

        this.boxes.moveTo(length, 0, 180);

        if (this.gear.draw) {
             this.gear.draw(params, "");
        }

        this.boxes.moveTo(0, 0, 180);
        this.boxes.spacing = s_tmp;
    }

    margin() {
        return this.settings.get('dimension') * 1.1;
    }
}

class RoundedTriangleEdgeSettings extends Settings {
    static absolute_params = {
        "height": 50.,
        "radius": 30.,
        "r_hole": 2.,
    };
    static relative_params = {
        "outset": 0.,
    };

    edgeObjects(boxes, chars="t", add=true) {
        const edges = [
            new RoundedTriangleEdge(boxes, this),
            new RoundedTriangleFingerHolesEdge(boxes, this)
        ];
        if (edges[0]) edges[0].char = chars[0];

        if (add) boxes.addParts(edges);
        return edges;
    }
}

class RoundedTriangleEdge extends Edge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "t";
    }

    draw(length, kw={}) {
        let len = length + 2 * this.settings.get('outset');
        let r = this.settings.get('radius');
        if (r > len / 2) r = len / 2;

        let angle, l;
        if (len - 2 * r < this.settings.get('height')) {
            angle = 90 - Math.atan((len - 2 * r) / (2 * this.settings.get('height'))) * 180 / Math.PI;
            l = this.settings.get('height') / Math.cos((90 - angle) * Math.PI / 180);
        } else {
            angle = Math.atan(2 * this.settings.get('height') / (len - 2 * r)) * 180 / Math.PI;
            l = 0.5 * (len - 2 * r) / Math.cos(angle * Math.PI / 180);
        }

        if (this.settings.get('outset')) {
            this.boxes.polyline(0, -180, this.settings.get('outset'), 90);
        } else {
            this.boxes.corner(-90);
        }

        if (this.settings.get('r_hole')) {
            this.boxes.hole(this.settings.get('height'), len / 2., this.settings.get('r_hole'));
        }

        this.boxes.corner(90 - angle, r, 1);
        this.boxes.edge(l, 1);
        this.boxes.corner(2 * angle, r, 1);
        this.boxes.edge(l, 1);
        this.boxes.corner(90 - angle, r, 1);

        if (this.settings.get('outset')) {
            this.boxes.polyline(0, 90, this.settings.get('outset'), -180);
        } else {
            this.boxes.corner(-90);
        }
    }

    margin() {
        return this.settings.get('height') + this.settings.get('radius');
    }
}

class RoundedTriangleFingerHolesEdge extends RoundedTriangleEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "T";
    }

    startwidth() {
        return this.settings.thickness;
    }

    draw(length, kw={}) {
        this.boxes.fingerHolesAt(0, 0.5 * this.settings.thickness, length, 0);
        super.draw(length, kw);
    }
}

class HandleEdgeSettings extends Settings {
    static absolute_params = {
        "height": 20.,
        "radius": 10.,
        "hole_width": "40:40",
        "hole_height": 75.,
        "on_sides": true,
    };
    static relative_params = {
        "outset": 1.,
    };

    edgeObjects(boxes, chars="yY", add=true) {
        const edges = [
            new HandleEdge(boxes, this),
            new HandleHoleEdge(boxes, this)
        ];
        if (edges[0]) edges[0].char = chars[0];
        if (edges[1] && chars.length > 1) edges[1].char = chars[1];

        if (add) boxes.addParts(edges);
        return edges;
    }
}

class HandleEdge extends Edge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "y";
        this.extra_height = 0.0;
    }

    draw(length, kw={}) {
        let len = length + 2 * this.settings.get('outset');
        let extra_height = this.extra_height * this.settings.thickness;

        let r = this.settings.get('radius');
        if (r > len / 2) r = len / 2;
        if (r > this.settings.get('height')) r = this.settings.get('height');

        const widths = argparseSections(String(this.settings.get('hole_width')));

        if (this.settings.get('outset')) {
            this.boxes.polyline(0, -180, this.settings.get('outset'), 90);
        } else {
            this.boxes.corner(-90);
        }

        const sum_widths = widths.reduce((a, b) => a + b, 0);

        if (this.settings.get('hole_height') && sum_widths > 0) {
            let slot_offset = 0;
            if (sum_widths < 100) {
                slot_offset = ((1 - sum_widths / 100) * (len - (widths.length + 1) * this.settings.thickness)) / (widths.length * 2);
            }

            const slot_height = (this.settings.get('height') - 2 * this.settings.thickness) * this.settings.get('hole_height') / 100;
            let slot_x = this.settings.thickness + slot_offset;

            for (const w of widths) {
                let slotwidth;
                if (sum_widths > 100) {
                    slotwidth = w / sum_widths * (len - (widths.length + 1) * this.settings.thickness);
                } else {
                    slotwidth = w / 100 * (len - (widths.length + 1) * this.settings.thickness);
                }
                slot_x += slotwidth / 2;

                this.boxes.ctx.save();
                this.boxes.moveTo((this.settings.get('height') / 2) + extra_height, slot_x, 0);
                // rectangularHole(x, y, dx, dy, r=0)
                this.boxes.rectangularHole(0, 0, slot_height, slotwidth, slot_height / 2);
                this.boxes.ctx.restore();

                slot_x += slotwidth / 2 + slot_offset + this.settings.thickness + slot_offset;
            }
        }

        this.boxes.edge(this.settings.get('height') - r + extra_height, 1);
        this.boxes.corner(90, r, 1);
        this.boxes.edge(len - 2 * r, 1);
        this.boxes.corner(90, r, 1);
        this.boxes.edge(this.settings.get('height') - r + extra_height, 1);

        if (this.settings.get('outset')) {
            this.boxes.polyline(0, 90, this.settings.get('outset'), -180);
        } else {
            this.boxes.corner(-90);
        }
    }

    margin() {
        return this.settings.get('height');
    }
}

class HandleHoleEdge extends HandleEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "Y";
        this.extra_height = 1.0;
    }

    draw(length, kw={}) {
        this.boxes.fingerHolesAt(0, -0.5 * this.settings.thickness, length, 0);
        super.draw(length, kw);
    }

    margin() {
        return this.settings.get('height') + this.extra_height * this.settings.thickness;
    }
}

const edges = {
    argparseSections, BoltPolicy, Bolts, Settings, BaseEdge, Edge, OutSetEdge, NoopEdge,
    MountingSettings, MountingEdge,
    GroovedSettings, GroovedEdgeBase, GroovedEdge, GroovedEdgeCounterPart,
    GripSettings, GrippingEdge,
    CompoundEdge,
    Slot, SlottedEdge,
    FingerJointSettings, FingerJointBase, FingerJointEdge, FingerJointEdgeCounterPart, FingerHoles, FingerHoleEdge, CrossingFingerHoleEdge,
    StackableSettings, StackableBaseEdge, StackableEdge, StackableEdgeTop, StackableFeet, StackableHoleEdgeTop,
    HingeSettings, Hinge, HingePin,
    ChestHingeSettings, ChestHinge, ChestHingeTop, ChestHingePin, ChestHingeFront,
    CabinetHingeSettings, CabinetHingeEdge,
    SlideOnLidSettings, LidEdge, LidHoleEdge, LidRight, LidLeft, LidSideRight, LidSideLeft,
    ClickSettings, ClickConnector, ClickEdge,
    DoveTailSettings, DoveTailJoint, DoveTailJointCounterPart,
    FlexSettings, FlexEdge,
    GearSettings, RackEdge,
    RoundedTriangleEdgeSettings, RoundedTriangleEdge, RoundedTriangleFingerHolesEdge,
    HandleEdgeSettings, HandleEdge, HandleHoleEdge
};
edges.edges = edges;

export {
    argparseSections, BoltPolicy, Bolts, Settings, BaseEdge, Edge, OutSetEdge, NoopEdge,
    MountingSettings, MountingEdge,
    GroovedSettings, GroovedEdgeBase, GroovedEdge, GroovedEdgeCounterPart,
    GripSettings, GrippingEdge,
    CompoundEdge,
    Slot, SlottedEdge,
    FingerJointSettings, FingerJointBase, FingerJointEdge, FingerJointEdgeCounterPart, FingerHoles, FingerHoleEdge, CrossingFingerHoleEdge,
    StackableSettings, StackableBaseEdge, StackableEdge, StackableEdgeTop, StackableFeet, StackableHoleEdgeTop,
    HingeSettings, Hinge, HingePin,
    ChestHingeSettings, ChestHinge, ChestHingeTop, ChestHingePin, ChestHingeFront,
    CabinetHingeSettings, CabinetHingeEdge,
    SlideOnLidSettings, LidEdge, LidHoleEdge, LidRight, LidLeft, LidSideRight, LidSideLeft,
    ClickSettings, ClickConnector, ClickEdge,
    DoveTailSettings, DoveTailJoint, DoveTailJointCounterPart,
    FlexSettings, FlexEdge,
    GearSettings, RackEdge,
    RoundedTriangleEdgeSettings, RoundedTriangleEdge, RoundedTriangleFingerHolesEdge,
    HandleEdgeSettings, HandleEdge, HandleHoleEdge,
    edges
};
