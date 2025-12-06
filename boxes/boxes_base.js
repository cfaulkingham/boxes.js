import { SVGContext } from './svg_context.js';
import { Color } from './Color.js';
import { 
    Settings, OutSetEdge, Edge, FingerJointSettings, DoveTailSettings,
    GripSettings, StackableSettings, ClickSettings, HingeSettings,
    ChestHingeSettings, CabinetHingeSettings, SlideOnLidSettings,
    RoundedTriangleEdgeSettings, GroovedSettings, MountingSettings,
    HandleEdgeSettings, FlexSettings, FlexEdge, GearSettings, RackEdge
} from './edges.js';
import { normalize, vlength, vclip, vdiff, vadd, vorthogonal, vscalmul, dotproduct, circlepoint, tangent, kerf } from './vectors.js';
import { NutHole, HexSizes } from './nuthole.js';
import { ArgParser } from './argparser.js';
import './globals.js';

/**
 * Base class for all box generators.
 * Handles SVG context, argument parsing, and core drawing logic.
 */
class Boxes {
    /**
     * Initialize the Boxes instance.
     */
    constructor() {
        this.ctx = new SVGContext();
        this.edges = {};
        this.argparser = new ArgParser();
        this.thickness = 3.0; // Default
        this.burn = 0.1;
        this.spacing = [0.5, 0]; // spacing around parts [multiplier of thickness, extra mm]
        this.format = 'svg';
        this.debug = false;
        this.labels = false;
        this.reference = 100.0;
        this.inner_corners = "loop"; // style for inner corners: "loop", "corner", "backarc"

        this.tx_sizes = {
            1: 0.61,
            2: 0.70,
            3: 0.82,
            4: 0.96,
            5: 1.06,
            6: 1.27,
            7: 1.49,
            8: 1.75,
            9: 1.87,
            10: 2.05,
            15: 2.40,
            20: 2.85,
            25: 3.25,
            30: 4.05,
            40: 4.85,
            45: 5.64,
            50: 6.45,
            55: 8.05,
            60: 9.60,
            70: 11.20,
            80: 12.80,
            90: 14.40,
            100: 16.00,
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

    /**
     * Initialization method intended to be overridden by subclasses.
     */
    init() {
        // Can be overridden
    }

    /**
     * Register a part (edge or component) with the box.
     * @param {Object} part - The part instance.
     * @param {string} [name=null] - Optional name to register the part under.
     */
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

    /**
     * Register multiple parts.
     * @param {Object[]} parts - Array of parts.
     */
    addParts(parts) {
        for (const part of parts) {
            this.addPart(part);
        }
    }

    /**
     * Register settings arguments.
     * @param {class} SettingsClass - Settings class definition.
     * @param {string|Object} [prefix=null] - Prefix for arguments, or defaults object if no prefix.
     * @param {Object} [defaults={}] - Default values.
     */
    addSettingsArgs(SettingsClass, prefix = null, defaults = {}) {
        // Handle case where prefix is actually the defaults object (common pattern)
        if (typeof prefix === 'object' && prefix !== null) {
            defaults = prefix;
            prefix = null;
        }
        
        prefix = prefix || SettingsClass.name.replace("Settings", "");

        // Store the settings class and defaults for later use in _buildObjects
        if (!this.edgesettings) {
            this.edgesettings = {};
        }
        this.edgesettings[prefix] = {
            cls: SettingsClass,
            defaults: defaults
        };
    }

    /**
     * Build the argument parser with default values.
     * @param {Object} [defaults={}] - Default values overrides.
     */
    buildArgParser(defaults = {}) {
        // Set up default argument values for x, y, h, etc.
        if (defaults.x !== undefined) {
            this.argparser.add_argument("--x", { action: "store", type: "float", default: defaults.x, help: "inner width in mm" });
        }
        if (defaults.y !== undefined) {
            this.argparser.add_argument("--y", { action: "store", type: "float", default: defaults.y, help: "inner depth in mm" });
        }
        if (defaults.h !== undefined) {
            this.argparser.add_argument("--h", { action: "store", type: "float", default: defaults.h, help: "inner height in mm" });
        }
        if (defaults.sx !== undefined) {
            this.argparser.add_argument("--sx", { action: "store", type: "str", default: defaults.sx, help: "sections left to right in mm" });
        }
        if (defaults.sy !== undefined) {
            this.argparser.add_argument("--sy", { action: "store", type: "str", default: defaults.sy, help: "sections back to front in mm" });
        }
        if (defaults.sh !== undefined) {
            this.argparser.add_argument("--sh", { action: "store", type: "str", default: defaults.sh, help: "sections bottom to top in mm" });
        }
        if (defaults.outside !== undefined) {
            this.argparser.add_argument("--outside", { action: "store", type: "bool", default: defaults.outside, help: "treat dimensions as outside measurements" });
        }
        // Add labels argument
        this.argparser.add_argument("--labels", { action: "store", type: "bool", default: true, help: "add labels to parts" });

        // Default settings arguments (matching Python's defaultgroup)
        this.argparser.add_argument("--thickness", { action: "store", type: "float", default: 3.0, help: "thickness of the material (in mm)" });
        this.argparser.add_argument("--burn", { action: "store", type: "float", default: 0.1, help: "burn correction (in mm)(bigger values for tighter fit)" });
        this.argparser.add_argument("--spacing", { action: "store", type: "str", default: "0.5", help: "spacing around parts (multiples of thickness [: extra space in mm])" });
        this.argparser.add_argument("--reference", { action: "store", type: "float", default: 100.0, help: "print reference rectangle with given length (in mm)(zero to disable)" });
        this.argparser.add_argument("--inner_corners", { action: "store", type: "str", default: "loop", choices: ["loop", "corner", "backarc"], help: "style for inner corners" });
    }

    /**
     * Parse arguments and configure the box instance.
     * @param {Object} args - Arguments dictionary.
     */
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

        // Apply defaults from argparser
        if (this.argparser && this.argparser.arguments) {
            for (const arg of this.argparser.arguments) {
                if (arg.name && arg.default !== undefined) {
                    // Remove -- prefix from argument name
                    const paramName = arg.name.replace(/^--/, '');
                    this[paramName] = arg.default;
                }
            }
        }

        // Override with args
        for (const [key, value] of Object.entries(args)) {
            this[key] = value;

            // Handle label/labels alias (both should work)
            if (key === 'label') {
                this.labels = value;
            } else if (key === 'labels') {
                this.label = value;
            }

            // Check for edge settings
            // e.g. FingerJoint_thickness
            // In python: if key.startswith(setting + '_'): ...
        }

        // Parse sx, sy, and sh from string format (e.g., "65*4" -> [65, 65, 65, 65])
        if (typeof this.sx === 'string') {
            this.sx = this._parseSections(this.sx);
        }
        if (typeof this.sy === 'string') {
            this.sy = this._parseSections(this.sy);
        }
        if (typeof this.sh === 'string') {
            this.sh = this._parseSections(this.sh);
        }

        // Parse spacing from string format (e.g., "0.5" -> [0.5, 0] or "0.5:2" -> [0.5, 2])
        if (typeof this.spacing === 'string') {
            this.spacing = this._parseSpacing(this.spacing);
        }
    }

    _parseSections(spec) {
        // Parse section specification like "65*4", "10:20:30", or "5:45*3:5"
        // Returns an array of numbers
        // "5:45*3:5" means [5, 45, 45, 45, 5]
        if (!spec || typeof spec !== 'string') {
            return spec;
        }
        
        const result = [];
        // Split by colon first to get individual segments
        const segments = spec.split(':');
        
        for (const segment of segments) {
            if (segment.includes('*')) {
                // Handle "45*3" format -> [45, 45, 45]
                const parts = segment.split('*');
                const value = parseFloat(parts[0]);
                const count = parseInt(parts[1]);
                for (let i = 0; i < count; i++) {
                    result.push(value);
                }
            } else {
                // Simple number
                result.push(parseFloat(segment));
            }
        }
        
        return result;
    }

    _parseSpacing(spec) {
        // Parse spacing specification like "0.5" or "0.5:2"
        // Returns [multiplier, extra_mm]
        // In Python: spacing_type returns tuple(float(v.strip()) for v in x.split(":"))
        if (typeof spec === 'number') {
            return [spec, 0];
        }
        if (spec.includes(':')) {
            const parts = spec.split(':').map(v => parseFloat(v.trim()));
            return [parts[0], parts[1] || 0];
        } else {
            return [parseFloat(spec), 0];
        }
    }

    /**
     * Start the drawing process.
     * Initializes SVG context, builds parts, and sets up scaling/spacing.
     */
    open() {
        if (this.ctx.paths.length > 0) return; // already opened?

        this._buildObjects();

        // Initial setup
        this.ctx.set_line_width(Math.max(2 * this.burn, 0.05));
        this.ctx.set_source_rgb(0, 0, 0);

        // Spacing calculation (matching Python)
        // spacing = 2 * burn + spacing[0] * thickness + spacing[1]
        const spacingParsed = Array.isArray(this.spacing) ? this.spacing : [this.spacing, 0];
        this.spacing = 2 * this.burn + spacingParsed[0] * this.thickness + spacingParsed[1];

        // Reference rectangle (only show if labels are enabled)
        // Support both 'label' and 'labels' property names (either can disable)
        const showLabels = this.labels !== false && this.label !== false;
        if (this.reference && showLabels && this.format !== 'svg_Ponoko') {
            const refText = `${this.reference.toFixed(1)}mm, burn:${this.burn.toFixed(2)}mm`;
            const boxHeight = 10;
            this.move(this.reference, boxHeight, "up", true);
            this.ctx.rectangle(0, 0, this.reference, boxHeight);
            const fontSize = 6;

            if (this.reference < 80) {
                // Text outside box to the right (doesn't fit inside)
                this.text(refText, this.reference + 5, boxHeight / 2.0 + fontSize / 2.0+ -2, 0, "left middle", fontSize, Color.ANNOTATIONS);
            } else {
                // Text centered inside box
                this.text(refText, this.reference / 2.0, boxHeight / 2.0 + fontSize / 2.0 + -2, 0, "center middle", fontSize, Color.ANNOTATIONS);
            }
            this.move(this.reference, boxHeight, "up");
            this.ctx.stroke();
        }
    }

    /**
     * Finish the drawing process and return the result.
     * @returns {string} The generated SVG content.
     */
    close() {
        return this.ctx.finish();
    }

    /**
     * Internal method to build component objects (edges, parts).
     */
    _buildObjects() {
        // Re-initialize edges
        this.edges = {};
        Object.defineProperty(this.edges, 'get', {
            value: function (key, defaultVal) { return this[key] || defaultVal; },
            enumerable: false,
            writable: true
        });
        this.addPart(new Edge(this, null));
        this.addPart(new OutSetEdge(this, null));

        // Helper to get settings defaults from edgesettings
        const getDefaults = (name) => {
            return (this.edgesettings && this.edgesettings[name]) 
                ? (this.edgesettings[name].defaults || {}) 
                : {};
        };

        // Add GripSettings (char 'g')
        new GripSettings(this.thickness, true, getDefaults('Grip')).edgeObjects(this);

        // Add FingerJoint settings (chars 'f', 'F', 'h')
        const fjSettings = new FingerJointSettings(this.thickness, true, getDefaults('FingerJoint'));
        fjSettings.edgeObjects(this);

        // Add Stackable settings (chars 's', 'S', 'š', 'Š')
        new StackableSettings(this.thickness, true, getDefaults('Stackable')).edgeObjects(this);

        // Add DoveTail settings (chars 'd', 'D')
        new DoveTailSettings(this.thickness, true, getDefaults('DoveTail')).edgeObjects(this);

        // Add Flex edge (char 'X') - FlexSettings doesn't have edgeObjects, add directly
        const flexSettings = new FlexSettings(this.thickness, true, getDefaults('Flex'));
        this.addPart(new FlexEdge(this, flexSettings));

        // Add Rack edge (char 'R') - GearSettings doesn't have edgeObjects, add directly
        const gearSettings = new GearSettings(this.thickness, true, getDefaults('Gear'));
        this.addPart(new RackEdge(this, gearSettings));

        // Add Click settings (chars 'c', 'C')
        new ClickSettings(this.thickness, true, getDefaults('Click')).edgeObjects(this);

        // Add Hinge settings (chars 'i', 'j', 'k', 'I', 'J', 'K')
        new HingeSettings(this.thickness, true, getDefaults('Hinge')).edgeObjects(this);

        // Add ChestHinge settings (chars 'o', 'O', 'p', 'P', 'q', 'Q')
        new ChestHingeSettings(this.thickness, true, getDefaults('ChestHinge')).edgeObjects(this);

        // Add CabinetHinge settings (chars 'u', 'U', 'v', 'V')
        new CabinetHingeSettings(this.thickness, true, getDefaults('CabinetHinge')).edgeObjects(this);

        // Add SlideOnLid settings (chars 'l', 'L', 'n', 'm', 'N', 'M')
        new SlideOnLidSettings(this.thickness, true, getDefaults('SlideOnLid')).edgeObjects(this);

        // Add RoundedTriangleEdge settings (chars 't', 'T')
        new RoundedTriangleEdgeSettings(this.thickness, true, getDefaults('RoundedTriangleEdge')).edgeObjects(this);

        // Add Grooved settings (chars 'z', 'Z')
        new GroovedSettings(this.thickness, true, getDefaults('Grooved')).edgeObjects(this);

        // Add Mounting settings (char 'G')
        new MountingSettings(this.thickness, true, getDefaults('Mounting')).edgeObjects(this);

        // Add HandleEdge settings (chars 'y', 'Y')
        new HandleEdgeSettings(this.thickness, true, getDefaults('HandleEdge')).edgeObjects(this);

        this.fingerHolesAt = (x, y, length, angle = 90) => {
            if (this.edges['h'] && this.edges['h'].fingerHoles) {
                this.edges['h'].fingerHoles.draw(x, y, length, angle);
            }
        };

        // Nuts
        this.addPart(new NutHole(this));
    }

    // Geometry / Drawing helpers

    /**
     * Calculate Euclidean distance between (0,0) and (dx, dy).
     * @param {number} dx - X difference.
     * @param {number} dy - Y difference.
     * @returns {number} The distance.
     */
    dist(dx, dy) {
        return Math.hypot(dx, dy);
    }

    /**
     * Execute a function with a specific color (e.g. for inner cuts).
     * @param {Function} func - Function to execute.
     * @param {...*} args - Arguments for the function.
     */
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

    /**
     * Execute a function while preserving SVG context state.
     * @param {Function} func - Function to execute.
     * @param {...*} args - Arguments.
     */
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

    /**
     * Call a callback function or execute drawing instructions.
     * @param {Function|Array} callback - Function or array of functions/instructions.
     * @param {number} number - Index or identifier passed to callback.
     * @param {number} [x=0.0] - X translation.
     * @param {number} [y=null] - Y translation.
     * @param {number} [a=0.0] - Rotation angle.
     */
    cc(callback, number, x = 0.0, y = null, a = 0.0) {
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

    /**
     * Helper to retrieve an entry from a parameter that might be an array or value.
     * @param {Array|*} param - Parameter.
     * @param {number} idx - Index.
     * @returns {*} The value at index or null/value.
     */
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

    /**
     * Move current point to new coordinates with rotation.
     * @param {number} x - X coordinate.
     * @param {number} [y=0] - Y coordinate.
     * @param {number} [angle=0] - Rotation angle.
     */
    moveTo(x, y = 0, angle = 0) {
        this.ctx.translate(x, y);
        this.ctx.rotate(angle * Math.PI / 180.0);
    }

    /**
     * Move to a relative position for the next part.
     * @param {number} x - X separation.
     * @param {number} y - Y separation.
     * @param {string|Object} where - Direction (up, down, left, right, etc.).
     * @param {boolean} [before=false] - Whether this move is a pre-move (check bounds).
     * @param {string} [label=""] - Label for the part.
     * @returns {boolean} True if drawing should be skipped (e.g. 'only' check).
     */
    move(x, y, where, before = false, label = "") {
        // Allow both a plain string (e.g. "right") or an options object
        // (e.g. { move: "right" }) for backward compatibility with
        // translated generators.
        if (where && typeof where === 'object') {
            if (typeof where.move === 'string') {
                where = where.move;
            } else {
                where = '';
            }
        }
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
            // Render label if labels are enabled and label is provided
            if (this.labels && label && label !== "" && label !== "invisible") {
                this.ctx.save();
                // Position label at the center-bottom of the part
                this.ctx.translate(x / 2, y - 3);
                this.ctx.rotate(0);
                // Render the label with default styling
                this.text(label, 0, 0, 0, "center bottom", 5);
                this.ctx.restore();
            }
            this.ctx.stroke();
        }

        for (const term of terms) {
            if (term === "") continue;
            if (!(term in moves)) throw new Error(`Unknown direction: ${term}`);
            const [mx, my, movebeforeprint] = moves[term];

            if (movebeforeprint && before) {
                this.moveTo(mx, my);
            } else if ((!movebeforeprint && !before) || dontdraw) {
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

    /**
     * Draw a corner (arc) of specified degrees and radius.
     * @param {number|number[]} degrees - Angle in degrees (positive for left turn).
     * @param {number} [radius=0] - Radius of the corner.
     * @param {number} [tabs=0] - Number of tabs (unused in JS implementation yet?).
     */
    corner(degrees, radius = 0, tabs = 0) {
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

    /**
     * Draw a straight line of specified length.
     * @param {number} length - Length of the line.
     * @param {number} [tabs=0] - Number of tabs (for future use).
     */
    edge(length, tabs = 0) {
        if (isNaN(length) || !isFinite(length)) {
            console.error('edge() called with invalid length:', length);
            return;
        }
        this.ctx.move_to(0, 0);
        this.ctx.line_to(length, 0);
        this.ctx.translate(length, 0);
    }

    /**
     * Draw a perpendicular step (outward or inward).
     * @param {number} out - Width of the step. Positive = outward.
     */
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

    /**
     * Draw a bezier curve.
     * @param {number} x1 - Control point 1 X.
     * @param {number} y1 - Control point 1 Y.
     * @param {number} x2 - Control point 2 X.
     * @param {number} y2 - Control point 2 Y.
     * @param {number} x3 - End point X.
     * @param {number} y3 - End point Y.
     */
    curveTo(x1, y1, x2, y2, x3, y3) {
        this.ctx.curve_to(x1, y1, x2, y2, x3, y3);
        const dx = x3 - x2;
        const dy = y3 - y2;
        const rad = Math.atan2(dy, dx);
        this._continueDirection(rad);
    }

    _continueDirection(angle = 0) {
        // angle is in radians (matches Python implementation)
        this.ctx.translate(...this.ctx.get_current_point());
        this.ctx.rotate(angle);
    }

    /**
     * Draw a sequence of corners and edges (polyline).
     * @param {...(number|Array)} args - Sequence of lengths and angles (corner params).
     */
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

    /**
     * Draw a corner between two edges, accounting for their widths.
     * @param {Edge|string} edge1 - First edge object or name.
     * @param {Edge|string} edge2 - Second edge object or name.
     * @param {number} [angle=90] - Angle between walls.
     */
    edgeCorner(edge1, edge2, angle = 90) {
        if (typeof edge1 === 'string') edge1 = this.edges[edge1] || this.edges['e'];
        if (typeof edge2 === 'string') edge2 = this.edges[edge2] || this.edges['e'];

        this.edge(edge2.startwidth() * Math.tan(angle * Math.PI / 180 / 2.0));
        this.corner(angle);
        this.edge(edge1.endwidth() * Math.tan(angle * Math.PI / 180 / 2.0));
    }

    /**
     * Calculate parameters for a regular polygon.
     * @param {number} [corners=3] - Number of corners.
     * @param {number} [radius=null] - Radius.
     * @param {number} [h=null] - Apothem (height from center).
     * @param {number} [side=null] - Side length.
     * @returns {number[]} Array of [radius, h, side].
     */
    regularPolygon(corners = 3, radius = null, h = null, side = null) {
        if (radius) {
            side = 2 * Math.sin(Math.PI / corners) * radius;
            h = radius * Math.cos(Math.PI / corners);
        } else if (h) {
            side = 2 * Math.tan(Math.PI / corners) * h;
            radius = Math.sqrt((side / 2) ** 2 + h ** 2);
        } else if (side) {
            h = 0.5 * side * Math.tan((90 - 180 / corners) * Math.PI / 180);
            radius = Math.sqrt((side / 2) ** 2 + h ** 2);
        }
        return [radius, h, side];
    }

    /**
     * Draw a regular polygon at a specific location.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @param {number} corners - Number of corners.
     * @param {number} [angle=0] - Rotation angle.
     * @param {number} [r=null] - Radius.
     * @param {number} [h=null] - Apothem.
     * @param {number} [side=null] - Side length.
     */
    regularPolygonAt(x, y, corners, angle = 0, r = null, h = null, side = null) {
        this.ctx.save();
        const pt = this.ctx.get_current_point();
        try {
            this.moveTo(x, y, angle);
            let vals = this.regularPolygon(corners, r, h, side);
            r = vals[0]; h = vals[1]; side = vals[2];

            this.moveTo(-side / 2.0, -h - this.burn);
            for (let i = 0; i < corners; i++) {
                this.edge(side);
                this.corner(360.0 / corners);
            }
        } finally {
            this.ctx.move_to(...pt);
            this.ctx.restore();
        }
    }

    /**
     * Draw a regular polygon wall (e.g. for creating polygonal boxes).
     * @param {number} [corners=3] - Number of corners.
     * @param {number} [r=null] - Radius.
     * @param {number} [h=null] - Apothem.
     * @param {number} [side=null] - Side length.
     * @param {string|Array} [edges='e'] - Edge type(s).
     * @param {number} [hole=null] - Center hole diameter.
     * @param {Function} [callback=null] - Callback for faces.
     * @param {string} [move=null] - Move commands.
     */
    regularPolygonWall(corners = 3, r = null, h = null, side = null, edges = 'e', hole = null, callback = null, move = null) {
        // Handle options object as second parameter
        if (typeof r === 'object' && r !== null && !Array.isArray(r)) {
            const opts = r;
            r = opts.r !== undefined ? opts.r : null;
            h = opts.h !== undefined ? opts.h : null;
            side = opts.side !== undefined ? opts.side : null;
            edges = opts.edges !== undefined ? opts.edges : 'e';
            hole = opts.hole !== undefined ? opts.hole : null;
            callback = opts.callback !== undefined ? opts.callback : null;
            move = opts.move !== undefined ? opts.move : null;
        }
        
        let vals = this.regularPolygon(corners, r, h, side);
        r = vals[0]; h = vals[1]; side = vals[2];

        // Handling edges as list or string
        let edgeList = [];
        if (typeof edges === 'string') {
            for (let i = 0; i < corners; i++) edgeList.push(edges);
        } else if (Array.isArray(edges) && edges.length === 1) {
            for (let i = 0; i < corners; i++) edgeList.push(edges[0]);
        } else {
            edgeList = edges;
        }

        edgeList = edgeList.map(e => (typeof e === 'string' ? (this.edges[e] || this.edges['e']) : e));
        edgeList = [...edgeList, ...edgeList]; // append for wrapping

        let th;
        if (corners % 2 !== 0) {
            th = r + h + edgeList[0].spacing() + (
                Math.max(edgeList[Math.floor(corners / 2)].spacing(), edgeList[Math.floor(corners / 2) + 1].spacing()) /
                Math.sin((90 - 180 / corners) * Math.PI / 180)
            );
        } else {
            th = 2 * h + edgeList[0].spacing() + edgeList[Math.floor(corners / 2)].spacing();
        }

        let tw = 0;
        for (let i = 0; i < corners; i++) {
            let ang = (180 + 360 * i) / corners;
            tw = Math.max(tw, 2 * Math.abs(Math.sin(ang * Math.PI / 180)) *
                (r + Math.max(edgeList[i].spacing(), edgeList[i + 1].spacing()) /
                    Math.sin((90 - 180 / corners) * Math.PI / 180)));
        }

        if (this.move(tw, th, move, true)) return;

        this.moveTo(0.5 * tw - 0.5 * side, edgeList[0].margin());

        if (hole) {
            this.hole(side / 2.0, h + edgeList[0].startwidth() + this.burn, hole / 2.0);
        }

        this.cc(callback, 0, side / 2.0, h + edgeList[0].startwidth() + this.burn);
        for (let i = 0; i < corners; i++) {
            this.cc(callback, i + 1, 0, edgeList[i].startwidth() + this.burn);
            edgeList[i].draw(side);
            this.edgeCorner(edgeList[i], edgeList[i + 1], 360.0 / corners);
        }

        this.move(tw, th, move);
    }

    /**
     * Draw grip grooves.
     * @param {number} length - Length of the grip area.
     * @param {number} depth - Depth of the grooves.
     */
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

    _latchGrip(length, extra_length = 0.0) {
        this.corner(90, this.thickness / 4.0);
        this.grip(length / 2.0 - this.thickness / 2.0 - 0.2 * this.thickness + extra_length, this.thickness / 2.0);
        this.corner(90, this.thickness / 4.0);
    }

    /**
     * Draw a latch mechanism.
     * @param {number} length - Length of the latch.
     * @param {boolean} [positive=true] - Positive (protruding) or negative part.
     * @param {boolean} [reverse=false] - Reverse direction.
     * @param {number} [extra_length=0.0] - Extra length compensation.
     */
    latch(length, positive = true, reverse = false, extra_length = 0.0) {
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

    /**
     * Draw a handle.
     * @param {number} x - Width/Position x(?).
     * @param {number} h - Height.
     * @param {number} hl - Handle Length (grip).
     * @param {number} [r=30] - Radius.
     */
    handle(x, h, hl, r = 30) {
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
    /**
     * Determine if a wall should be split based on the number of pieces.
     * @param {number} pieces - Number of pieces.
     * @param {number} side - Side index (0-3).
     * @returns {boolean} True if wall should be split.
     */
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

    /**
     * Draw a rounded plate (base or lid) with optional holes.
     * @param {number} x - Width.
     * @param {number} y - Depth.
     * @param {number} r - Corner radius.
     * @param {string} [edges="f"] - Edge type.
     * @param {Object} [kw={}] - options: callback, holesMargin, holesSettings, bedBolts, wallpieces, extend_corners, move, label.
     */
    roundedPlate(x, y, r, edges = "f", kw = {}) {
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
                    this.polyline(0, [90, r], 0, -90, t, -90, 0, [-90, r + t], 0, -90, t, -90, 0);
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

            this.hexHolesPlate(x - 2 * holesMargin, y - 2 * holesMargin, hr, { settings: holesSettings });
        }

        this.move(overallwidth, overallheight, move, false, label);
    }

    /**
     * Draw surrounding walls for a rounded box.
     * @param {number} x - Width of the box.
     * @param {number} y - Depth of the box.
     * @param {number} r - Corner radius.
     * @param {number} h - Height of the wall.
     * @param {Object} [kw={}] - options: bottom, top, left, right, pieces, extend_corners, callback, move.
     */
    surroundingWall(x, y, r, h, kw = {}) {
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
        const overallwidth = 2 * x + 2 * y; // rough approx
        const overallheight = h; // rough approx

        if (this.move(overallwidth, overallheight, move, true)) return;

        this.moveTo(leftEdge.spacing(), bottomEdge.margin());

        let wallcount = 0;
        let tops = [];

        let sides;
        let wp = pieces;
        if (wp <= 2 && (y - 2 * r) < 1E-3) {
            c4 *= 2;
            sides = [x / 2 - r, x - 2 * r, x - 2 * r];
            if (wp > 0) wp += 1;
        } else {
            sides = [x / 2 - r, y - 2 * r, x - 2 * r, y - 2 * r, x - 2 * r];
        }

        for (let nr = 0; nr < sides.length; nr++) {
            const l = sides[nr];
            if (this._splitWall(wp, nr) && nr > 0) {
                this.cc(callback, wallcount, 0, bottomwidth + this.burn);
                wallcount++;
                bottomEdge.draw(l / 2.0);
                tops.push(l / 2.0);

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
                bottomEdge.draw(l / 2.0);
                tops.push(l / 2.0);
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

    /**
     * Draw a rectangular wall.
     * @param {number} x - Width.
     * @param {number} y - Height (or depth).
     * @param {string|Array} [edges="eeee"] - Edges.
     * @param {Object} [kw={}] - options: ignore_widths, move, label, callback, bedBolts, bedBoltSettings.
     */
    rectangularWall(x, y, edges = "eeee", kw = {}) {
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
            let e2 = fullEdges[i + 1];

            if (ignore_widths.includes(2 * i - 1) || ignore_widths.includes(2 * i - 1 + 8)) {
                l += fullEdges[i - 1 < 0 ? 3 : i - 1].endwidth();
            }
            if (ignore_widths.includes(2 * i)) {
                l += fullEdges[i + 1].startwidth();
                e2 = this.edges['e'];
            }
            if (ignore_widths.includes(2 * i + 1)) {
                e1 = this.edges['e'];
            }

            // draw edge
            fullEdges[i].draw(l, { bedBolts: this.getEntry(bedBolts, i), bedBoltSettings: this.getEntry(bedBoltSettings, i) });
            this.edgeCorner(e1, e2, 90);
        }

        if (kw.holesMargin !== undefined) { // Check if passed
            this.moveTo(kw.holesMargin, kw.holesMargin + fullEdges[0].startwidth());
            this.hexHolesRectangle(x - 2 * kw.holesMargin, y - 2 * kw.holesMargin, { settings: kw.holesSettings });
        }

        this.move(overallwidth, overallheight, move, false, label);
    }

    /**
     * Draw a wall with flanges (extensions) at corners.
     * @param {number} x - Width.
     * @param {number} y - Height.
     * @param {string|Array} [edges="FFFF"] - Edges.
     * @param {Object} [kw={}] - options: flanges, r, callback, move, label.
     */
    flangedWall(x, y, edges = "FFFF", kw = {}) {
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
            const r_curr = Math.min(r, Math.max(fList[i < 1 ? 3 : i - 1], fList[i])); // check index
            const r_next = Math.min(r, Math.max(fList[i], fList[i + 1]));

            this.cc(callback, i, -r_curr, 0); // Python: self.cc(callback, i, x=-rl)

            if (fList[i] > 0) {
                if (edgeList[i] === this.edges["F"] || edgeList[i] === this.edges["h"]) {
                    this.fingerHolesAt(fList[(i + 3) % 4] + edgeList[(i + 3) % 4].endwidth() - r_curr, 0.5 * this.thickness + fList[i], l, 0);
                }
                this.edge(l + fList[(i + 3) % 4] + fList[i + 1] + edgeList[(i + 3) % 4].endwidth() + edgeList[i + 1].startwidth() - r_curr - r_next);
            } else {
                this.edge(fList[(i + 3) % 4] + edgeList[(i + 3) % 4].endwidth() - r_curr);
                edgeList[i].draw(l);
                this.edge(fList[i + 1] + edgeList[i + 1].startwidth() - r_next);
            }
            this.corner(90, r_next);
        }

        this.move(tw, th, move, false, label);
    }

    /**
     * Draw a right-angled triangular wall.
     * @param {number} x - Width (base).
     * @param {number} y - Height.
     * @param {string|Array} [edges="eee"] - Edges.
     * @param {number} [r=0.0] - Corner radius.
     * @param {number} [num=1] - Number of triangles to draw (pairs).
     * @param {Object} [kw={}] - options: bedBolts, bedBoltSettings, callback, move, label.
     */
    rectangularTriangle(x, y, edges = "eee", r = 0.0, num = 1, kw = {}) {
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
        const a = Math.atan2(y - r, x - r);
        const alpha = a * 180 / Math.PI;

        let width;
        if (a > 0) {
            width = x + (edgeList[2].spacing() + this.spacing) / Math.sin(a) + edgeList[1].spacing() + this.spacing;
        } else {
            width = x + (edgeList[2].spacing() + this.spacing) + edgeList[1].spacing() + this.spacing;
        }
        const height = y + edgeList[0].spacing() + edgeList[2].spacing() * Math.cos(a) + 2 * this.spacing + this.spacing;

        if (num > 1) {
            width = 2 * width - x + r - this.spacing;
        }
        const dx = width - x - edgeList[1].spacing() - this.spacing / 2;
        const dy = edgeList[0].margin() + this.spacing / 2;

        const overallwidth = width * (Math.floor(num / 2) + num % 2) - this.spacing;
        const overallheight = height - this.spacing;

        if (this.move(overallwidth, overallheight, move, true)) return;

        this.moveTo(dx - this.spacing / 2, dy - this.spacing / 2);

        for (let n = 0; n < num; n++) {
            const lens = [x, y];
            for (let i = 0; i < 2; i++) {
                this.cc(callback, i, 0, edgeList[i].startwidth() + this.burn);
                edgeList[i].draw(lens[i], { bedBolts: this.getEntry(bedBolts, i), bedBoltSettings: this.getEntry(bedBoltSettings, i) });
                if (i === 0) {
                    this.edgeCorner(edgeList[i], edgeList[i + 1], 90);
                }
            }
            this.edgeCorner(edgeList[1], 'e', 90);

            this.corner(alpha, r);
            this.cc(callback, 2);
            this.step(edgeList[2].startwidth());
            edgeList[2].draw(Math.sqrt((x - r) ** 2 + (y - r) ** 2));
            this.step(-edgeList[2].endwidth());
            this.corner(90 - alpha, r);
            this.edge(edgeList[0].startwidth());
            this.corner(90);
            this.ctx.stroke();

            this.moveTo(width - 2 * dx, height - 2 * dy, 180);
            if (n % 2 !== 0) {
                this.moveTo(width);
            }
        }

        this.move(overallwidth, overallheight, move, false, label);
    }

    /**
     * Draw a trapezoidal wall.
     * @param {number} w - Width (base).
     * @param {number} h0 - Height left.
     * @param {number} h1 - Height right.
     * @param {string|Array} [edges="eeee"] - Edges.
     * @param {Object} [kw={}] - options: callback, move, label.
     */
    trapezoidWall(w, h0, h1, edges = "eeee", kw = {}) {
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

        const a = Math.atan((h1 - h0) / w) * 180 / Math.PI;
        const l = Math.sqrt((h0 - h1) ** 2 + w ** 2);

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
                const edge = edges[Math.floor(i / 2) % edges.length];
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
                    centerx = posx + r * Math.cos((angle + 90) * Math.PI / 180);
                    centery = posy + r * Math.sin((angle + 90) * Math.PI / 180);
                } else {
                    centerx = posx + r * Math.cos((angle - 90) * Math.PI / 180);
                    centery = posy + r * Math.sin((angle - 90) * Math.PI / 180);
                }

                for (let direction of [0, 90, 180, 270]) {
                    // simplified bounding box check for arc
                    // ...
                }
                // Not implementing full arc bounding box logic for now, using checkpoints at start/end
                angle = (angle + a) % 360;
                if (a > 0) {
                    posx = centerx + r * Math.cos((angle - 90) * Math.PI / 180);
                    posy = centery + r * Math.sin((angle - 90) * Math.PI / 180);
                } else {
                    posx = centerx + r * Math.cos((angle + 90) * Math.PI / 180);
                    posy = centery + r * Math.sin((angle + 90) * Math.PI / 180);
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

    /**
     * Draw a single polygon wall (unfolded).
     * @param {Array} borders - List of lengths and angles [l1, a1, l2, a2, ...].
     * @param {string|Array} [edge="f"] - Edges.
     * @param {Object} [kw={}] - options: turtle, correct_corners, callback, move, label.
     */
    polygonWall(borders, edge = "f", kw = {}) {
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

        // Calculate bounding box by tracing the polygon
        let posx = 0, posy = 0;
        let minx = 0, miny = 0, maxx = 0, maxy = 0;
        let angle = 0;
        let temp_length_correction = 0.0;

        for (let i = 0; i < borders.length; i += 2) {
            let l = borders[i] - temp_length_correction;
            const next_angle = borders[i + 1];

            if (correct_corners && typeof next_angle === 'number' && next_angle < 0) {
                temp_length_correction = t * Math.tan((-next_angle / 2) * Math.PI / 180);
            } else {
                temp_length_correction = 0.0;
            }
            l -= temp_length_correction;

            // Move along edge
            posx += l * Math.cos(angle * Math.PI / 180);
            posy += l * Math.sin(angle * Math.PI / 180);

            minx = Math.min(minx, posx);
            miny = Math.min(miny, posy);
            maxx = Math.max(maxx, posx);
            maxy = Math.max(maxy, posy);

            // Turn by angle (handle both simple angles and curve tuples)
            if (Array.isArray(next_angle)) {
                // Curve: [angle, radius]
                const [curve_angle, radius] = next_angle;

                // For a curved corner, we need to account for the arc's extent
                // Calculate positions along the arc to get accurate bounds
                const start_angle = angle;
                const num_samples = Math.max(3, Math.ceil(Math.abs(curve_angle) / 30)); // Sample every 30° or so

                for (let j = 0; j <= num_samples; j++) {
                    const t_param = j / num_samples;
                    const current_angle = start_angle + curve_angle * t_param;

                    // Position along the arc from the center
                    const arc_x = posx + radius * Math.sin((start_angle + curve_angle * t_param) * Math.PI / 180)
                        - radius * Math.sin(start_angle * Math.PI / 180);
                    const arc_y = posy - radius * Math.cos((start_angle + curve_angle * t_param) * Math.PI / 180)
                        + radius * Math.cos(start_angle * Math.PI / 180);

                    minx = Math.min(minx, arc_x);
                    miny = Math.min(miny, arc_y);
                    maxx = Math.max(maxx, arc_x);
                    maxy = Math.max(maxy, arc_y);
                }

                // Update position after the curve
                posx += radius * Math.sin((angle + curve_angle) * Math.PI / 180) - radius * Math.sin(angle * Math.PI / 180);
                posy += -radius * Math.cos((angle + curve_angle) * Math.PI / 180) + radius * Math.cos(angle * Math.PI / 180);

                angle += curve_angle;
            } else if (typeof next_angle === 'number') {
                angle += next_angle;
            }
        }

        // Add edge margins to the bounding box on all sides
        const margin = edges[0].margin() || 0;
        const tw = maxx - minx + 2 * margin;
        const th = maxy - miny + 2 * margin;

        // Adjust minx/miny to account for margin offset
        minx -= margin;
        miny -= margin;

        // Check if we should skip drawing (move only)
        if (this.move(tw, th, move, true)) return;

        // Offset to account for bounding box (polygon may have negative coords)
        this.moveTo(-minx, -miny);

        let length_correction = 0.0;

        for (let i = 0; i < borders.length; i += 2) {
            this.cc(callback, i / 2);
            this.edge(length_correction);
            let l = borders[i] - length_correction;
            const next_angle = borders[i + 1];

            if (correct_corners && typeof next_angle === 'number' && next_angle < 0) {
                length_correction = t * Math.tan((-next_angle / 2) * Math.PI / 180);
            } else {
                length_correction = 0.0;
            }
            l -= length_correction;

            const e = edges[Math.floor(i / 2) % edges.length];
            e.draw(l);
            this.edge(length_correction);
            if (Array.isArray(next_angle)) {
                this.corner(next_angle[0], next_angle[1], 1); // tabs=1
            } else {
                this.corner(next_angle, 0, 1);
            }
        }

        // Apply move after drawing
        this.move(tw, th, move);
    }

    /**
     * Draw separate walls for a polygon (e.g. for sides of a polygonal box).
     * @param {Array} borders - List of lengths and angles.
     * @param {number} h - Height.
     * @param {string} [bottom="F"] - Bottom edge.
     * @param {string} [top="F"] - Top edge.
     * @param {boolean} [symmetrical=true] - Symmetry (unused?).
     */
    polygonWalls(borders, h, bottom = "F", top = "F", symmetrical = true) {
        if (!borders || borders.length === 0) return;

        // Close polygon if needed
        borders = this._closePolygon(borders);

        const bottomEdge = this.edges[bottom] || this.edges['e'];
        const topEdge = this.edges[top] || this.edges['e'];
        const t = this.thickness;

        // Get finger joint edges for left and right sides
        const leftEdge = this.edges['f'] || this.edges['e'];
        const rightEdge = this.edges['f'] || this.edges['e'];

        let length_correction = 0.0;
        let angle = borders[borders.length - 1]; // last angle
        let i = 0;

        // Add initial spacing before first wall
        this.moveTo(leftEdge.spacing() + this.spacing, bottomEdge.margin());

        while (i < borders.length) {
            let l = borders[i] - length_correction;
            const next_angle = borders[i + 1];

            // Calculate length correction for next segment
            if (typeof next_angle === 'number' && next_angle < 0) {
                length_correction = t * Math.tan((-next_angle / 2) * Math.PI / 180);
            } else {
                length_correction = 0.0;
            }
            l -= length_correction;

            // Draw rectangular wall for this segment
            // Width = l (segment length), Height = h
            this.ctx.save();

            // Bottom edge
            bottomEdge.draw(l);

            // Right corner and edge
            this.edgeCorner(bottomEdge, rightEdge, 90);
            rightEdge.draw(h);

            // Top corner and edge
            this.edgeCorner(rightEdge, topEdge, 90);
            topEdge.draw(l);

            // Left corner and edge
            this.edgeCorner(topEdge, leftEdge, 90);
            leftEdge.draw(h);

            // Close the wall
            this.edgeCorner(leftEdge, bottomEdge, 90);

            this.ctx.stroke();
            this.ctx.restore();

            // Move to next wall position
            this.moveTo(l + rightEdge.spacing() + leftEdge.spacing() + this.spacing, 0);

            i += 2;
        }
    }

    /**
     * Draw a 2D flex pattern.
     * @param {number} x - Width.
     * @param {number} y - Height.
     * @param {number} [width=1] - Multiplier for thickness determining cell size.
     */
    flex2D(x, y, width = 1) {
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

    /**
     * Draw finger holes in a rectangle pattern.
     * @param {number} dx - Width of the cutout.
     * @param {number} dy - Height of the cutout.
     * @param {number} [x=0.] - Center X.
     * @param {number} [y=0.] - Center Y.
     * @param {number} [angle=0.] - Angle.
     * @param {boolean} [outside=false] - Outside.
     */
    fingerHoleRectangle(dx, dy, x = 0., y = 0., angle = 0., outside = false) {
        this.restore(() => {
            this.moveTo(x, y, angle);
            let d = 0.5 * this.thickness;
            if (outside) d = -d;

            this.fingerHolesAt(dx / 2 + d, -dy / 2, dy, 90);
            this.fingerHolesAt(-dx / 2 - d, -dy / 2, dy, 90);
            this.fingerHolesAt(-dx / 2, -dy / 2 - d, dx, 0);
            this.fingerHolesAt(-dx / 2, dy / 2 + d, dx, 0);
        });
    }

    /**
     * Generate a matrix of parts.
     * @param {number} n - Number of parts (unused?).
     * @param {number} width - Width of area(?).
     * @param {string} move - Move command.
     * @param {Function} part - Part function.
     * @param {Array} args - Arguments for part.
     * @param {Object} [kw={}] - options.
     */
    partsMatrix(n, width, move, part, args, kw = {}) {
        // ... (implementation incomplete in view, just adding doc)
    }

    /**
     * Create a mirrored drawing function (X axis).
     * @param {Function} f - Function to mirror.
     * @param {number} [offset=0.0] - X offset.
     * @returns {Function} Mirrored function.
     */
    mirrorX(f, offset = 0.0) {
        return () => {
            this.moveTo(offset, 0);
            this.ctx.save();
            this.ctx.scale(-1, 1);
            f();
            this.ctx.restore();
        };
    }

    /**
     * Create a mirrored drawing function (Y axis).
     * @param {Function} f - Function to mirror.
     * @param {number} [offset=0.0] - Y offset.
     * @returns {Function} Mirrored function.
     */
    mirrorY(f, offset = 0.0) {
        return () => {
            this.moveTo(0, offset);
            this.ctx.save();
            this.ctx.scale(1, -1);
            f();
            this.ctx.restore();
        };
    }

    /**
     * Adjust size(s) by accounting for wall thickness/edges.
     * @param {number|number[]} l - Length or array of lengths.
     * @param {Edge|boolean|string} [e1=true] - First edge.
     * @param {Edge|boolean|string} [e2=true] - Second edge.
     * @returns {number|number[]} Adjusted size(s).
     */
    adjustSize(l, e1 = true, e2 = true) {
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

    // Hole drawing methods

    /**
     * Draw a circle (cutout).
     * @param {number} x - Center X.
     * @param {number} y - Center Y.
     * @param {number} r - Radius.
     */
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

    /**
     * Draw a regular polygon hole.
     * @param {number} x - Center X.
     * @param {number} y - Center Y.
     * @param {number} [r=0.0] - Radius (inner?).
     * @param {number} [d=0.0] - Diameter.
     * @param {number} [n=6] - Number of sides.
     * @param {number} [a=0.0] - Angle.
     * @param {number} [tabs=0] - Tabs.
     * @param {number} [corner_radius=0.0] - Corner radius.
     */
    regularPolygonHole(x, y, r = 0.0, d = 0.0, n = 6, a = 0.0, tabs = 0, corner_radius = 0.0) {
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

    /**
     * Draw a circular hole.
     * @param {number} x - Center X.
     * @param {number} y - Center Y.
     * @param {number|Object} [r=0.0] - Radius (or options object with r/d).
     * @param {number} [d=0.0] - Diameter.
     * @param {number} [tabs=0] - Tabs.
     */
    hole(x, y, r = 0.0, d = 0.0, tabs = 0) {
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

    /**
     * Draw a rectangular hole.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @param {number} dx - Width.
     * @param {number} dy - Height.
     * @param {number} [r=0] - Corner radius.
     * @param {boolean} [center_x=true] - Center X alignment.
     * @param {boolean} [center_y=true] - Center Y alignment.
     */
    rectangularHole(x, y, dx, dy, r = 0, center_x = true, center_y = true) {
        // Handle options object as 5th parameter
        if (typeof r === 'object' && r !== null) {
            const opts = r;
            r = opts.r !== undefined ? opts.r : 0;
            center_x = opts.center_x !== undefined ? opts.center_x : true;
            center_y = opts.center_y !== undefined ? opts.center_y : true;
        }
        
        this.restore(() => {
            this.holeCol(() => {
                r = Math.min(r, dx / 2., dy / 2.);
                // Python: x_start = x - dx / 2.0 if center_x else x
                // Python: y_start = y - dy / 2.0 if center_y else y
                const x_start = center_x ? x - dx / 2.0 : x;
                const y_start = center_y ? y - dy / 2.0 : y;

                this.moveTo(x_start + dx / 2.0, y_start + this.burn, 180);
                this.edge(dx / 2.0 - r);
                for (const d of [dy, dx, dy, dx / 2.0 + r]) {
                    this.corner(-90, r);
                    this.edge(d - 2 * r);
                }
            });
        });
    }

    /**
     * Fill an area with holes (stub implementation).
     * TODO: Implement full fillHoles functionality from Python version.
     * @param {Object} options - Options including pattern, border, max_radius, etc.
     */
    fillHoles(options = {}) {
        // Stub implementation - does nothing for now
        // The Python version implements multiple fill patterns (hex, square, random, hbar, vbar)
        // and various hole styles (round, triangle, square, hexagon, octagon)
        const {
            pattern = "no fill",
            border = [],
            max_radius = 3.0,
            hspace = 3,
            bspace = 0,
            min_radius = 0.5,
            style = "round",
            bar_length = 50,
            max_random = 1000
        } = options;
        
        // Currently a no-op stub
        // Full implementation would draw holes in the specified pattern within the border
    }

    /**
     * Draw a D-shaped hole.
     * @param {number} x - Center X.
     * @param {number} y - Center Y.
     * @param {number} [r=null] - Radius.
     * @param {number} [d=null] - Diameter.
     * @param {number} [w=null] - Width of flat part?
     * @param {number} [rel_w=0.75] - Relative width.
     * @param {number} [angle=0] - Angle.
     */
    dHole(x, y, r = null, d = null, w = null, rel_w = 0.75, angle = 0) {
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

    /**
     * Draw a hole with two flat sides.
     * @param {number} x - Center X.
     * @param {number} y - Center Y.
     * @param {number} [r=null] - Radius.
     * @param {number} [d=null] - Diameter.
     * @param {number} [w=null] - Width between flats.
     * @param {number} [rel_w=0.75] - Relative width.
     * @param {number} [angle=0] - Angle.
     */
    flatHole(x, y, r = null, d = null, w = null, rel_w = 0.75, angle = 0) {
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

    /**
     * Draw a mounting hole (keyhole style?).
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @param {number} d_shaft - Shaft diameter.
     * @param {number} [d_head=0.0] - Head diameter.
     * @param {number} [angle=0] - Angle.
     * @param {number} [tabs=0] - Tabs.
     */
    mountingHole(x, y, d_shaft, d_head = 0.0, angle = 0, tabs = 0) {
        this.restore(() => {
            this.holeCol(() => {
                if (d_shaft < (2 * this.burn)) return;

                if (!d_head || d_head < (2 * this.burn)) {
                    this.hole(x, y, d_shaft / 2, 0, tabs);
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

    /**
     * Draw text.
     * @param {string} text - Text to draw.
     * @param {number} [x=0] - X coordinate.
     * @param {number} [y=0] - Y coordinate.
     * @param {number} [angle=0] - Angle.
     * @param {string} [align=""] - Alignment (e.g., "center middle").
     * @param {number} [fontsize=10] - Font size.
     * @param {number[]} [color=[0.0, 0.0, 0.0]] - Color RGB array.
     * @param {string} [font="Arial"] - Font family.
     */
    text(text, x = 0, y = 0, angle = 0, align = "", fontsize = 10, color = [0.0, 0.0, 0.0], font = "Arial") {
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

    /**
     * Draw a Torx hole pattern (mock).
     * @param {number} size - Size index.
     * @param {number} [x=0] - X coordinate.
     * @param {number} [y=0] - Y coordinate.
     * @param {number} [angle=0] - Angle.
     */
    TX(size, x = 0, y = 0, angle = 0) {
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

    /**
     * Draw NEMA motor mounting holes.
     * @param {number} size - NEMA size.
     * @param {number} [x=0] - X coordinate.
     * @param {number} [y=0] - Y coordinate.
     * @param {number} [angle=0] - Angle.
     * @param {number} [screwholes=null] - Override screw hole size.
     */
    NEMA(size, x = 0, y = 0, angle = 0, screwholes = null) {
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

/**
 * Settings for hole filling patterns
 * Corresponds to Python fillHolesSettings class
 */
class fillHolesSettings extends Settings {
    static absolute_params = {
        fill_pattern: ["no fill", "hex", "square", "random", "hbar", "vbar"],
        hole_style: ["round", "triangle", "square", "hexagon", "octagon"],
        max_random: 1000,
        bar_length: 50,
        hole_max_radius: 3.0,
        hole_min_radius: 0.5,
        space_between_holes: 4.0,
        space_to_border: 4.0,
    };
}

export { Boxes, fillHolesSettings };
