const { SVGContext } = require('./svg_context');
const { Color } = require('./Color');
const { Settings, OutSetEdge, Edge, FingerJointSettings } = require('./edges');
const { normalize, vlength, vclip, vdiff, vadd, vorthogonal, vscalmul, dotproduct, circlepoint, tangent, kerf } = require('./vectors');

class Boxes {
    constructor() {
        this.ctx = new SVGContext();
        this.edges = {};
        this.thickness = 3.0; // Default
        this.burn = 0.1;
        this.spacing = 0.5; // spacing around parts
        this.format = 'svg';
        this.debug = false;
        this.labels = true;
        this.reference = 100.0;

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
        // Mock: manually set some values for now
        this.x = 100;
        this.y = 100;
        this.h = 100;
        this.outside = true;
        this.bottom_edge = "h";

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

         // Lids
         const { LidSettings, Lid } = require('./lids');
         this.lidSettings = new LidSettings(this.thickness, true);
         this.lid = new Lid(this, this.lidSettings);

         // Other parts (stubs/placeholders to match structure)
         const { Parts } = require('./parts');
         this.parts = new Parts(this);

         const { Gears } = require('./gears');
         this.gears = new Gears(this);

         const { Pulley } = require('./pulley');
         this.pulley = new Pulley(this);
    }

    // Geometry / Drawing helpers

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
        if (radius < this.burn) radius = 0; // simplified

        const rad = degrees * Math.PI / 180;

        if (degrees > 0) {
             this.ctx.arc(0, radius + this.burn, radius + this.burn, -0.5 * Math.PI, rad - 0.5 * Math.PI);
        } else {
             // not rounded inner corner logic simplified
             this.ctx.arc_negative(0, this.burn - radius, this.burn - radius, -0.5 * Math.PI, -0.5 * Math.PI + rad);
        }

        this.ctx.translate( ...this.ctx.get_current_point() );
        this.ctx.rotate(rad);
    }

    edge(length, tabs=0) {
         this.ctx.move_to(0, 0);
         this.ctx.line_to(length, 0);
         this.ctx.translate(length, 0);
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

    rectangularWall(x, y, edges="eeee", kw={}) {
        const { ignore_widths = [], move = null, label = "" } = kw;

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
             // callback support omitted for now
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
             fullEdges[i].draw(l);
             this.edgeCorner(e1, e2, 90);
        }

        this.move(overallwidth, overallheight, move, false);
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

    saved_context() {
        // Javascript generator approach?
        // Python: with self.saved_context(): ...
        // JS: this.ctx.save(); try { ... } finally { this.ctx.restore(); }
        // We can return an object that has a method?
        // Or users just call save/restore.
        // I'll assume usage pattern:
        // box.ctx.save();
        // ...
        // box.ctx.restore();
        // But ABox uses `with self.saved_context():`.
        // I cannot easily replicate `with` syntax in JS without a callback.
        // I will change ABox translation to use `ctx.save()` and `ctx.restore()`.
    }

    rectangularHole(x, y, dx, dy) {
         this.ctx.save();
         // Python: moveTo(x_start, y_start + burn, 180)
         // Python default center_x=True, center_y=True
         // x_start = x if center_x else x + dx/2
         // Assuming center_x=True: x is center. x_start = x.

         const x_start = x;
         const y_start = y;

         this.moveTo(x_start, y_start + this.burn, 180);
         this.edge(dx / 2.0);
         for (const d of [dy, dx, dy, dx/2.0]) {
             this.corner(-90);
             this.edge(d);
         }
         this.ctx.restore();
    }
}

module.exports = { Boxes };
