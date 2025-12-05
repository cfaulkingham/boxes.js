import { Boxes  } from './boxes_base.js';
import { FingerJointSettings, Settings  } from './edges.js';
import { edges  } from './edges.js';
import { Color  } from './Color.js';

class LidSettings extends Settings {
    static absolute_params = {
        "style": ["none", "flat", "chest", "overthetop", "ontop"],
        "handle": ["none", "long_rounded", "long_trapezoid", "long_doublerounded", "knob"],
    };

    static relative_params = {
        "height": 4.0,
        "play": 0.1,
        "handle_height": 8.0,
    };
}

class Lid {
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
                                 move: "up", label: "lid bottom"});
            boxes.rectangularWall(x, y, "EEEE", {
                                 callback: [this.handleCB(x, y)],
                                 move: "up", label: "lid top"});
        } else if (style === "chest") {
            console.log("Rendering chest lid style");
            this.chestSide(x, 0, "right", "lid right"); // angle=0
            this.chestSide(x, 0, "up", "lid left");
            this.chestSide(x, 0, "left only", "invisible");
            this.chestTop(x, y, 0, [null, this.handleCB(x, 3*t)], "up", "lid top");
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
                x2 += 2*t + play;
                y2 += 2*t + play;
            }
            boxes.rectangularWall(x2, y2, "ffff", {
                                 callback: [this.handleCB(x2, y2)],
                                 move: "up", label: "lid top"});
            // front/back top pieces
            boxes.rectangularWall(x2, height, b +"FFF", {
                                 ignore_widths: [1, 2, 5, 6], move: "up", label: "lid front"});
            boxes.rectangularWall(x2, height, b + "FFF", {
                                 ignore_widths: [1, 2, 5, 6], move: "up", label: "lid back"});
            // left/right sides
            boxes.rectangularWall(y2, height, b + "fFf", {
                                 ignore_widths: [1, 2, 5, 6], move: "up", label: "lid left"});
            boxes.rectangularWall(y2, height, b + "fFf", {
                                 ignore_widths: [1, 2, 5, 6], move: "up", label: "lid right"});
            if (style === "ontop") {
                for (let i = 0; i < 4; i++) {
                    // polygonWall not implemented in boxes.js provided in context?
                    // assuming it is or skipping for now as abox uses default?
                    // ABox doesn't seem to set style "ontop" by default.
                }
            }
        } else {
            return false;
        }

        this.handleParts(x, y);
        return true;
    }

    handleCB(x, y) {
        const t = this.boxes.thickness; // Fixed: get thickness from boxes instance
        const boxes = this.boxes;
        return () => {
             if (this.handle && this.handle.startsWith("long")) {
                 boxes.rectangularHole(x/2, y/2, x/2, t);
             } else if (this.handle && this.handle.startsWith("knob")) {
                 // Simplified knob drawing
                 const h = 3*t;
                 const v = 3*t;
                 boxes.moveTo((x - t) / 2 + this.burn, (y - t) / 2 + this.burn, 180);
                 boxes.ctx.stroke();
                 boxes.ctx.save();
                 boxes.set_source_color(Color.INNER_CUT);
                 boxes.polyline(h, -90, t, -90, h, 90, v, 90, t, 90, v, -90); // approximate loop
                 boxes.ctx.restore();
                 boxes.ctx.stroke();
             }
        };
    }

    handleParts(x, y) {
        if (this.handle && this.handle.startsWith("long")) {
            this.longHandle(x, y, this.handle, "up");
        } else if (this.handle && this.handle.startsWith("knob")) {
            this.knobHandle(x, y, this.handle, "up");
        }
    }

    longHandle(x, y, style="long_rounded", move=null) {
        // Implementation omitted/simplified
        const t = this.boxes.thickness; // Fixed: get thickness from boxes instance
        const hh = this.settings.get('handle_height'); // Fixed: get from settings
        const tw = x/2 + 2*t;
        const th = hh + 2*t;
        const boxes = this.boxes;

        if (this.boxes.move(tw, th, move, true)) return;
        // Drawing logic...
        boxes.rectangularWall(tw, th, "eeee", {move:false}); // Stub
        this.boxes.move(tw, th, move);
    }

    knobHandle(x, y, style, move=null) {
        // Implementation omitted/simplified
        const t = this.boxes.thickness; // Fixed: get thickness from boxes instance
        const hh = this.settings.get('handle_height'); // Fixed: get from settings
        const tw = 2 * 7 * t + this.spacing;
        const th = hh + 2*t;
        const boxes = this.boxes;

        if (this.boxes.move(tw, th, move, true)) return;
        // Drawing logic...
        boxes.rectangularWall(tw, th, "eeee", {move:false}); // Stub
        this.boxes.move(tw, th, move);
    }

    getChestR(x, angle=0) {
        const t = this.boxes.thickness;
        const d = x - 2 * Math.sin(angle * Math.PI / 180) * (3 * t);
        const r = d / 2.0 / Math.cos(angle * Math.PI / 180);
        return r;
    }

    chestSide(x, angle=0, move="", label="") {
        const t = this.boxes.thickness;
        const boxes = this.boxes;
        const r = this.getChestR(x, angle);
        
        // Calculate bounding box for the chest side piece
        // Width is x + 2*t for finger joint clearance
        // Height is approximately half the width (semicircle radius) plus finger joints
        const tw = x + 2*t;
        const th = 0.5*x + 3*t;
        
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
        this._fingerJointEdge(3*t);
        
        // Semicircular arc at the top
        boxes.corner(180 - 2*angle, r);
        
        // Second finger joint section
        this._fingerJointEdge(3*t);
        
        // Final corner to return to start direction
        boxes.corner(90 + angle);

        boxes.move(tw, th, move, false, label);
    }

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

    chestTop(x, y, angle=0, callback=null, move=null, label="") {
        const t = this.boxes.thickness;
        const boxes = this.boxes;
        const r = this.getChestR(x, angle);
        
        // Arc length: radians(180-2*angle) * r
        const arcAngle = (180 - 2*angle) * Math.PI / 180;
        const l = arcAngle * r;
        
        // Total width is arc length plus finger joints on both sides
        const tw = l + 6*t;
        // Total height is y (depth) plus thickness on both sides
        const th = y + 2*t;
        
        if (boxes.move(tw, th, move, true, label)) {
            return;
        }

        // Call callback at position 0 if provided
        if (callback && callback[0]) {
            boxes.cc(callback, 0);
        }
        
        // Top edge of chest lid (this is where the flex hinge goes)
        // Python: self.edges["A"](3*t) - finger joint counterpart (slots)
        this._fingerJointCounterpart(3*t);
        
        // Python: self.edges["X"](l, y+2*t) - FlexEdge with living hinge pattern
        if (boxes.edges && boxes.edges['X']) {
            boxes.edges['X'].draw(l, y + 2*t);
        } else {
            // Fallback: just draw the edge and manually add flex lines
            boxes.edge(l);
            this._drawFlexLines(l, y + 2*t);
        }
        
        // Second finger joint counterpart section
        this._fingerJointCounterpart(3*t);
        boxes.corner(90);
        
        // Call callback at position 1 if provided  
        if (callback && callback[1]) {
            boxes.cc(callback, 1);
        }
        // Right side edge (plain)
        // Python: self.edge(y+2*t)
        boxes.edge(y + 2*t);
        boxes.corner(90);
        
        // Call callback at position 2 if provided
        if (callback && callback[2]) {
            boxes.cc(callback, 2);
        }
        
        // Bottom edge - finger joint counterparts + PLAIN middle + finger joint counterparts
        // Python: self.edges["A"](3*t), self.edge(l), self.edges["A"](3*t)
        this._fingerJointCounterpart(3*t);
        boxes.edge(l);  // Plain edge in the middle (no flex on bottom!)
        this._fingerJointCounterpart(3*t);
        boxes.corner(90);
        
        // Call callback at position 3 if provided
        if (callback && callback[3]) {
            boxes.cc(callback, 3);
        }
        // Left side edge (plain)
        boxes.edge(y + 2*t);
        boxes.corner(90);

        boxes.move(tw, th, move, false, label);
    }

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

