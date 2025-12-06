import { Boxes } from './boxes_base.js';
import { FingerJointSettings, Settings } from './edges.js';
import { edges } from './edges.js';
import { Color } from './Color.js';

/**
 * Settings for Lid generation.
 * Defines supported lid styles and handle types.
 */
class LidSettings extends Settings {
    /** @type {Object} Absolute parameters (enums/choices) */
    static absolute_params = {
        "style": ["none", "flat", "chest", "overthetop", "ontop"],
        "handle": ["none", "long_rounded", "long_trapezoid", "long_doublerounded", "knob"],
    };

    /** @type {Object} Relative parameters (numeric values) */
    static relative_params = {
        "height": 4.0,
        "play": 0.1,
        "handle_height": 8.0,
    };
}

/**
 * Lid generator class.
 * delegates calls to the main boxes instance via a Proxy.
 */
class Lid {
    /**
     * Create a Lid generator.
     * @param {Boxes} boxes - The main boxes instance.
     * @param {LidSettings} settings - The lid settings.
     * @returns {Proxy} A proxy that handles property access and function calls.
     */
    constructor(boxes, settings) {
        this.boxes = boxes;
        this.settings = settings;

        // The callable wrapper
        const invoke = (x, y, edge) => {
            return this.__call__(x, y, edge);
        };

        return new Proxy(invoke, {
            get: (target, prop, receiver) => {
                // 1. Lid properties/methods
                if (prop in this) {
                    const val = this[prop];
                    if (typeof val === 'function') {
                        return val.bind(receiver);
                    }
                    return val;
                }

                // 2. Settings
                if (this.settings) {
                    // Check direct property or via get()
                    if (prop in this.settings) return this.settings[prop];
                    if (this.settings.get && this.settings.get(prop) !== undefined) return this.settings.get(prop);
                }

                // 3. Boxes delegation
                if (this.boxes && prop in this.boxes) {
                    const val = this.boxes[prop];
                    if (typeof val === 'function') {
                        return val.bind(this.boxes);
                    }
                    return val;
                }

                return target[prop];
            },
            set: (target, prop, value, receiver) => {
                this[prop] = value;
                return true;
            }
        });
    }

