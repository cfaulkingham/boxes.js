import { SVGContext  } from './svg_context.js';
import { Color  } from './Color.js';
import { Settings, OutSetEdge, Edge, FingerJointSettings  } from './edges.js';
import { normalize, vlength, vclip, vdiff, vadd, vorthogonal, vscalmul, dotproduct, circlepoint, tangent, kerf  } from './vectors.js';
import { NutHole, HexSizes  } from './nuthole.js';
import { ArgParser } from './argparser.js';
import './globals.js';

class Boxes {
    constructor() {
        this.ctx = new SVGContext();
        this.edges = {};
        this.argparser = new ArgParser();
        this.thickness = 3.0; // Default
        this.burn = 0.1;
        this.spacing = 0.5; // spacing around parts
        this.format = 'svg';
        this.debug = false;
        this.labels = true;
        this.reference = 100.0;

        this.tx_sizes = {
            1 : 0.61,
            2 : 0.70,
            3 : 0.82,
            4 : 0.96,
            5 : 1.06,
            6 : 1.27,
            7 : 1.49,
            8 : 1.75,
            9 : 1.87,
            10 : 2.05,
            15 : 2.40,
            20 : 2.85,
            25 : 3.25,
            30 : 4.05,
            40 : 4.85,
            45 : 5.64,
            50 : 6.45,
            55 : 8.05,
            60 : 9.60,
            70 : 11.20,
            80 : 12.80,
            90 : 14.40,
            100 : 16.00,
        };

        this.nema_sizes = {
            //    motor,flange, holes, screws
            8: [20.3, 16, 15.4, 3],
            11: [28.2, 22, 23, 4],
            14: [35.2, 22, 26, 4],
            16: [39.2, 22, 31, 4],
            17: [42.2, 22, 31, 4],
            23: [56.4, 38.1, 47.1, 5.2],
            24: [60, 36, 49.8, 5.1],
            34: [86.3, 73, 69.8, 6.6],
            42: [110, 55.5, 89, 8.5],
        };

        // Initialize basic edges
        this.addPart(new Edge(this, null));
        this.addPart(new OutSetEdge(this, null));

        // Settings map
        this.edgesettings = {};

        this.init();
    }

    init() {
        // Can be overridden
    }

    addPart(part, name = null) {
        if (!name) {
             name = part.constructor.name;
             // Python does name[0].lower() + name[1:]
             name = name.charAt(0).toLowerCase() + name.slice(1);
        }

        if (part instanceof Edge || part instanceof OutSetEdge || (part.char && part.char.length === 1)) {
             this.edges[part.char] = part;
        } else {
             this[name] = part;
        }
    }

    addParts(parts) {
        for (const part of parts) {
            this.addPart(part);
        }
    }

    addSettingsArgs(SettingsClass, prefix=null, defaults={}) {
        // Mock implementation.
        // In python this adds arguments to argparse.
        // Here we might want to store default values.
        prefix = prefix || SettingsClass.name.replace("Settings", "");

        // Create an instance to register it (or just rely on the generator to init it later)
        // Python boxes.py instantiates settings objects in _buildObjects.
        // Here we just record we need it?
        // Actually ABox calls this in __init__.
        // Then `render` is called.
        // `_buildObjects` is called in `open`.
    }

    buildArgParser(...args) {
        // Mock
    }

    parseArgs(args) {
        // Set default values first
        this.diameter = 50.0;
        this.lugs = 10;
        this.alignment_pins = 1.0;
        this.thickness = 3.0;
        this.x = 100;
        this.y = 100;
        this.h = 100;
        this.outside = true;
        this.bottom_edge = "h";
        this.angle = 45.0; // Set default angle

        // Override with args
        for (const [key, value] of Object.entries(args)) {
            this[key] = value;

            // Check for edge settings
            // e.g. FingerJoint_thickness
            // In python: if key.startswith(setting + '_'): ...
        }
    }

    open() {
        if (this.ctx.paths.length > 0) return; // already opened?

        this._buildObjects();

        // Initial setup
        this.ctx.set_line_width(Math.max(2 * this.burn, 0.05));
        this.ctx.set_source_rgb(0, 0, 0);

        // Spacing calculation
        // this.spacing = 2 * this.burn + this.spacing[0] * this.thickness + this.spacing[1];
        // Simplified:
        this.spacing = 2 * this.burn + 0.5 * this.thickness;
    }

    close() {
        return this.ctx.finish();
    }

    _buildObjects() {
         // Re-initialize edges
         this.edges = {};
         Object.defineProperty(this.edges, 'get', {
             value: function(key, defaultVal) { return this[key] || defaultVal; },
             enumerable: false,
             writable: true
         });
         this.addPart(new Edge(this, null));
         this.addPart(new OutSetEdge(this, null));

         // Add missing edges d and D (simple edges for now if they don't exist)
         if (!this.edges['d']) {
             const e = new Edge(this, null);
             e.char = 'd';
             this.addPart(e);
         }
         if (!this.edges['D']) {
             const e = new Edge(this, null);
             e.char = 'D';
             this.addPart(e);
         }

         const fjSettings = new FingerJointSettings(this.thickness, true);
         // apply overrides from edgesettings if any
         fjSettings.edgeObjects(this);
         this.fingerHolesAt = (x, y, length, angle=90) => {
              // Find FingerHoles part
              // It's usually attached to FingerHoleEdge or available via boxes instance if added
              // In python: self.addPart(edges.FingerHoles(self, s), name="fingerHolesAt")
              // My edges.js creates FingerHoles but doesn't explicitly add it as 'fingerHolesAt' to boxes in edgeObjects unless I do so.
              // FingerJointSettings.edgeObjects adds FingerJointEdge, CounterPart, FingerHoleEdge.
              // FingerHoleEdge has .fingerHoles property.
              // But boxes.fingerHolesAt needs to be a function.
              // Python: self.addPart(edges.FingerHoles(self, s), name="fingerHolesAt") -> self.fingerHolesAt = edges.FingerHoles(...) which is callable.
              // In JS I need to make it callable.

              // Let's fix this in edgeObjects or here.
              // I'll grab it from 'h' edge for now.
              if (this.edges['h'] && this.edges['h'].fingerHoles) {
                  this.edges['h'].fingerHoles.draw(x, y, length, angle);
              }
         };

         // Nuts
         this.addPart(new NutHole(this));
    }

    // Geometry / Drawing helpers