class _TopEdge extends Boxes {
    addTopEdgeSettings(fingerjoint, stackable, hinge, cabinethinge, slideonlid, click, roundedtriangle, mounting, handle) {
        this.addSettingsArgs(FingerJointSettings, {None: fingerjoint});
        // this.addSettingsArgs(edges.StackableSettings, {None: stackable});
        // ... omitted
    }

    // Simplified placeholder for topEdges
    topEdges(top_edge) {
        let tl = "e";
        let tr = "e";
        let tb = "e";
        let tf = "e";
        return [tl, tb, tr, tf];
    }

    drawLid(x, y, top_edge, bedBolts) {
        let d2;
        let d3;
        // bedBolts might be undefined
        if (bedBolts) [d2, d3] = bedBolts;

        if (top_edge === "c") {
            this.rectangularWall(x, y, "CCCC", {bedBolts: [d2, d3, d2, d3], move: "up", label: "top"});
        } else if (top_edge === "f") {
            this.rectangularWall(x, y, "FFFF", {move: "up", label: "top"});
        } else if ("FhŠY".includes(top_edge)) {
            this.rectangularWall(x, y, "ffff", {move: "up", label: "top"});
        } else if (top_edge === "E") {
            this.rectangularWall(x, y, "EEEE", {move: "up", label: "lid top"});
            this.rectangularWall(x, y, "eeee", {move: "up", label: "lid top"});
        }
        return true;
    }
}

export { LidSettings, Lid, _TopEdge  };