    /**
     * Main entry point for generating a lid.
     * @param {number} x - Width.
     * @param {number} y - Depth.
     * @param {string} edge - Edge type.
     * @returns {boolean} True if lid was generated, false otherwise.
     */
    __call__(x, y, edge) {
        console.log("\n=== Lid.__call__ Debug ===");
        console.log("x:", x, "y:", y, "edge:", edge);

        const t = this.boxes.thickness; // Fixed: get thickness from boxes instance
        const style = this.settings.get('style');
        const height = this.settings.get('height'); // Fixed: get height from settings

        console.log("thickness:", t);
        console.log("style from settings.get('style'):", style);
        console.log("this.settings.values.style:", this.settings.values.style);
        console.log("height:", height);

        // Use the boxes instance for method calls
        const boxes = this.boxes;
        console.log("boxes instance:", typeof boxes);

        if (style === "flat") {
            console.log("Rendering flat lid style");
            boxes.rectangularWall(x, y, "eeee", {
                callback: [this.handleCB(x, y)],
                move: "up", label: "lid bottom"
            });
            boxes.rectangularWall(x, y, "EEEE", {
                callback: [this.handleCB(x, y)],
                move: "up", label: "lid top"
            });
        } else if (style === "chest") {
            console.log("Rendering chest lid style");
            this.chestSide(x, 0, "right", "lid right"); // angle=0
            this.chestSide(x, 0, "up", "lid left");
            this.chestSide(x, 0, "left only", "invisible");
            this.chestTop(x, y, 0, [null, this.handleCB(x, 3 * t)], "up", "lid top");
        } else if (style === "overthetop" || style === "ontop") {
            let x2 = x;
            let y2 = y;
            const b_map = {
                "Š": "š",
                "S": "š",
            };
            const b = b_map[edge] || "e";

            if (style === "overthetop") {
                const play = this.settings.get('play');
                x2 += 2 * t + play;
                y2 += 2 * t + play;
            }
            boxes.rectangularWall(x2, y2, "ffff", {
                callback: [this.handleCB(x2, y2)],
                move: "up", label: "lid top"
            });
            // front/back top pieces
            boxes.rectangularWall(x2, height, b + "FFF", {
                ignore_widths: [1, 2, 5, 6], move: "up", label: "lid front"
            });
            boxes.rectangularWall(x2, height, b + "FFF", {
                ignore_widths: [1, 2, 5, 6], move: "up", label: "lid back"
            });
            // left/right sides
            boxes.rectangularWall(y2, height, b + "fFf", {
                ignore_widths: [1, 2, 5, 6], move: "up", label: "lid left"
            });
            boxes.rectangularWall(y2, height, b + "fFf", {
                ignore_widths: [1, 2, 5, 6], move: "up", label: "lid right"
            });
            if (style === "ontop") {
                // Draw 4 corner brim pieces for ontop lid style
                for (let i = 0; i < 4; i++) {
                    // Each piece: vertical edge (2*t), rounded corner, height section, corner, horizontal (4*t), corner, height section, rounded corner
                    // Python: (2*t, (90, t), t+height, 90, 4*t, 90, t+height, (90, t))
                    const brimPoly = [
                        2 * t,
                        [90, t],           // rounded corner radius t
                        t + height,
                        90,
                        4 * t,
                        90,
                        t + height,
                        [90, t]            // rounded corner radius t
                    ];

                    if (boxes.polygonWall) {
                        boxes.polygonWall(brimPoly, "e", { move: "up", label: "lid\\nbrim" });
                    } else {
                        // Fallback if polygonWall doesn't exist - draw with polyline
                        // This needs proper implementation in boxes_base.js
                        console.warn("polygonWall not implemented, skipping ontop brim pieces");
                    }
                }
            }
        } else {
            return false;
        }

        this.handleParts(x, y);
        return true;
    }

    /**
     * Get the callback for drawing handles.
     * @param {number} x - Width.
     * @param {number} y - Depth.
     * @returns {Function} Callback function to draw the handle hole/features.
     */
    handleCB(x, y) {
        const t = this.boxes.thickness; // Fixed: get thickness from boxes instance
        const boxes = this.boxes;
        const handle = this.settings.get('handle'); // Fixed: get handle from settings
        const burn = this.boxes.burn || 0;
        return () => {
            if (handle && handle.startsWith("long")) {
                // Create a rectangular slot in the center of the lid for finger grip
                boxes.rectangularHole(x / 2, y / 2, x / 2, t);
            } else if (handle && handle.startsWith("knob")) {
                // Draw 4 L-shaped cutouts for the knob mounting posts
                // These form a cross pattern in the center of the lid
                const h = 3 * t;
                const v = 3 * t;

                // Move to center of the lid, offset for the cutout pattern
                boxes.moveTo((x - t) / 2 + burn, (y - t) / 2 + burn, 180);
                boxes.ctx.stroke();
                boxes.ctx.save();

                // Draw 4 L-shaped cutouts (one for each corner of the knob mounting)
                // Each L-shape: line of length h, turn, slot width t, turn, line h, then turn 90 to next
                for (const l of [h, v, h, v]) {
                    boxes.polyline(l, -90, t, -90, l, 90);
                }

                boxes.ctx.restore();
                boxes.ctx.stroke();
            }
        };
    }

    /**
     * Draw handle parts if required by settings.
     * @param {number} x - Width.
     * @param {number} y - Depth.
     */
    handleParts(x, y) {
        const handle = this.settings.get('handle'); // Fixed: get handle from settings
        if (handle && handle.startsWith("long")) {
            this.longHandle(x, y, handle, "up");
        } else if (handle && handle.startsWith("knob")) {
            this.knobHandle(x, y, handle, "up");
        }
    }

