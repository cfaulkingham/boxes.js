const { Color } = require('./Color');
const { SVGContext } = require('./svg_context');
const { Matrix } = require('./matrix');
const { normalize, vlength, vclip, vdiff, vadd, vorthogonal, vscalmul, dotproduct, circlepoint, tangent, kerf } = require('./vectors');

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
    }

    draw(length, kw = {}) {
        const { bedBolts, bedBoltSettings } = kw;
        // Simplified: ignoring bedBolts for now as ABox doesn't seem to heavily use them or we can implement later.
        this.boxes.edge(length); // Using boxes.edge helper which eventually calls ctx.line_to
    }
}

class OutSetEdge extends Edge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = 'E';
    }

    startwidth() {
        return this.settings ? this.settings.get('thickness') : this.boxes.thickness;
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
        return this.positive ? widths[0] : widths[1]; // Python: widths[self.positive] -> boolean as index? True=1, False=0. widths[0] if False??
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
        this.fingerHoles = new FingerHoles(boxes, settings);
    }

    draw(length, kw={}) {
        const dist = this.settings.get('edge_width');
        this.boxes.ctx.save();
        this.fingerHoles.draw(0, this.boxes.burn + dist + this.settings.thickness / 2, length, 0);
        this.boxes.ctx.restore();
        this.boxes.edge(length, 2);
    }

    startwidth() {
        return this.settings.get('edge_width') + this.settings.thickness;
    }

    margin() {
        return 0.0;
    }
}

const edges = {
    Settings, BaseEdge, Edge, OutSetEdge, FingerJointSettings, FingerJointEdge, FingerJointEdgeCounterPart, FingerHoleEdge, FingerHoles
};
edges.edges = edges;

module.exports = edges;