    dist(dx, dy) {
        return Math.hypot(dx, dy);
    }

    // Helper to wrap function call with color change (holeCol in python)
    holeCol(func, ...args) {
        this.ctx.stroke();
        this.ctx.save();
        this.ctx.set_source_rgb(...Color.INNER_CUT);
        try {
            func.call(this, ...args);
            this.ctx.stroke();
        } finally {
            this.ctx.restore();
        }
    }

    // Helper to wrap function call with restore (restore in python)
    restore(func, ...args) {
        this.ctx.save();
        const pt = this.ctx.get_current_point();
        try {
            func.call(this, ...args);
        } finally {
            this.ctx.move_to(...pt); // This might need verification if get_current_point is correct
            this.ctx.restore();
        }
    }

    cc(callback, number, x=0.0, y=null, a=0.0) {
        if (y === null) y = this.burn;

        if (callback && typeof callback.get === 'function') { // treat as list/map
             callback = callback.get(number);
             number = null;
        } else if (Array.isArray(callback)) {
             if (number < callback.length) {
                 callback = callback[number];
                 number = null;
             } else {
                 // Index out of bounds - no callback to execute
                 return;
             }
        }

        if (callback && typeof callback === 'function') {
            this.ctx.save();
            this.moveTo(x, y, a);
            if (number === null) {
                callback();
            } else {
                callback(number);
            }
            this.ctx.move_to(0, 0); // reset path start for next drawing operation?
            // In python: self.ctx.move_to(0, 0) is called after with self.saved_context().
            // Wait, Python:
            /*
            with self.saved_context():
                self.moveTo(x, y, a)
                if number is None:
                    callback()
                else:
                    callback(number)
            self.ctx.move_to(0, 0)
            */
            this.ctx.restore();
            this.ctx.move_to(0, 0);
        } else if (Array.isArray(callback)) {
            // Handle array of functions by executing each one
            this.ctx.save();
            this.moveTo(x, y, a);
            for (const cb of callback) {
                if (typeof cb === 'function') {
                    cb();
                }
            }
            this.ctx.move_to(0, 0);
            this.ctx.restore();
            this.ctx.move_to(0, 0);
        }
    }

    getEntry(param, idx) {
        if (Array.isArray(param)) {
            if (param.length > idx) {
                return param[idx];
            } else {
                return null;
            }
        } else {
            return param;
        }
    }

    moveTo(x, y, angle=0) {
        this.ctx.translate(x, y);
        this.ctx.rotate(angle * Math.PI / 180.0);
    }

    move(x, y, where, before=false, label="") {
        if (!where) where = "";
        const terms = where.split(/\s+/);
        const dontdraw = before && terms.includes("only");

        x += this.spacing;
        y += this.spacing;

        if (terms.includes("rotated")) {
            [x, y] = [y, x];
        }

        const moves = {
            "up": [0, y, false],
            "down": [0, -y, true],
            "left": [-x, 0, true],
            "right": [x, 0, false],
            "only": [0, 0, null],
            "mirror": [0, 0, null],
            "rotated": [0, 0, null]
        };

        if (!before) {
            this.ctx.restore();
            // label logic ignored
            this.ctx.stroke();
        }

        for (const term of terms) {
            if (term === "") continue;
            if (!(term in moves)) throw new Error(`Unknown direction: ${term}`);
            const [mx, my, movebeforeprint] = moves[term];

            if (movebeforeprint === true && before) {
                this.moveTo(mx, my);
            } else if ((movebeforeprint === false && !before) || dontdraw) {
                this.moveTo(mx, my);
            }
        }

        if (!dontdraw) {
            if (before) {
                this.ctx.save();
                if (terms.includes("rotated")) {
                    this.moveTo(x, 0, 90);
                    [x, y] = [y, x];
                }
                if (terms.includes("mirror")) {
                    this.moveTo(x, 0);
                    this.ctx.scale(-1, 1);
                }
                this.moveTo(this.spacing / 2.0, this.spacing / 2.0);
            }
        }

        this.ctx.new_part();
        return dontdraw;
    }

    corner(degrees, radius=0, tabs=0) {
        // Handle tuple-like input [degrees, radius]
        if (Array.isArray(degrees)) {
            [degrees, radius] = degrees;
        }

        const rad = degrees * Math.PI / 180;

        // Break down large angles into smaller steps (like Python implementation)
        // This is critical for drawing full circles and preventing path issues
        if ((radius > 0.5 * this.burn && Math.abs(degrees) > 36) ||
            (Math.abs(degrees) > 100)) {
            const steps = Math.floor(Math.abs(degrees) / 36) + 1;
            for (let i = 0; i < steps; i++) {
                this.corner(degrees / steps, radius);
            }
            return;
        }

        if (degrees > 0) {
            this.ctx.arc(0, radius + this.burn, radius + this.burn, -0.5 * Math.PI, rad - 0.5 * Math.PI);
        } else if (radius > this.burn) {
            this.ctx.arc_negative(0, -(radius - this.burn), radius - this.burn, 0.5 * Math.PI, rad + 0.5 * Math.PI);
        } else {
            // Not rounded inner corner
            this.ctx.arc_negative(0, this.burn - radius, this.burn - radius, -0.5 * Math.PI, -0.5 * Math.PI + rad);
        }

        this._continueDirection(rad);
    }

    edge(length, tabs=0) {
         if (isNaN(length) || !isFinite(length)) {
             console.error('edge() called with invalid length:', length);
             return;
         }
         this.ctx.move_to(0, 0);
         this.ctx.line_to(length, 0);
         this.ctx.translate(length, 0);
    }

    step(out) {
        if (out > 1E-5) {
            this.corner(-90);
            this.edge(out);
            this.corner(90);
        } else if (out < -1E-5) {
            this.corner(90);
            this.edge(-out);
            this.corner(-90);
        }
    }

    curveTo(x1, y1, x2, y2, x3, y3) {
        this.ctx.curve_to(x1, y1, x2, y2, x3, y3);
        const dx = x3 - x2;
        const dy = y3 - y2;
        const rad = Math.atan2(dy, dx);
        this._continueDirection(rad);
    }

    _continueDirection(angle=0) {
        // angle is in radians (matches Python implementation)
        this.ctx.translate(...this.ctx.get_current_point());
        this.ctx.rotate(angle);
    }