    /**
     * Draw a long handle.
     * @param {number} x - Width.
     * @param {number} y - Depth.
     * @param {string} [style="long_rounded"] - Handle style.
     * @param {string} [move=null] - Move commands.
     */
    longHandle(x, y, style = "long_rounded", move = null) {
        const t = this.boxes.thickness;
        const hh = this.settings.get('handle_height');
        const tw = x / 2 + 2 * t;
        const th = hh + 2 * t;
        const boxes = this.boxes;

        if (boxes.move(tw, th, move, true)) return;

        boxes.moveTo(0.5 * t);

        // Base poly for all long handle styles: corner and stem
        let poly = [[90, t / 2], t / 2, 90, t, -90];

        let l;  // length of the top straight section
        if (style === "long_rounded") {
            const r = Math.min(hh / 2, x / 4);
            poly = poly.concat([t + hh - r, [90, r]]);
            l = x / 2 - 2 * r;
        } else if (style === "long_trapezoid") {
            poly = poly.concat([t, [45, t], (hh - t) * Math.sqrt(2), [45, t]]);
            l = x / 2 - 2 * hh;
        } else if (style === "long_doublerounded") {
            poly = poly.concat([t, 90, 0, [-90, hh / 2], 0, [90, hh / 2]]);
            l = x / 2 - 2 * hh;
        }

        // Build complete polyline: start + first half + top + mirrored second half
        const fullPoly = [x / 2 + t].concat(poly, [l], poly.slice().reverse());
        boxes.polyline(...fullPoly);

        boxes.move(tw, th, move);
    }

    /**
     * Draw a knob handle.
     * @param {number} x - Width.
     * @param {number} y - Depth.
     * @param {string} style - Handle style.
     * @param {string} [move=null] - Move commands.
     */
    knobHandle(x, y, style, move = null) {
        const t = this.boxes.thickness;
        const hh = this.settings.get('handle_height');
        const spacing = this.boxes.spacing || 0;
        const tw = 2 * 7 * t + spacing;
        const th = hh + 2 * t;
        const boxes = this.boxes;

        if (boxes.move(tw, th, move, true)) return;

        // Base polyline for the knob posts
        const poly = [[90, t / 2], t / 2, 90, t / 2, -90, hh - 2 * t, [90, 3 * t]];

        // Two knob pieces with different configurations
        // First piece: posts at bottom, simple top
        const bottomPosts1 = [3 * t, 90, 2 * t + hh / 2, -90, t, -90, hh / 2 + 2 * t, 90, 3 * t];
        const topPosts1 = [t];

        // Second piece: wide base, posts at top
        const bottomPosts2 = [7 * t];
        const topPosts2 = [0, 90, hh / 2, -90, t, -90, hh / 2, 90, 0];

        // First knob piece
        boxes.moveTo(0.5 * t);
        let p = bottomPosts1.concat(poly, topPosts1, poly.slice().reverse());
        boxes.polyline(...p);
        boxes.moveTo(tw / 2 + spacing);

        // Second knob piece  
        boxes.moveTo(0.5 * t);  // Reset position for second piece
        p = bottomPosts2.concat(poly, topPosts2, poly.slice().reverse());
        boxes.polyline(...p);

        boxes.move(tw, th, move);
    }

    /**
     * Calculate the radius of the chest lid arc.
     * @param {number} x - Width of the box.
     * @param {number} [angle=0] - Angle deviation.
     * @returns {number} The radius.
     */
    getChestR(x, angle = 0) {
        const t = this.boxes.thickness;
        const d = x - 2 * Math.sin(angle * Math.PI / 180) * (3 * t);
        const r = d / 2.0 / Math.cos(angle * Math.PI / 180);
        return r;
    }

