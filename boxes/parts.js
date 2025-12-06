// Helper function from Python version - should be at module level
/**
 * Calculate the angle and radius for an arc on a circle.
 * @param {number} spanningAngle - The angle spanned by the arc.
 * @param {number} outgoingAngle - The angle at which the arc leaves the start point.
 * @param {number} r - The base radius.
 * @returns {number[]} Array containing [angle, radius].
 */
function arcOnCircle(spanningAngle, outgoingAngle, r = 1.0) {
    const angle = spanningAngle + 2 * outgoingAngle;
    const radius = r * Math.sin(spanningAngle * Math.PI / 360) / Math.sin((180 - outgoingAngle - 0.5 * spanningAngle) * Math.PI / 180);
    return [angle, Math.abs(radius)];
}

/**
 * Class for generating specific parts like discs, knobs, and ring segments.
 * Delegates unknown properties to the main boxes instance.
 */
class Parts {
    /**
     * Create a Parts generator.
     * @param {Boxes} boxes - The main boxes instance.
     */
    constructor(boxes) {
        this.boxes = boxes;

        // Use a Proxy to delegate attribute access to boxes (like Python's __getattr__)
        return new Proxy(this, {
            get(target, prop, receiver) {
                // First check if the property exists on Parts itself
                if (prop in target) {
                    return target[prop];
                }
                // Otherwise delegate to boxes
                if (prop in target.boxes) {
                    const value = target.boxes[prop];
                    // If it's a function, bind it to boxes
                    if (typeof value === 'function') {
                        return value.bind(target.boxes);
                    }
                    return value;
                }
                return undefined;
            }
        });
    }

    /**
     * Draw a disc with an optional hole.
     * @param {number} diameter - Diameter of the disc.
     * @param {number|Object} [hole=0] - Diameter of center hole, or options object.
     * @param {number} [dwidth=1.0] - Width factor (scaling).
     * @param {Function} [callback=null] - Callback for drawing on the disc.
     * @param {string} [move=""] - Move commands.
     * @param {string} [label=""] - Label for the part.
     */
    disc(diameter, hole = 0, dwidth = 1.0, callback = null, move = "", label = "") {
        // Handle options object as second parameter
        if (typeof hole === 'object' && hole !== null) {
            const opts = hole;
            hole = opts.hole || 0;
            dwidth = opts.dwidth !== undefined ? opts.dwidth : 1.0;
            callback = opts.callback || null;
            move = opts.move || "";
            label = opts.label || "";
        }
        
        const size = diameter;
        const r = diameter / 2.0;

        if (this.move(size * dwidth, size, move, true, label)) {
            return;
        }

        this.moveTo(size / 2, size / 2);

        if (hole) {
            this.hole(0, 0, hole / 2);
        }

        this.cc(callback, null, 0, 0);

        if (dwidth === 1.0) {
            this.moveTo(r + this.burn, 0, 90);
            this.corner(360, r, 6);
        } else {
            const w = (2.0 * dwidth - 1) * r;
            const a = Math.acos(w / r) * 180 / Math.PI;
            this.moveTo(0, 0, -a);
            this.moveTo(r, 0, -90);
            this.corner(-360 + 2 * a, r);
            this.corner(-a);
            this.edge(2 * r * Math.sin(a * Math.PI / 180));
        }
        this.move(size * dwidth, size, move, label);
    }

    /**
     * Draw a wavy knob.
     * @param {number} diameter - Diameter of the knob.
     * @param {number} [n=20] - Number of waves.
     * @param {number} [angle=45] - Angle of the waves.
     * @param {number} [hole=0] - Center hole diameter.
     * @param {Function} [callback=null] - Callback function.
     * @param {string} [move=""] - Move commands.
     */
    wavyKnob(diameter, n = 20, angle = 45, hole = 0, callback = null, move = "") {
        if (n < 2) {
            return;
        }

        const size = diameter + Math.PI * diameter / n;

        if (this.move(size, size, move, true)) {
            return;
        }

        this.moveTo(size / 2, size / 2);
        this.cc(callback, null, 0, 0);

        if (hole) {
            this.hole(0, 0, hole / 2);
        }

        this.moveTo(diameter / 2, 0, 90 - angle);

        const [a, r] = arcOnCircle(360 / n / 2, angle, diameter / 2);
        const [a2, r2] = arcOnCircle(360 / n / 2, -angle, diameter / 2);

        for (let i = 0; i < n; i++) {
            const tabs = (i % Math.max(1, Math.floor((n + 1) / 6)) === 0);
            this.corner(a, r, tabs);
            this.corner(a2, r2);
        }

        this.move(size, size, move);
    }