    polyline(...args) {
        for (let i = 0; i < args.length; i++) {
            if (i % 2 !== 0) { // angle
                 if (Array.isArray(args[i])) {
                     this.corner(args[i][0], args[i][1]);
                 } else {
                     this.corner(args[i]);
                 }
            } else { // length
                 if (Array.isArray(args[i])) {
                     this.edge(args[i][0], args[i][1]);
                 } else {
                     this.edge(args[i]);
                 }
            }
        }
    }

    edgeCorner(edge1, edge2, angle=90) {
        if (typeof edge1 === 'string') edge1 = this.edges[edge1] || this.edges['e'];
        if (typeof edge2 === 'string') edge2 = this.edges[edge2] || this.edges['e'];

        this.edge(edge2.startwidth() * Math.tan(angle * Math.PI / 180 / 2.0));
        this.corner(angle);
        this.edge(edge1.endwidth() * Math.tan(angle * Math.PI / 180 / 2.0));
    }

    regularPolygon(corners=3, radius=null, h=null, side=null) {
        if (radius) {
            side = 2 * Math.sin(Math.PI / corners) * radius;
            h = radius * Math.cos(Math.PI / corners);
        } else if (h) {
            side = 2 * Math.tan(Math.PI / corners) * h;
            radius = Math.sqrt((side/2)**2 + h**2);
        } else if (side) {
            h = 0.5 * side * Math.tan((90 - 180/corners) * Math.PI / 180);
            radius = Math.sqrt((side/2)**2 + h**2);
        }
        return [radius, h, side];
    }

    regularPolygonAt(x, y, corners, angle=0, r=null, h=null, side=null) {
        this.ctx.save();
        const pt = this.ctx.get_current_point();
        try {
            this.moveTo(x, y, angle);
            let vals = this.regularPolygon(corners, r, h, side);
            r = vals[0]; h = vals[1]; side = vals[2];

            this.moveTo(-side/2.0, -h-this.burn);
            for (let i = 0; i < corners; i++) {
                this.edge(side);
                this.corner(360.0/corners);
            }
        } finally {
            this.ctx.move_to(...pt);
            this.ctx.restore();
        }
    }

    regularPolygonWall(corners=3, r=null, h=null, side=null, edges='e', hole=null, callback=null, move=null) {
        let vals = this.regularPolygon(corners, r, h, side);
        r = vals[0]; h = vals[1]; side = vals[2];

        // Handling edges as list or string
        let edgeList = [];
        if (typeof edges === 'string') {
            for (let i=0; i<corners; i++) edgeList.push(edges);
        } else if (Array.isArray(edges) && edges.length === 1) {
            for (let i=0; i<corners; i++) edgeList.push(edges[0]);
        } else {
            edgeList = edges;
        }

        edgeList = edgeList.map(e => (typeof e === 'string' ? (this.edges[e] || this.edges['e']) : e));
        edgeList = [...edgeList, ...edgeList]; // append for wrapping

        let th;
        if (corners % 2 !== 0) {
            th = r + h + edgeList[0].spacing() + (
                Math.max(edgeList[Math.floor(corners/2)].spacing(), edgeList[Math.floor(corners/2)+1].spacing()) /
                Math.sin((90 - 180/corners) * Math.PI / 180)
            );
        } else {
            th = 2*h + edgeList[0].spacing() + edgeList[Math.floor(corners/2)].spacing();
        }

        let tw = 0;
        for (let i = 0; i < corners; i++) {
            let ang = (180 + 360*i)/corners;
            tw = Math.max(tw, 2*Math.abs(Math.sin(ang * Math.PI / 180)) *
                (r + Math.max(edgeList[i].spacing(), edgeList[i+1].spacing()) /
                 Math.sin((90 - 180/corners) * Math.PI / 180)));
        }

        if (this.move(tw, th, move, true)) return;

        this.moveTo(0.5*tw - 0.5*side, edgeList[0].margin());

        if (hole) {
            this.hole(side/2.0, h + edgeList[0].startwidth() + this.burn, hole/2.0);
        }

        this.cc(callback, 0, side/2.0, h + edgeList[0].startwidth() + this.burn);
        for (let i = 0; i < corners; i++) {
            this.cc(callback, i+1, 0, edgeList[i].startwidth() + this.burn);
            edgeList[i].draw(side);
            this.edgeCorner(edgeList[i], edgeList[i+1], 360.0/corners);
        }

        this.move(tw, th, move);
    }

    grip(length, depth) {
        const grooves = Math.max(Math.floor(length / (depth * 2.0)) + 1, 1);
        depth = length / grooves / 4.0;
        for (let groove = 0; groove < grooves; groove++) {
            this.corner(90, depth);
            this.corner(-180, depth);
            this.corner(90, depth);
        }
    }

    _latchHole(length) {
        this.edge(1.1 * this.thickness);
        this.corner(-90);
        this.edge(length / 2.0 + 0.2 * this.thickness);
        this.corner(-90);
        this.edge(1.1 * this.thickness);
    }

    _latchGrip(length, extra_length=0.0) {
        this.corner(90, this.thickness / 4.0);
        this.grip(length / 2.0 - this.thickness / 2.0 - 0.2 * this.thickness + extra_length, this.thickness / 2.0);
        this.corner(90, this.thickness / 4.0);
    }

    latch(length, positive=true, reverse=false, extra_length=0.0) {
        const t = this.thickness;
        if (positive) {
            let poly = [0, -90, t, 90, length / 2.0, 90, t, -90, length / 2.0];
            if (reverse) {
                // reverse polyline definition logic?
                // In python poly = list(reversed(poly)) reverses the list
                // If poly is [l1, a1, l2, a2, l3]
                // Reversed: [l3, a2, l2, a1, l1]
                // If the array is mixed length/angle, reversing just reverses the order.
                // length/angle/length/angle...
                poly.reverse();
            }
            this.polyline(...poly);
        } else {
            if (reverse) {
                this._latchGrip(length, extra_length);
            } else {
                this.corner(90);
            }
            this._latchHole(length);
            if (!reverse) {
                this._latchGrip(length, extra_length);
            } else {
                this.corner(90);
            }
        }
    }

    handle(x, h, hl, r=30) {
        const d = (x - hl - 2 * r) / 2.0;

        this.ctx.save();
        this.moveTo(d + 2 * r, 0);
        this.edge(hl - 2 * r);
        this.corner(-90, r);
        this.edge(h - 3 * r);
        this.corner(-90, r);
        this.edge(hl - 2 * r);
        this.corner(-90, r);
        this.edge(h - 3 * r);
        this.corner(-90, r);
        this.ctx.restore();

        this.moveTo(0, 0);
        this.curveTo(d, 0, d, 0, d, -h + r);
        this.curveTo(r, 0, r, 0, r, r);
        this.edge(hl);
        this.curveTo(r, 0, r, 0, r, r);
        this.curveTo(h - r, 0, h - r, 0, h - r, -d);
    }