    /**
     * Draw a side panel for a chest-style lid.
     * @param {number} x - Width.
     * @param {number} [angle=0] - Angle deviation.
     * @param {string} [move=""] - Move commands.
     * @param {string} [label=""] - Label for the part.
     */
    chestSide(x, angle = 0, move = "", label = "") {
        const t = this.boxes.thickness;
        const boxes = this.boxes;

        // Register special finger joint edges for chest if not already present
        if (!boxes.edges || !(boxes.edges.get ? boxes.edges.get("a") : boxes.edges["a"])) {
            // Create FingerJointSettings with finger=1.0, space=1.0 for chest
            const s = new FingerJointSettings(t, true, { finger: 1.0, space: 1.0 });
            if (s.edgeObjects) {
                s.edgeObjects(boxes, "aA.");
            }
        }

        const r = this.getChestR(x, angle);

        // Calculate bounding box for the chest side piece
        // Width is x + 2*t for finger joint clearance
        // Height is approximately half the width (semicircle radius) plus finger joints
        const tw = x + 2 * t;
        const th = 0.5 * x + 3 * t;

        if (boxes.move(tw, th, move, true, label)) {
            return;
        }

        // Draw the D-shaped chest side piece
        // Start at bottom left corner, offset by t
        boxes.moveTo(t, 0);

        // Bottom edge - PLAIN edge (no finger joints here!)
        // Python: self.edge(x)
        boxes.edge(x);

        // First corner (turn upward)
        boxes.corner(90 + angle);

        // First finger joint section for connecting to lid top
        // Python: self.edges["a"](3*t) - finger joint with tabs
        this._fingerJointEdge(3 * t);

        // Semicircular arc at the top
        boxes.corner(180 - 2 * angle, r);

        // Second finger joint section
        this._fingerJointEdge(3 * t);

        // Final corner to return to start direction
        boxes.corner(90 + angle);

        boxes.move(tw, th, move, false, label);
    }

    /**
     * Helper to draw a finger joint edge for chest lids.
     * @param {number} length - Length of the edge.
     * @private
     */
    _fingerJointEdge(length) {
        // Draw a finger joint edge with tabs (like Python "a" edge)
        // Uses finger=1.0*t, space=1.0*t as in Python FingerJointSettings for chest
        const boxes = this.boxes;
        const t = boxes.thickness;
        const finger = 1.0 * t;  // finger width (from Python: finger=1.0)
        const space = 1.0 * t;   // space between fingers (from Python: space=1.0)
        const unit = finger + space;

        // Calculate number of complete units
        const numUnits = Math.floor(length / unit);
        const leftover = length - numUnits * unit;

        // Start with half leftover
        if (leftover > 0) {
            boxes.edge(leftover / 2);
        }

        // Draw finger joints
        for (let i = 0; i < numUnits; i++) {
            // Tab (finger) - goes outward
            boxes.corner(-90);
            boxes.edge(t);
            boxes.corner(90);
            boxes.edge(finger);
            boxes.corner(90);
            boxes.edge(t);
            boxes.corner(-90);
            // Space
            boxes.edge(space);
        }

        // End with half leftover
        if (leftover > 0) {
            boxes.edge(leftover / 2);
        }
    }

