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
        const t = this.thickness;
        const style = this.settings.get('style');
        const height = this.height; // via proxy/getattr -> settings or boxes

        if (style === "flat") {
            this.rectangularWall(x, y, "eeee", {
                                 callback: [this.handleCB(x, y)],
                                 move: "up", label: "lid bottom"});
            this.rectangularWall(x, y, "EEEE", {
                                 callback: [this.handleCB(x, y)],
                                 move: "up", label: "lid top"});
        } else if (style === "chest") {
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
                x2 += 2*t + this.play;
                y2 += 2*t + this.play;
            }
            this.rectangularWall(x2, y2, "ffff", {
                                 callback: [this.handleCB(x2, y2)],
                                 move: "up", label: "lid top"});
            // front/back top pieces
            this.rectangularWall(x2, this.height, b +"FFF", {
                                 ignore_widths: [1, 2, 5, 6], move: "up", label: "lid front"});
            this.rectangularWall(x2, this.height, b + "FFF", {
                                 ignore_widths: [1, 2, 5, 6], move: "up", label: "lid back"});
            // left/right sides
            this.rectangularWall(y2, this.height, b + "fFf", {
                                 ignore_widths: [1, 2, 5, 6], move: "up", label: "lid left"});
            this.rectangularWall(y2, this.height, b + "fFf", {
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
        const t = this.thickness;
        return () => {
             if (this.handle && this.handle.startsWith("long")) {
                 this.rectangularHole(x/2, y/2, x/2, t);
             } else if (this.handle && this.handle.startsWith("knob")) {
                 // Simplified knob drawing
                 const h = 3*t;
                 const v = 3*t;
                 this.moveTo((x - t) / 2 + this.burn, (y - t) / 2 + this.burn, 180);
                 this.ctx.stroke();
                 this.ctx.save();
                 this.set_source_color(Color.INNER_CUT);
                 this.polyline(h, -90, t, -90, h, 90, v, 90, t, 90, v, -90); // approximate loop
                 this.ctx.restore();
                 this.ctx.stroke();
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
        const t = this.thickness;
        const hh = this.handle_height;
        const tw = x/2 + 2*t;
        const th = hh + 2*t;

        if (this.move(tw, th, move, true)) return;
        // Drawing logic...
        this.rectangularWall(tw, th, "e", {move:false}); // Stub
        this.move(tw, th, move);
    }

    knobHandle(x, y, style, move=null) {
        // Implementation omitted/simplified
        const t = this.thickness;
        const hh = this.handle_height;
        const tw = 2 * 7 * t + this.spacing;
        const th = hh + 2*t;

        if (this.move(tw, th, move, true)) return;
        // Drawing logic...
        this.rectangularWall(tw, th, "e", {move:false}); // Stub
        this.move(tw, th, move);
    }

    chestSide(x, angle=0, move="", label="") {
        const t = this.thickness;
        // getChestR logic
        const d = x - 2 * Math.sin(angle * Math.PI / 180) * (3*t);
        const r = d / 2.0 / Math.cos(angle * Math.PI / 180);

        if (this.move(x+2*t, 0.5*x+3*t, move, true, label)) return;

        // Simplified drawing
        this.rectangularWall(x+2*t, 0.5*x+3*t, "e", {move:false});

        this.move(x+2*t, 0.5*x+3*t, move, false, label);
    }

    chestTop(x, y, angle=0, callback=null, move=null, label="") {
         // Stub
         const t = this.thickness;
         if (this.move(x, y, move, true, label)) return;
         this.rectangularWall(x, y, "e", {move:false});
         this.move(x, y, move, false, label);
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