    // Helper for walls
    _splitWall(pieces, side) {
        // pieces: number of surrounding walls
        // side: 0..3 (left, top, right, bottom of rounded plate approx)
        // returns true if split needed?
        // Python implementation:
        /*
        return [
            (False, False, False, False, True),
            (True, False, False, False, True),
            (True, False, True, False, True),
            (True, True, True, False, True),
            (True, True, True, True, True),
        ][pieces][side]
        */
        const table = [
             [false, false, false, false, true],
             [true, false, false, false, true],
             [true, false, true, false, true],
             [true, true, true, false, true],
             [true, true, true, true, true]
        ];
        if (pieces > 4) pieces = 4;
        if (pieces < 0) pieces = 0;
        return table[pieces][side];
    }

    roundedPlate(x, y, r, edges="f", kw={}) {
        const {
            callback = null,
            holesMargin = null,
            holesSettings = null, // Mock
            bedBolts = null,
            bedBoltSettings = null,
            wallpieces = 1,
            extend_corners = true,
            move = null,
            label = null
        } = kw;

        const corner_holes = true;
        const t = this.thickness;
        const edge = this.edges[edges] || this.edges['f']; // default f in python
        const overallwidth = x + 2 * edge.spacing();
        const overallheight = y + 2 * edge.spacing();

        if (this.move(overallwidth, overallheight, move, true)) return;

        const lx = x - 2 * r;
        const ly = y - 2 * r;

        this.moveTo(edge.spacing(), edge.margin());
        this.moveTo(r, 0);

        // wallpieces logic?
        let wp = wallpieces;
        if (wp > 4) wp = 4;

        let wallcount = 0;
        const lens = [lx, ly, lx, ly];

        for (let nr = 0; nr < 4; nr++) {
            const l = lens[nr];
            if (this._splitWall(wp, nr)) {
                for (let i = 0; i < 2; i++) {
                    this.cc(callback, wallcount, 0, edge.startwidth() + this.burn);
                    edge.draw(l / 2.0);
                    wallcount++;
                }
            } else {
                 this.cc(callback, wallcount, 0, edge.startwidth() + this.burn);
                 edge.draw(l);
                 wallcount++;
            }

            if (extend_corners) {
                if (corner_holes) {
                    this.ctx.save();
                    this.moveTo(0, edge.startwidth());
                    this.polyline(0, [90, r], 0, -90, t, -90, 0, [-90, r+t], 0, -90, t, -90, 0);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
                this.corner(90, r + edge.startwidth());
            } else {
                this.step(-edge.endwidth());
                this.corner(90, r);
                this.step(edge.startwidth());
            }
        }

        this.ctx.restore(); // restores move call inside this.move(before=True)
        this.ctx.save();    // save for holes

        this.moveTo(edge.margin(), edge.margin());

        if (holesMargin !== null) {
            this.moveTo(holesMargin, holesMargin);
            let hr = r;
            if (hr > holesMargin) hr -= holesMargin;
            else hr = 0;

            this.hexHolesPlate(x - 2 * holesMargin, y - 2 * holesMargin, hr, {settings: holesSettings});
        }

        this.move(overallwidth, overallheight, move, false, label);
    }

    surroundingWall(x, y, r, h, kw={}) {
        const {
            bottom = 'e', top = 'e', left = 'D', right = 'd',
            pieces = 1,
            extend_corners = true,
            callback = null,
            move = null
        } = kw;

        const t = this.thickness;
        // c4 = (r + self.burn) * math.pi * 0.5  # circumference of quarter circle
        // c4 = c4 / self.edges["X"].settings.stretch
        // Assuming X edge default stretch is 1.0 or whatever.
        let c4 = (r + this.burn) * Math.PI * 0.5;

        const topEdge = this.edges[top] || this.edges['e'];
        const bottomEdge = this.edges[bottom] || this.edges['e'];
        const leftEdge = this.edges[left] || this.edges['D'];
        const rightEdge = this.edges[right] || this.edges['d'];

        let topwidth, bottomwidth;
        if (extend_corners) {
            topwidth = t;
            bottomwidth = t;
        } else {
            topwidth = topEdge.startwidth();
            bottomwidth = bottomEdge.startwidth();
        }

        // overallwidth calculation simplified
        const overallwidth = 2*x + 2*y; // rough approx
        const overallheight = h; // rough approx

        if (this.move(overallwidth, overallheight, move, true)) return;

        this.moveTo(leftEdge.spacing(), bottomEdge.margin());

        let wallcount = 0;
        let tops = [];

        let sides;
        let wp = pieces;
        if (wp <= 2 && (y - 2 * r) < 1E-3) {
             c4 *= 2;
             sides = [x/2-r, x-2*r, x-2*r];
             if (wp > 0) wp += 1;
        } else {
             sides = [x/2-r, y-2*r, x-2*r, y-2*r, x-2*r];
        }

        for (let nr = 0; nr < sides.length; nr++) {
            const l = sides[nr];
            if (this._splitWall(wp, nr) && nr > 0) {
                 this.cc(callback, wallcount, 0, bottomwidth + this.burn);
                 wallcount++;
                 bottomEdge.draw(l/2.0);
                 tops.push(l/2.0);

                 // complete wall segment
                 this.ctx.save();
                 this.edgeCorner(bottomEdge, rightEdge, 90);
                 rightEdge.draw(h);
                 this.edgeCorner(rightEdge, topEdge, 90);

                 // draw tops reversed
                 for (let n = tops.length - 1; n >= 0; n--) {
                     const d = tops[n];
                     // if n % 2 logic for flex... simplified to just drawing topEdge
                     topEdge.draw(d);
                 }

                 this.edgeCorner(topEdge, leftEdge, 90);
                 leftEdge.draw(h);
                 this.edgeCorner(leftEdge, bottomEdge, 90);
                 this.ctx.restore(); // restore to complete segment

                 if (nr === sides.length - 1) break;

                 // start new wall segment
                 tops = [];
                 this.moveTo(rightEdge.margin() + leftEdge.margin() + this.spacing);
                 this.cc(callback, wallcount, 0, bottomwidth + this.burn);
                 wallcount++;
                 bottomEdge.draw(l/2.0);
                 tops.push(l/2.0);
            } else {
                 this.cc(callback, wallcount, 0, bottomwidth + this.burn);
                 wallcount++;
                 bottomEdge.draw(l);
                 tops.push(l);
            }

            this.step(bottomwidth - bottomEdge.endwidth());
            // self.edges["X"](c4, h + topwidth + bottomwidth)
            if (this.edges["X"]) this.edges["X"].draw(c4, h + topwidth + bottomwidth);
            else this.edge(c4); // fallback

            this.step(bottomEdge.startwidth() - bottomwidth);
            tops.push(c4);
        }

        this.move(overallwidth, overallheight, move, false);
    }

    rectangularWall(x, y, edges="eeee", kw={}) {
        const { ignore_widths = [], move = null, label = "" } = kw;
        let { callback = null, bedBolts = null, bedBoltSettings = null } = kw;

        if (edges.length !== 4) throw new Error("four edges required");

        let edgeList;
        if (typeof edges === 'string') {
             edgeList = edges.split('').map(e => this.edges[e] || this.edges['e']);
        } else if (Array.isArray(edges)) {
             edgeList = edges.map(e => {
                 if (typeof e === 'string') return this.edges[e] || this.edges['e'];
                 return e;
             });
        } else {
             throw new Error("edges must be string or array");
        }

        // append for wrapping around? python: edges += edges
        const fullEdges = [...edgeList, ...edgeList];

        const overallwidth = x + fullEdges[3].spacing() + fullEdges[1].spacing();
        const overallheight = y + fullEdges[0].spacing() + fullEdges[2].spacing();

        if (this.move(overallwidth, overallheight, move, true)) return;

        if (!ignore_widths.includes(7)) {
            this.moveTo(fullEdges[3].spacing());
        }
        this.moveTo(0, fullEdges[0].margin());

        const dims = [x, y, x, y];

        for (let i = 0; i < 4; i++) {
             this.cc(callback, i, 0, fullEdges[i].startwidth() + this.burn);

             let l = dims[i];
             let e1 = fullEdges[i];
             let e2 = fullEdges[i+1];

             if (ignore_widths.includes(2*i - 1) || ignore_widths.includes(2*i - 1 + 8)) {
                 l += fullEdges[i-1 < 0 ? 3 : i-1].endwidth();
             }
             if (ignore_widths.includes(2*i)) {
                 l += fullEdges[i+1].startwidth();
                 e2 = this.edges['e'];
             }
             if (ignore_widths.includes(2*i+1)) {
                 e1 = this.edges['e'];
             }

             // draw edge
             fullEdges[i].draw(l, {bedBolts: this.getEntry(bedBolts, i), bedBoltSettings: this.getEntry(bedBoltSettings, i)});
             this.edgeCorner(e1, e2, 90);
        }

        if (kw.holesMargin !== undefined) { // Check if passed
             this.moveTo(kw.holesMargin, kw.holesMargin + fullEdges[0].startwidth());
             this.hexHolesRectangle(x - 2 * kw.holesMargin, y - 2 * kw.holesMargin, {settings: kw.holesSettings});
        }

        this.move(overallwidth, overallheight, move, false);
    }

    flangedWall(x, y, edges="FFFF", kw={}) {
        const {
            flanges = null,
            r = 0.0,
            callback = null,
            move = null,
            label = ""
        } = kw;

        let f = flanges || [0.0, 0.0, 0.0, 0.0];
        while (f.length < 4) f.push(0.0);

        let edgeList;
        if (typeof edges === 'string') {
             edgeList = edges.split('').map(e => this.edges[e] || this.edges['e']);
        } else {
             edgeList = edges;
        }
        edgeList = [...edgeList, ...edgeList];
        const fList = [...f, ...f];

        const tw = x + edgeList[1].spacing() + fList[1] + edgeList[3].spacing() + fList[3];
        const th = y + edgeList[0].spacing() + fList[0] + edgeList[2].spacing() + fList[2];

        if (this.move(tw, th, move, true)) return;

        const rl = Math.min(r, Math.max(fList[3], fList[0]));
        this.moveTo(rl + edgeList[3].margin(), edgeList[0].margin());

        for (let i = 0; i < 4; i++) {
            const l = (i % 2 !== 0) ? y : x;
            const r_curr = Math.min(r, Math.max(fList[i < 1 ? 3 : i-1], fList[i])); // check index
            const r_next = Math.min(r, Math.max(fList[i], fList[i+1]));

            this.cc(callback, i, -r_curr, 0); // Python: self.cc(callback, i, x=-rl)

            if (fList[i] > 0) {
                 if (edgeList[i] === this.edges["F"] || edgeList[i] === this.edges["h"]) {
                     this.fingerHolesAt(fList[(i+3)%4] + edgeList[(i+3)%4].endwidth() - r_curr, 0.5 * this.thickness + fList[i], l, 0);
                 }
                 this.edge(l + fList[(i+3)%4] + fList[i+1] + edgeList[(i+3)%4].endwidth() + edgeList[i+1].startwidth() - r_curr - r_next);
            } else {
                 this.edge(fList[(i+3)%4] + edgeList[(i+3)%4].endwidth() - r_curr);
                 edgeList[i].draw(l);
                 this.edge(fList[i+1] + edgeList[i+1].startwidth() - r_next);
            }
            this.corner(90, r_next);
        }

        this.move(tw, th, move, false, label);
    }

    rectangularTriangle(x, y, edges="eee", r=0.0, num=1, kw={}) {
        // Extract num from kw if it's passed as an object
        if (kw.num !== undefined) {
            num = kw.num;
        }
        
        const {
            bedBolts = null,
            bedBoltSettings = null,
            callback = null,
            move = null,
            label = ""
        } = kw;

         let edgeList;
         if (typeof edges === 'string') {
             edgeList = edges.split('').map(e => this.edges[e] || this.edges['e']);
         } else {
             edgeList = edges;
         }
 
         if (edgeList.length === 2) edgeList.push(this.edges['e']);
         if (edgeList.length !== 3) throw new Error("two or three edges required");
 
         r = Math.min(r, x, y);
         const a = Math.atan2(y-r, x-r);
         const alpha = a * 180 / Math.PI;
 
         let width;
         if (a > 0) {
             width = x + (edgeList[2].spacing() + this.spacing) / Math.sin(a) + edgeList[1].spacing() + this.spacing;
         } else {
             width = x + (edgeList[2].spacing() + this.spacing) + edgeList[1].spacing() + this.spacing;
         }
         const height = y + edgeList[0].spacing() + edgeList[2].spacing() * Math.cos(a) + 2*this.spacing + this.spacing;
 
         if (num > 1) {
             width = 2*width - x + r - this.spacing;
         }
         const dx = width - x - edgeList[1].spacing() - this.spacing / 2;
         const dy = edgeList[0].margin() + this.spacing / 2;
 
         const overallwidth = width * (Math.floor(num/2) + num%2) - this.spacing;
         const overallheight = height - this.spacing;
 
         if (this.move(overallwidth, overallheight, move, true)) return;
 
         this.moveTo(dx - this.spacing / 2, dy - this.spacing / 2);
 
         for (let n = 0; n < num; n++) {
             const lens = [x, y];
             for (let i = 0; i < 2; i++) {
                 this.cc(callback, i, 0, edgeList[i].startwidth() + this.burn);
                 edgeList[i].draw(lens[i], {bedBolts: this.getEntry(bedBolts, i), bedBoltSettings: this.getEntry(bedBoltSettings, i)});
                 if (i === 0) {
                     this.edgeCorner(edgeList[i], edgeList[i+1], 90);
                 }
             }
             this.edgeCorner(edgeList[1], 'e', 90);
 
             this.corner(alpha, r);
             this.cc(callback, 2);
             this.step(edgeList[2].startwidth());
             edgeList[2].draw(Math.sqrt((x-r)**2 + (y-r)**2));
             this.step(-edgeList[2].endwidth());
             this.corner(90-alpha, r);
             this.edge(edgeList[0].startwidth());
             this.corner(90);
             this.ctx.stroke();
 
             this.moveTo(width - 2*dx, height - 2*dy, 180);
             if (n % 2 !== 0) {
                 this.moveTo(width);
             }
         }
 
         this.move(overallwidth, overallheight, move, false, label);
    }

    trapezoidWall(w, h0, h1, edges="eeee", kw={}) {
        const {
            callback = null,
            move = null,
            label = ""
        } = kw;

        let edgeList;
        if (typeof edges === 'string') {
             edgeList = edges.split('').map(e => this.edges[e] || this.edges['e']);
        } else {
             edgeList = edges;
        }

        const overallwidth = w + edgeList[3].spacing() + edgeList[1].spacing();
        const overallheight = Math.max(h0, h1) + edgeList[0].spacing();

        if (this.move(overallwidth, overallheight, move, true)) return;

        const a = Math.atan((h1-h0)/w) * 180 / Math.PI;
        const l = Math.sqrt((h0-h1)**2 + w**2);

        this.moveTo(edgeList[3].spacing(), edgeList[0].margin());
        this.cc(callback, 0, 0, edgeList[0].startwidth());
        edgeList[0].draw(w);
        this.edgeCorner(edgeList[0], edgeList[1], 90);
        this.cc(callback, 1, 0, edgeList[1].startwidth());
        edgeList[1].draw(h1);
        this.edgeCorner(edgeList[1], this.edges['e'], 90);
        this.corner(a);
        this.cc(callback, 2);
        edgeList[2].draw(l);
        this.corner(-a);
        this.edgeCorner(this.edges['e'], edgeList[3], 90);
        this.cc(callback, 3, 0, edgeList[3].startwidth());
        edgeList[3].draw(h0);
        this.edgeCorner(edgeList[3], edgeList[0], 90);

        this.move(overallwidth, overallheight, move, false, label);
    }

    // Polygon wall and friends
    _polygonWallExtend(borders, edges) {
        let posx = 0, posy = 0;
        const ext = [0.0, 0.0, 0.0, 0.0]; // minx, miny, maxx, maxy
        let angle = 0;

        const checkpoint = (x, y) => {
            ext[0] = Math.min(ext[0], x);
            ext[1] = Math.min(ext[1], y);
            ext[2] = Math.max(ext[2], x);
            ext[3] = Math.max(ext[3], y);
        };

        const nborders = [];
        for (let i = 0; i < borders.length; i++) {
             if (i % 2 !== 0) { // angle
                 nborders.push(borders[i]);
             } else { // length
                 const edge = edges[Math.floor(i/2) % edges.length];
                 const margin = edge.margin();
                 const l = borders[i];
                 if (margin) {
                     nborders.push(0.0, -90, margin, 90, l, 90, margin, -90, 0.0);
                 } else {
                     nborders.push(l);
                 }
             }
        }

        const newBorders = nborders;
        for (let i = 0; i < newBorders.length; i++) {
            if (i % 2 !== 0) { // angle
                 let a, r = 0;
                 if (Array.isArray(newBorders[i])) {
                     [a, r] = newBorders[i];
                 } else {
                     a = newBorders[i];
                     angle = (angle + a) % 360;
                     continue;
                 }

                 let centerx, centery;
                 if (a > 0) {
                     centerx = posx + r * Math.cos((angle+90) * Math.PI / 180);
                     centery = posy + r * Math.sin((angle+90) * Math.PI / 180);
                 } else {
                     centerx = posx + r * Math.cos((angle-90) * Math.PI / 180);
                     centery = posy + r * Math.sin((angle-90) * Math.PI / 180);
                 }

                 for (let direction of [0, 90, 180, 270]) {
                     // simplified bounding box check for arc
                     // ...
                 }
                 // Not implementing full arc bounding box logic for now, using checkpoints at start/end
                 angle = (angle + a) % 360;
                 if (a > 0) {
                     posx = centerx + r * Math.cos((angle-90) * Math.PI / 180);
                     posy = centery + r * Math.sin((angle-90) * Math.PI / 180);
                 } else {
                     posx = centerx + r * Math.cos((angle+90) * Math.PI / 180);
                     posy = centery + r * Math.sin((angle+90) * Math.PI / 180);
                 }
            } else { // length
                 posx += newBorders[i] * Math.cos(angle * Math.PI / 180);
                 posy += newBorders[i] * Math.sin(angle * Math.PI / 180);
            }
            checkpoint(posx, posy);
        }
        return ext;
    }

    _closePolygon(borders) {
        // ... simplified closure logic
        return borders;
    }

    polygonWall(borders, edge="f", kw={}) {
         const {
             turtle = false,
             correct_corners = true,
             callback = null,
             move = null,
             label = ""
         } = kw;

         let edges;
         if (typeof edge === 'string') {
             edges = [this.edges[edge] || this.edges['f']];
         } else {
             edges = edge.map(e => (typeof e === 'string' ? (this.edges[e] || this.edges['f']) : e));
         }

         const t = this.thickness;

         // borders = this._closePolygon(borders);
         // const [minx, miny, maxx, maxy] = this._polygonWallExtend(borders, edges);
         // const tw = maxx - minx;
         // const th = maxy - miny;

         // Simplified implementation assuming starting at 0,0 and no move for now

         let length_correction = 0.0;

         for (let i = 0; i < borders.length; i += 2) {
             this.cc(callback, i/2);
             this.edge(length_correction);
             let l = borders[i] - length_correction;
             const next_angle = borders[i+1];

             if (correct_corners && typeof next_angle === 'number' && next_angle < 0) {
                 length_correction = t * Math.tan((-next_angle / 2) * Math.PI / 180);
             } else {
                 length_correction = 0.0;
             }
             l -= length_correction;

             const e = edges[Math.floor(i/2) % edges.length];
             e.draw(l);
             this.edge(length_correction);
             if (Array.isArray(next_angle)) {
                 this.corner(next_angle[0], next_angle[1], 1); // tabs=1
             } else {
                 this.corner(next_angle, 0, 1);
             }
         }
    }

    polygonWalls(borders, h, bottom="F", top="F", symmetrical=true) {
        // ... simplified
    }

    flex2D(x, y, width=1) {
        width *= this.thickness;
        const cx = Math.floor(x / (5 * width));
        const cy = Math.floor(y / (5 * width));

        if (cx === 0 || cy === 0) return;

        const wx = x / 5.0 / cx;
        const wy = y / 5.0 / cy;

        const armx = [4 * wx, 90, 4 * wy, 90, 2 * wx, 90, 2 * wy];
        const army = [4 * wy, 90, 4 * wx, 90, 2 * wy, 90, 2 * wx];

        for (let i = 0; i < cx; i++) {
            for (let j = 0; j < cy; j++) {
                if ((i + j) % 2 !== 0) {
                    this.restore(() => {
                        this.moveTo((5 * i) * wx, (5 * j) * wy);
                        this.polyline(...armx);
                    });
                    this.restore(() => {
                        this.moveTo((5 * i + 5) * wx, (5 * j + 5) * wy, -180);
                        this.polyline(...armx);
                    });
                } else {
                    this.restore(() => {
                        this.moveTo((5 * i + 5) * wx, (5 * j) * wy, 90);
                        this.polyline(...army);
                    });
                    this.restore(() => {
                        this.moveTo((5 * i) * wx, (5 * j + 5) * wy, -90);
                        this.polyline(...army);
                    });
                }
            }
        }
        this.ctx.stroke();
    }

    fingerHoleRectangle(dx, dy, x=0., y=0., angle=0., outside=false) {
        this.restore(() => {
             this.moveTo(x, y, angle);
             let d = 0.5 * this.thickness;
             if (outside) d = -d;

             this.fingerHolesAt(dx/2+d, -dy/2, dy, 90);
             this.fingerHolesAt(-dx/2-d, -dy/2, dy, 90);
             this.fingerHolesAt(-dx/2, -dy/2-d, dx, 0);
             this.fingerHolesAt(-dx/2, dy/2+d, dx, 0);
        });
    }

    partsMatrix(n, width, move, part, args, kw={}) {
         // ...
    }

    mirrorX(f, offset=0.0) {
        return () => {
            this.moveTo(offset, 0);
            this.ctx.save();
            this.ctx.scale(-1, 1);
            f();
            this.ctx.restore();
        };
    }

    mirrorY(f, offset=0.0) {
         return () => {
            this.moveTo(0, offset);
            this.ctx.save();
            this.ctx.scale(1, -1);
            f();
            this.ctx.restore();
        };
    }

    adjustSize(l, e1=true, e2=true) {
        if (typeof e1 === 'string') e1 = this.edges[e1];
        if (typeof e2 === 'string') e2 = this.edges[e2];

        let total, walls = 0;
        // check if l is array
        if (Array.isArray(l)) {
            total = l.reduce((a, b) => a + b, 0);
            walls = (l.length - 1) * this.thickness;
        } else {
            total = l;
            walls = 0;
        }

        if (e1 && e1.startwidth) walls += e1.startwidth() + e1.margin();
        else if (e1 === true) walls += this.thickness;

        if (e2 && e2.startwidth) walls += e2.startwidth() + e2.margin();
        else if (e2 === true) walls += this.thickness;

        if (Array.isArray(l)) {
            const factor = total > 0.0 ? (total - walls) / total : 1.0;
            return l.map(s => s * factor);
        } else {
            return l - walls;
        }
    }

    // Hole drawing methods

    circle(x, y, r) {
        this.restore(() => {
            r += this.burn;
            this.moveTo(x + r, y);
            let a = 0;
            const n = 10;
            const da = 2 * Math.PI / n;
            for (let i = 0; i < n; i++) {
                this.ctx.arc(-r, 0, r, a, a + da);
                a += da;
            }
            this.ctx.stroke();
        });
    }

    regularPolygonHole(x, y, r=0.0, d=0.0, n=6, a=0.0, tabs=0, corner_radius=0.0) {
        this.restore(() => {
            this.holeCol(() => {
                 if (!r) r = d / 2.0;

                 if (n === 0) {
                     this.hole(x, y, r, 0, tabs);
                     return;
                 }

                 if (r < this.burn) r = this.burn + 1E-9;
                 let r_ = r - this.burn;

                 if (corner_radius < this.burn) corner_radius = this.burn;
                 let cr_ = corner_radius - this.burn;

                 const side_length = 2 * r_ * Math.sin(Math.PI / n);
                 // const apothem = r_ * Math.cos(Math.PI / n);

                 const s = Math.sqrt(2 * Math.pow(cr_, 2) * (1 - Math.cos(2 * Math.PI / n)));
                 const b = Math.sin(Math.PI / n) / Math.sin(2 * Math.PI / n) * s;
                 const flat_side_length = side_length - 2 * b;

                 this.moveTo(x, y, a);
                 this.moveTo(r_, 0, 90 + 180 / n);
                 this.moveTo(b, 0, 0);

                 for (let i = 0; i < n; i++) {
                     this.edge(flat_side_length);
                     this.corner(360 / n, cr_);
                 }
            });
        });
    }

    hole(x, y, r=0.0, d=0.0, tabs=0) {
        this.restore(() => {
            this.holeCol(() => {
                 if (typeof r === 'object' && r !== null) {
                     d = r.d || d;
                     r = r.r || 0.0;
                 }
                 if (!r) r = d / 2.0;
                 if (r < this.burn) r = this.burn + 1E-9;
                 const r_ = r - this.burn;
                 

                 this.ctx.arc_full(x, y, r_);
                 this.ctx.stroke();
            });
        });
    }

    rectangularHole(x, y, dx, dy, r=0, center_x=true, center_y=true) {
         this.restore(() => {
            this.holeCol(() => {
                r = Math.min(r, dx/2., dy/2.);
                const x_start = center_x ? x : x + dx / 2.0;
                const y_start = center_y ? y : y - dy / 2.0; // python logic check: y - dy/2 if center_y else y?
                // Python: y_start = y - dy / 2.0 if center_y else y

                this.moveTo(x_start, y_start + this.burn, 180);
                this.edge(dx / 2.0 - r);
                for (const d of [dy, dx, dy, dx/2.0 + r]) {
                    this.corner(-90, r);
                    this.edge(d - 2 * r);
                }
            });
         });
    }

    dHole(x, y, r=null, d=null, w=null, rel_w=0.75, angle=0) {
        this.restore(() => {
            this.holeCol(() => {
                if (r === null) r = d / 2.0;
                if (w === null) w = 2.0 * r * rel_w;
                w -= r;
                if (r <= 0.0) return;
                if (Math.abs(w) > r) {
                    // return self.hole(x, y, r)
                    // calling self.hole here would double wrap holeCol? No, hole() wraps itself.
                    // But we are inside holeCol wrapper.
                    // We should just call the inner logic of hole?
                    // But hole() has @holeCol.
                    // If we call this.hole(), it will do stroke, save, set color, stroke.
                    // We are already inside set color.
                    // So we might just get nested save/restore which is fine.
                    // However, Python returns self.hole().
                    return this.hole(x, y, r);
                }

                const a = Math.acos(w / r) * 180 / Math.PI;
                this.moveTo(x, y, angle - a);
                this.moveTo(r - this.burn, 0, -90);
                this.corner(-360 + 2 * a, r);
                this.corner(-a);
                this.edge(2 * r * Math.sin(a * Math.PI / 180));
            });
        });
    }

    flatHole(x, y, r=null, d=null, w=null, rel_w=0.75, angle=0) {
        this.restore(() => {
            this.holeCol(() => {
                if (r === null) r = d / 2.0;
                if (w === null) w = r * rel_w;
                else w = w / 2.0;

                if (r < 0.0) return;
                if (Math.abs(w) > r) return this.hole(x, y, r);

                const a = Math.acos(w / r) * 180 / Math.PI;
                this.moveTo(x, y, angle - a);
                this.moveTo(r - this.burn, 0, -90);
                for (let i = 0; i < 2; i++) {
                    this.corner(-180 + 2 * a, r);
                    this.corner(-a);
                    this.edge(2 * r * Math.sin(a * Math.PI / 180));
                    this.corner(-a);
                }
            });
        });
    }

    mountingHole(x, y, d_shaft, d_head=0.0, angle=0, tabs=0) {
        this.restore(() => {
            this.holeCol(() => {
                if (d_shaft < (2 * this.burn)) return;

                if (!d_head || d_head < (2 * this.burn)) {
                    this.hole(x, y, d_shaft/2, 0, tabs);
                    return;
                }

                const rs = d_shaft / 2;
                const rh = d_head / 2;

                this.moveTo(x, y, angle);
                this.moveTo(0, rs - this.burn, 0);
                this.corner(-180, rs, tabs);
                this.edge(2 * rs, tabs);
                const a = Math.asin(rs / rh) * 180 / Math.PI;
                this.corner(90 - a, 0, tabs);
                this.corner(-360 + 2 * a, rh, tabs);
                this.corner(90 - a, 0, tabs);
                this.edge(2 * rs, tabs);
            });
        });
    }

    // Text and NEMA

    text(text, x=0, y=0, angle=0, align="", fontsize=10, color=[0.0, 0.0, 0.0], font="Arial") {
        this.restore(() => {
             this.moveTo(x, y, angle);
             const lines = text.split("\n");
             const linesCount = lines.length;
             const height = linesCount * fontsize + (linesCount - 1) * 0.4 * fontsize;
             const alignParts = align.split(/\s+/);
             let halign = "left";
             const moves = {
                 "top": -height,
                 "middle": -0.5 * height,
                 "bottom": 0,
                 "left": "left",
                 "center": "middle",
                 "right": "end"
             };

             for (const a of alignParts) {
                 if (moves[a] !== undefined) {
                     if (typeof moves[a] === 'string') {
                         halign = moves[a];
                     } else {
                         this.moveTo(0, moves[a]);
                     }
                 }
             }

             for (const line of [...lines].reverse()) {
                 this.ctx.show_text(line, fontsize, halign, color, font);
                 this.moveTo(0, 1.4 * fontsize);
             }
        });
    }

    TX(size, x=0, y=0, angle=0) {
        this.restore(() => {
            this.holeCol(() => {
                this.moveTo(x, y, angle);
                const s = this.tx_sizes[size] || 0;
                const ri = 0.5 * s * Math.tan(30 * Math.PI / 180);
                const ro = ri * (Math.sqrt(2) - 1);

                this.moveTo(s * 0.5 - this.burn, 0, -90);
                for (let i = 0; i < 6; i++) {
                    this.corner(45, ri);
                    this.corner(-150, ro);
                    this.corner(45, ri);
                }
            });
        });
    }

    NEMA(size, x=0, y=0, angle=0, screwholes=null) {
        this.restore(() => {
            const params = this.nema_sizes[size];
            let [width, flange, holedistance, diameter] = params;

            if (screwholes) diameter = screwholes;

            this.moveTo(x, y, angle);
            if (this.debug) {
                 this.rectangularHole(0, 0, width, width);
            }
            this.hole(0, 0, 0.5 * flange);
            for (const xh of [-1, 1]) {
                for (const yh of [-1, 1]) {
                    this.hole(xh * 0.5 * holedistance, yh * 0.5 * holedistance, 0.5 * diameter);
                }
            }
        });
    }
}

export { Boxes  };