    /**
     * Draw the top panel for a chest-style lid.
     * @param {number} x - Width.
     * @param {number} y - Depth.
     * @param {number} [angle=0] - Angle deviation.
     * @param {Function[]} [callback=null] - Callbacks for edge features.
     * @param {string} [move=null] - Move commands.
     * @param {string} [label=""] - Label for the part.
     */
    chestTop(x, y, angle = 0, callback = null, move = null, label = "") {
        const t = this.boxes.thickness;
        const boxes = this.boxes;

        // Register special finger joint edges for chest if not already present
        if (!boxes.edges || !(boxes.edges.get ? boxes.edges.get("a") : boxes.edges["a"])) {
            // Create FingerJointSettings with finger=1.0, space=1.0 for chest
            const s = new FingerJointSettings(t, true, { finger: 1.0, space: 1.0 });
            if (s.edgeObjects) {
                s.edgeObjects(boxes, "aA.");
            }
        }

        const r = this.getChestR(x, angle);

        // Arc length: radians(180-2*angle) * r
        const arcAngle = (180 - 2 * angle) * Math.PI / 180;
        const l = arcAngle * r;

        // Total width is arc length plus finger joints on both sides
        const tw = l + 6 * t;
        // Total height is y (depth) plus thickness on both sides
        const th = y + 2 * t;

        if (boxes.move(tw, th, move, true, label)) {
            return;
        }

        // Call callback at position 0 if provided
        if (callback && callback[0]) {
            boxes.cc(callback, 0);
        }

        // Top edge of chest lid (this is where the flex hinge goes)
        // Python: self.edges["A"](3*t) - finger joint counterpart (slots)
        this._fingerJointCounterpart(3 * t);

        // Python: self.edges["X"](l, y+2*t) - FlexEdge with living hinge pattern
        if (boxes.edges && boxes.edges['X']) {
            boxes.edges['X'].draw(l, y + 2 * t);
        } else {
            // Fallback: just draw the edge and manually add flex lines
            boxes.edge(l);
            this._drawFlexLines(l, y + 2 * t);
        }

        // Second finger joint counterpart section
        this._fingerJointCounterpart(3 * t);
        boxes.corner(90);

        // Call callback at position 1 if provided  
        if (callback && callback[1]) {
            boxes.cc(callback, 1);
        }
        // Right side edge (plain)
        // Python: self.edge(y+2*t)
        boxes.edge(y + 2 * t);
        boxes.corner(90);

        // Call callback at position 2 if provided
        if (callback && callback[2]) {
            boxes.cc(callback, 2);
        }

        // Bottom edge - finger joint counterparts + PLAIN middle + finger joint counterparts
        // Python: self.edges["A"](3*t), self.edge(l), self.edges["A"](3*t)
        this._fingerJointCounterpart(3 * t);
        boxes.edge(l);  // Plain edge in the middle (no flex on bottom!)
        this._fingerJointCounterpart(3 * t);
        boxes.corner(90);

        // Call callback at position 3 if provided
        if (callback && callback[3]) {
            boxes.cc(callback, 3);
        }
        // Left side edge (plain)
        boxes.edge(y + 2 * t);
        boxes.corner(90);

        boxes.move(tw, th, move, false, label);
    }

    /**
     * Helper to draw finger joint slots (counterparts).
     * @param {number} length - Length of the edge.
     * @private
     */
    _fingerJointCounterpart(length) {
        // Draw finger joint counterpart (slots/holes) that mate with tabs
        // Like Python "A" edge - uses finger=1.0*t, space=1.0*t
        const boxes = this.boxes;
        const t = boxes.thickness;
        const finger = 1.0 * t;  // slot width (matches finger width from "a" edge)
        const space = 1.0 * t;   // space between slots
        const unit = finger + space;

        // Calculate number of complete units
        const numUnits = Math.floor(length / unit);
        const leftover = length - numUnits * unit;

        // Start with half leftover
        if (leftover > 0) {
            boxes.edge(leftover / 2);
        }

        // Draw slots (inverse of tabs)
        for (let i = 0; i < numUnits; i++) {
            // Slot - goes inward (opposite of tab)
            boxes.corner(90);
            boxes.edge(t);
            boxes.corner(-90);
            boxes.edge(finger);
            boxes.corner(-90);
            boxes.edge(t);
            boxes.corner(90);
            // Space
            boxes.edge(space);
        }

        // End with half leftover
        if (leftover > 0) {
            boxes.edge(leftover / 2);
        }
    }