    /**
     * Draw a concave knob.
     * @param {number} diameter - Diameter of the knob.
     * @param {number} [n=3] - Number of indentations.
     * @param {number} [rounded=0.2] - Roundness factor.
     * @param {number} [angle=70] - Angle of indentations.
     * @param {number} [hole=0] - Center hole diameter.
     * @param {Function} [callback=null] - Callback function.
     * @param {string} [move=""] - Move commands.
     */
    concaveKnob(diameter, n = 3, rounded = 0.2, angle = 70, hole = 0, callback = null, move = "") {
        if (n < 2) {
            return;
        }

        const size = diameter;

        if (this.move(size, size, move, true)) {
            return;
        }

        this.moveTo(size / 2, size / 2);

        if (hole) {
            this.hole(0, 0, hole / 2);
        }

        this.cc(callback, null, 0, 0);
        this.moveTo(diameter / 2, 0, 90 + angle);

        let [a, r] = arcOnCircle(360 / n * (1 - rounded), -angle, diameter / 2);

        if (Math.abs(a) < 0.01) {  // avoid trying to make a straight line as an arc
            [a, r] = arcOnCircle(360 / n * (1 - rounded), -angle - 0.01, diameter / 2);
        }

        for (let i = 0; i < n; i++) {
            const tabs = (i % Math.max(1, Math.floor((n + 1) / 6)) === 0);
            this.corner(a, r);
            this.corner(angle);
            this.corner(360 / n * rounded, diameter / 2, tabs);
            this.corner(angle);
        }

        this.move(size, size, move);
    }

    /**
     * Draw a rounded knob.
     * @param {number} diameter - Diameter of the knob.
     * @param {number} [n=20] - Number of segments (not used in current logic, maybe legacy).
     * @param {Function} [callback=null] - Callback function.
     * @param {string} [move=""] - Move commands.
     */
    roundKnob(diameter, n = 20, callback = null, move = "") {
        const size = diameter + diameter / n;

        if (this.move(size, size, move, true)) {
            return;
        }

        this.moveTo(size / 2, size / 2);
        this.cc(callback, null, 0, 0);
        this.move(size, size, move);
    }

    /**
     * Draw a segment of a ring.
     * @param {number} r_outside - Outer radius.
     * @param {number} r_inside - Inner radius.
     * @param {number} angle - Angle of the segment.
     * @param {number} [n=1] - Number of segments to draw.
     * @param {string} [move=""] - Move commands.
     */
    ringSegment(r_outside, r_inside, angle, n = 1, move = "") {
        const space = 360 * this.spacing / r_inside / 2 / Math.PI;
        let nc = Math.min(n, Math.floor(360 / (angle + space)));

        while (n > 0) {
            if (this.move(2 * r_outside, 2 * r_outside, move, true)) {
                return;
            }

            this.moveTo(0, r_outside, -90);
            for (let i = 0; i < nc; i++) {
                this.polyline(
                    0, [angle, r_outside], 0, 90, [r_outside - r_inside, 2],
                    90, 0, [-angle, r_inside], 0, 90, [r_outside - r_inside, 2],
                    90
                );
                const [x, y] = this.circlePoint(r_outside, (angle + space) * Math.PI / 180);
                this.moveTo(y, r_outside - x, (angle + space) * 180 / Math.PI);
                n--;
                if (n === 0) {
                    break;
                }
            }
            this.move(2 * r_outside, 2 * r_outside, move);
        }
    }

    /**
     * Helper function for calculating circle point.
     * @param {number} radius - Radius of the circle.
     * @param {number} angle - Angle in radians.
     * @returns {number[]} The [x, y] coordinates.
     */
    circlePoint(radius, angle) {
        return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }
}

export { Parts };