    /**
     * Helper to draw flex lines (living hinge) manually.
     * @param {number} width - Width of the flex area.
     * @param {number} height - Height of the flex area.
     * @private
     */
    _drawFlexLines(width, height) {
        // Draw living hinge lines as a fallback when FlexEdge is not available
        // This creates the pattern of cuts that allows the material to flex
        const boxes = this.boxes;
        const dist = 2.0;  // distance between flex lines
        const connection = 1.0;  // solid part at top/bottom of each line

        // Save current position
        boxes.ctx.save();

        // Move back to start of flex area
        boxes.ctx.translate(-width, 0);

        const lines = Math.floor(width / dist);
        const leftover = width - lines * dist;
        const sections = Math.max(Math.floor((height - connection) / 3), 1);
        const sheight = ((height - connection) / sections) - connection;

        for (let i = 1; i < lines; i++) {
            const pos = i * dist + leftover / 2;

            if (i % 2 !== 0) {
                boxes.ctx.move_to(pos, 0);
                boxes.ctx.line_to(pos, connection + sheight);

                for (let j = 0; j < Math.floor((sections - 1) / 2); j++) {
                    boxes.ctx.move_to(pos, (2 * j + 1) * sheight + (2 * j + 2) * connection);
                    boxes.ctx.line_to(pos, (2 * j + 3) * (sheight + connection));
                }

                if (sections % 2 === 0) {
                    boxes.ctx.move_to(pos, height - sheight - connection);
                    boxes.ctx.line_to(pos, height);
                }
            } else {
                if (sections % 2 !== 0) {
                    boxes.ctx.move_to(pos, height);
                    boxes.ctx.line_to(pos, height - connection - sheight);

                    for (let j = 0; j < Math.floor((sections - 1) / 2); j++) {
                        boxes.ctx.move_to(pos, height - ((2 * j + 1) * sheight + (2 * j + 2) * connection));
                        boxes.ctx.line_to(pos, height - (2 * j + 3) * (sheight + connection));
                    }
                } else {
                    for (let j = 0; j < Math.floor(sections / 2); j++) {
                        boxes.ctx.move_to(pos, height - connection - 2 * j * (sheight + connection));
                        boxes.ctx.line_to(pos, height - 2 * (j + 1) * (sheight + connection));
                    }
                }
            }
        }

        boxes.ctx.stroke();
        boxes.ctx.restore();
    }
}

/**
 * Mixin class for handling top edges of boxes.
 * Provides methods for configuring and drawing top edges for various lid styles.
 */
class _TopEdge extends Boxes {
    /**
     * Add settings for various top edge types.
     * @param {Object} fingerjoint - Settings for finger joints.
     * @param {Object} stackable - Settings for stackable edges.
     * @param {Object} hinge - Settings for hinges.
     * @param {Object} cabinethinge - Settings for cabinet hinges.
     * @param {Object} slideonlid - Settings for slide-on lids.
     * @param {Object} click - Settings for click-lock edges.
     * @param {Object} roundedtriangle - Settings for rounded triangle edges.
     * @param {Object} mounting - Settings for mounting edges.
     * @param {Object} handle - Settings for handles.
     */
    addTopEdgeSettings(fingerjoint, stackable, hinge, cabinethinge, slideonlid, click, roundedtriangle, mounting, handle) {
        this.addSettingsArgs(FingerJointSettings, { None: fingerjoint });
        // this.addSettingsArgs(edges.StackableSettings, {None: stackable});
        // ... omitted
    }

    /**
     * Return top edges belonging to given main edge type.
     * Returns a list containing edge characters for [left, back, right, front].
     * @param {string} top_edge - The main top edge type character.
     * @returns {string[]} Array of 4 edge characters for [left, back, right, front].
     */
    topEdges(top_edge) {
        const edge = this.edges.get ? this.edges.get(top_edge) : this.edges[top_edge];
        let tl = edge || this.edges.get ? this.edges.get("e") : this.edges["e"];
        let tb = tl;
        let tr = tl;
        let tf = tl;

        const char = edge ? (edge.char || top_edge) : top_edge;

        if (char === "i") {
            tl = tr = "e";
            tb = "j";
        } else if (char === "k") {
            tl = tr = "e";
        } else if (char === "L") {
            tl = "M";
            tf = "e";
            tr = "N";
        } else if (char === "v") {
            tl = tr = tf = "e";
        } else if (char === "t") {
            tf = tb = "e";
        } else if (char === "G") {
            tl = tb = tr = tf = "e";
            const gEdge = this.edges.get ? this.edges.get("G") : this.edges["G"];
            if (gEdge && gEdge.settings) {
                const side = gEdge.settings.side;
                // Assuming MountingSettings constants
                if (side === "left") {
                    tl = "G";
                } else if (side === "right") {
                    tr = "G";
                } else if (side === "front") {
                    tf = "G";
                } else { // back
                    tb = "G";
                }
            }
        } else if (char === "y") {
            tl = tb = tr = tf = "e";
            const yEdge = this.edges.get ? this.edges.get("y") : this.edges["y"];
            if (yEdge && yEdge.settings) {
                if (yEdge.settings.on_sides === true) {
                    tl = tr = "y";
                } else {
                    tb = tf = "y";
                }
            }
        } else if (char === "Y") {
            tl = tb = tr = tf = "h";
            const YEdge = this.edges.get ? this.edges.get("Y") : this.edges["Y"];
            if (YEdge && YEdge.settings) {
                if (YEdge.settings.on_sides === true) {
                    tl = tr = "Y";
                } else {
                    tb = tf = "Y";
                }
            }
        }

        return [tl, tb, tr, tf];
    }

    /**
     * Draw a lid based on the top edge type.
     * @param {number} x - Width.
     * @param {number} y - Depth.
     * @param {string} top_edge - Top edge type.
     * @param {number[]} [bedBolts] - Bed bolt dimensions [d2, d3] (optional).
     */
    drawLid(x, y, top_edge, bedBolts) {
        let d2, d3;
        // bedBolts might be undefined
        if (bedBolts) [d2, d3] = bedBolts;

        if (top_edge === "c") {
            this.rectangularWall(x, y, "CCCC", { bedBolts: [d2, d3, d2, d3], move: "up", label: "top" });
        } else if (top_edge === "f") {
            this.rectangularWall(x, y, "FFFF", { move: "up", label: "top" });
        } else if ("FhŠY".includes(top_edge)) {
            this.rectangularWall(x, y, "ffff", { move: "up", label: "top" });
        } else if (top_edge === "L") {
            this.rectangularWall(x, y, "Enlm", { move: "up", label: "lid top" });
        } else if (top_edge === "i") {
            this.rectangularWall(x, y, "JeIE", { move: "up", label: "lid top" });
        } else if (top_edge === "k") {
            const kEdge = this.edges.get ? this.edges.get("k") : this.edges["k"];
            const outset = kEdge && kEdge.settings ? kEdge.settings.outset : false;

            if (kEdge && kEdge.settings) {
                kEdge.settings.setValues(this.thickness, { outset: true });
            }

            const lx = x / 2.0 - 0.1 * this.thickness;

            if (kEdge && kEdge.settings) {
                kEdge.settings.setValues(this.thickness, { grip_length: 5 });
            }

            this.rectangularWall(lx, y, "IeJe", { move: "right", label: "lid top left" });
            this.rectangularWall(lx, y, "IeJe", { move: "mirror up", label: "lid top right" });
            this.rectangularWall(lx, y, "IeJe", { move: "left only", label: "invisible" });

            if (kEdge && kEdge.settings) {
                // Restore settings if needed (mock implementation just sets values)
                // kEdge.settings.setValues(this.thickness, {outset: outset});
            }
        } else if (top_edge === "v") {
            this.rectangularWall(x, y, "VEEE", { move: "up", label: "lid top" });
            const vEdge = this.edges.get ? this.edges.get("v") : this.edges["v"];
            if (vEdge && vEdge.parts) {
                vEdge.parts({ move: "up" });
            }
        } else if (top_edge === "E") {
            this.rectangularWall(x, y, "EEEE", { move: "up", label: "lid top" });
            this.rectangularWall(x, y, "eeee", { move: "up", label: "lid top" });
        } else {
            return false;
        }
        return true;
    }
}

export { LidSettings, Lid, _TopEdge };
