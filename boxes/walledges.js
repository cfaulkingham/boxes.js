import { Boxes } from './boxes.js';
import { FingerJointSettings, BaseEdge, Settings } from './edges.js';

/**
 * Mixin for boxes that can be mounted on a wall.
 * Adds arguments and logic for various wall mounting systems.
 */
class _WallMountedBox extends Boxes {
    constructor() {
        super();
        this.addWallSettingsArgs();
    }

    /**
     * Add arguments for wall mounting settings.
     */
    addWallSettingsArgs() {
        this.addSettingsArgs(FingerJointSettings);
        this.addSettingsArgs(WallSettings);
        this.addSettingsArgs(SlatWallSettings);
        this.addSettingsArgs(DinRailSettings);
        this.addSettingsArgs(FrenchCleatSettings);
        this.addSettingsArgs(SkadisSettings);
        this.argparser.add_argument("--walltype", {
            action: "store",
            type: "str",
            default: "plain",
            choices: ["plain", "plain reinforced", "slatwall", "dinrail", "french cleat", "skadis"],
            help: "Type of wall system to attach to"
        });
    }

    /**
     * Generate the wall edges based on the selected wall type.
     */
    generateWallEdges() {
        let s;
        // Helper function to safely get edge settings defaults
        const getEdgeDefaults = (name) => {
            if (this.edgesettings && this.edgesettings[name]) {
                return this.edgesettings[name].defaults || {};
            }
            return {};
        };

        if (this.walltype.startsWith("plain")) {
            s = new WallSettings(this.thickness, true, getEdgeDefaults("Wall"));
        } else if (this.walltype === "slatwall") {
            s = new SlatWallSettings(this.thickness, true, getEdgeDefaults("SlatWall"));
        } else if (this.walltype === "dinrail") {
            s = new DinRailSettings(this.thickness, true, getEdgeDefaults("DinRail"));
        } else if (this.walltype === "french cleat") {
            s = new FrenchCleatSettings(this.thickness, true, getEdgeDefaults("FrenchCleat"));
        } else if (this.walltype === "skadis") {
            s = new SkadisSettings(this.thickness, true, getEdgeDefaults("Skadis"));
        }

        s.edgeObjects(this);
        this.wallHolesAt = this.edges["|"];
        if (this.walltype.endsWith("reinforced")) {
            this.edges["c"] = this.edges["d"];
            this.edges["C"] = this.edges["D"];
        }
    }
}

export { _WallMountedBox };

// #############################################################################
// ####     Straight Edge / Base class
// #############################################################################

/**
 * Base class for wall edges.
 */
class WallEdge extends BaseEdge {
    /**
     * Create a WallEdge.
     * @param {Boxes} boxes - The main boxes instance.
     * @param {Object} settings - Edge settings.
     */
    constructor(boxes, settings) {
        super(boxes, settings);
        this._reversed = false;
    }

    lengths(length) {
        return [length];
    }

    _joint(length) {
        this.boxes.edge(length);
    }

    _section(nr, length) {
        this.boxes.edge(length);
    }

    draw(length, kw = {}) {
        let lengths = Array.from(this.lengths(length).entries());
        if (this._reversed) {
            lengths = [...lengths].reverse();
        }

        for (let [nr, l] of lengths) {
            if (l === 0.0) {
                continue;
            }
            if (nr % 2) {
                this._section(Math.floor(nr / 2), l);
            } else {
                this._joint(l);
            }
        }
    }
}

export { WallEdge };

/**
 * Wall edge that joins with another part (finger joint connection).
 */
class WallJoinedEdge extends WallEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
        this.char = "b";
    }

    _joint(length) {
        let t = this.settings.thickness;
        this.boxes.step(-t);
        this.boxes.edges["f"].draw(length);
        this.boxes.step(t);
    }

    startwidth() {
        return this.settings.thickness;
    }
}

export { WallJoinedEdge };

/**
 * Back edge for wall mounted box.
 */
class WallBackEdge extends WallEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
    }

    _section(nr, length) {
        this.boxes.edge(length);
    }

    _joint(length) {
        let t = this.settings.thickness;
        this.boxes.step(this.boxes.edges["F"].startwidth());
        this.boxes.edges["F"].draw(length);
        this.boxes.step(-this.boxes.edges["F"].endwidth());
    }

    margin() {
        return this.settings.thickness;
    }
}

export { WallBackEdge };

/**
 * Edge with holes for wall mounting.
 */
class WallHoles extends WallEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
    }

    _section(nr, length) {
        this.boxes.rectangularHole(length / 2, 0, length, this.settings.thickness);
        this.boxes.moveTo(length, 0);
    }

    _joint(length) {
        this.boxes.fingerHolesAt(0, 0, length, 0);
        this.boxes.moveTo(length, 0);
    }

    draw(x, y, length, angle = 90, kw = {}) {
        this.boxes.ctx.save();
        this.boxes.moveTo(x, y, angle);
        let b = this.boxes.burn;
        let t = this.settings.thickness;

        if (this.boxes.debug) {
            let width = this.settings.thickness;
            this.boxes.ctx.rectangle(b, -width / 2 + b, length - 2 * b, width - 2 * b);
        }

        this.boxes.moveTo(length, 0, 180);
        super.draw(length);
        this.boxes.ctx.restore();
    }
}

export { WallHoles };

/**
 * Edge that includes wall holes.
 */
class WallHoleEdge extends WallHoles {
    constructor(boxes, wallHoles, kw = {}) {
        super(boxes, wallHoles.settings);
        this.wallHoles = wallHoles;
    }

    draw(length, kw = {}) {
        const { bedBolts, bedBoltSettings } = kw;
        let dist = this.wallHoles.settings.values.edge_width + this.settings.thickness / 2;
        this.boxes.ctx.save();
        let px, angle;
        if (this._reversed) {
            [px, angle] = [0, 0];
        } else {
            [px, angle] = [length, 180];
        }
        this.wallHoles.draw(px, dist, length, angle);
        this.boxes.ctx.restore();
        this.boxes.edge(length, { tabs: 2 });
    }

    startwidth() {
        return this.wallHoles.settings.values.edge_width + this.settings.thickness;
    }

    margin() {
        return 0.0;
    }
}

export { WallHoleEdge };

/**
 * Settings for Wall mounting.
 */
class WallSettings extends Settings {
    static absolute_params = {};

    static relative_params = {
        "edge_width": 1.0,
    };

    static base_class = WallEdge;

    constructor(thickness, relative = true, kwargs = {}) {
        super(thickness, relative, kwargs);
    }

    edgeObjects(boxes, chars = "aAbBcCdD|", add = true) {
        const bc = this.constructor.base_class;
        const bn = bc.name;

        // Create wallholes instance
        const wallholes = new (createWallHolesClass(WallHoles, bc))(boxes, this);

        const edges = [
            new bc(boxes, this),
            createReversedClass(bc, boxes, this),
            createJoinedClass(bc, boxes, this),
            createJoinedReversedClass(bc, boxes, this),
            createBackClass(bc, boxes, this),
            createBackReversedClass(bc, boxes, this),
            new (createWallHoleEdgeClass(WallHoleEdge, bc))(boxes, wallholes),
            createWallHoleEdgeReversedClass(bc, boxes, wallholes),
            wallholes,
        ];

        return this._edgeObjects(edges, boxes, chars, add);
    }

    _edgeObjects(edges, boxes, chars, add) {
        // Assign characters to edges
        for (let i = 0; i < edges.length && i < chars.length; i++) {
            if (edges[i]) {
                edges[i].char = chars[i];
            }
        }

        if (add) {
            for (let i = 0; i < edges.length && i < chars.length; i++) {
                if (edges[i]) {
                    boxes.edges[chars[i]] = edges[i];
                }
            }
        }

        return edges;
    }
}

// Helper functions to create dynamic classes (simulate Python's type())

/**
 * Create a reversed version of the base edge class.
 * @param {class} BaseClass - The base edge class.
 * @param {Boxes} boxes - The boxes instance.
 * @param {Object} settings - Edge settings.
 * @returns {WallEdge} Instance of the reversed edge.
 */
function createReversedClass(BaseClass, boxes, settings) {
    class Reversed extends BaseClass {
        constructor() {
            super(boxes, settings);
            this._reversed = true;
        }
    }
    return new Reversed();
}

function createJoinedClass(BaseClass, boxes, settings) {
    class Joined extends WallJoinedEdge {
        constructor() {
            super(boxes, settings);
        }

        _section(nr, length) {
            // Use BaseClass's _section if it exists
            if (BaseClass.prototype._section && BaseClass.prototype._section !== WallEdge.prototype._section) {
                BaseClass.prototype._section.call(this, nr, length);
            } else {
                super._section(nr, length);
            }
        }

        margin() {
            if (BaseClass.prototype.margin && BaseClass.prototype.margin !== WallEdge.prototype.margin) {
                return BaseClass.prototype.margin.call(this);
            }
            return super.margin ? super.margin() : 0;
        }

        lengths(length) {
            if (BaseClass.prototype.lengths && BaseClass.prototype.lengths !== WallEdge.prototype.lengths) {
                return BaseClass.prototype.lengths.call(this, length);
            }
            return super.lengths ? super.lengths(length) : [length];
        }
    }
    return new Joined();
}

function createJoinedReversedClass(BaseClass, boxes, settings) {
    class JoinedReversed extends WallJoinedEdge {
        constructor() {
            super(boxes, settings);
            this._reversed = true;
        }

        _section(nr, length) {
            if (BaseClass.prototype._section && BaseClass.prototype._section !== WallEdge.prototype._section) {
                BaseClass.prototype._section.call(this, nr, length);
            } else {
                super._section(nr, length);
            }
        }

        margin() {
            if (BaseClass.prototype.margin && BaseClass.prototype.margin !== WallEdge.prototype.margin) {
                return BaseClass.prototype.margin.call(this);
            }
            return super.margin ? super.margin() : 0;
        }

        lengths(length) {
            if (BaseClass.prototype.lengths && BaseClass.prototype.lengths !== WallEdge.prototype.lengths) {
                return BaseClass.prototype.lengths.call(this, length);
            }
            return super.lengths ? super.lengths(length) : [length];
        }
    }
    return new JoinedReversed();
}

function createBackClass(BaseClass, boxes, settings) {
    class Back extends WallBackEdge {
        constructor() {
            super(boxes, settings);
        }

        _section(nr, length) {
            if (BaseClass.prototype._section && BaseClass.prototype._section !== WallEdge.prototype._section) {
                BaseClass.prototype._section.call(this, nr, length);
            } else {
                super._section(nr, length);
            }
        }

        margin() {
            if (BaseClass.prototype.margin && BaseClass.prototype.margin !== WallEdge.prototype.margin) {
                return BaseClass.prototype.margin.call(this);
            }
            return super.margin ? super.margin() : this.settings.thickness;
        }

        lengths(length) {
            if (BaseClass.prototype.lengths && BaseClass.prototype.lengths !== WallEdge.prototype.lengths) {
                return BaseClass.prototype.lengths.call(this, length);
            }
            return super.lengths ? super.lengths(length) : [length];
        }
    }
    return new Back();
}

function createBackReversedClass(BaseClass, boxes, settings) {
    class BackReversed extends WallBackEdge {
        constructor() {
            super(boxes, settings);
            this._reversed = true;
        }

        _section(nr, length) {
            if (BaseClass.prototype._section && BaseClass.prototype._section !== WallEdge.prototype._section) {
                BaseClass.prototype._section.call(this, nr, length);
            } else {
                super._section(nr, length);
            }
        }

        margin() {
            if (BaseClass.prototype.margin && BaseClass.prototype.margin !== WallEdge.prototype.margin) {
                return BaseClass.prototype.margin.call(this);
            }
            return super.margin ? super.margin() : this.settings.thickness;
        }

        lengths(length) {
            if (BaseClass.prototype.lengths && BaseClass.prototype.lengths !== WallEdge.prototype.lengths) {
                return BaseClass.prototype.lengths.call(this, length);
            }
            return super.lengths ? super.lengths(length) : [length];
        }
    }
    return new BackReversed();
}

function createWallHolesClass(WallHolesBase, BaseClass) {
    return class extends WallHolesBase {
        _section(nr, length) {
            if (BaseClass.prototype._section && BaseClass.prototype._section !== WallEdge.prototype._section) {
                BaseClass.prototype._section.call(this, nr, length);
            } else {
                super._section(nr, length);
            }
        }

        lengths(length) {
            if (BaseClass.prototype.lengths && BaseClass.prototype.lengths !== WallEdge.prototype.lengths) {
                return BaseClass.prototype.lengths.call(this, length);
            }
            return super.lengths ? super.lengths(length) : [length];
        }
    };
}

function createWallHoleEdgeClass(WallHoleEdgeBase, BaseClass) {
    return class extends WallHoleEdgeBase {
        margin() {
            if (BaseClass.prototype.margin && BaseClass.prototype.margin !== WallEdge.prototype.margin) {
                return BaseClass.prototype.margin.call(this);
            }
            return super.margin ? super.margin() : 0.0;
        }
    };
}

function createWallHoleEdgeReversedClass(BaseClass, boxes, wallholes) {
    class WallHoleEdgeReversed extends WallHoleEdge {
        constructor() {
            super(boxes, wallholes);
            this._reversed = true;
        }

        margin() {
            if (BaseClass.prototype.margin && BaseClass.prototype.margin !== WallEdge.prototype.margin) {
                return BaseClass.prototype.margin.call(this);
            }
            return super.margin ? super.margin() : 0.0;
        }
    }
    return new WallHoleEdgeReversed();
}

export { WallSettings };

// #############################################################################
// ####     Slat wall
// #############################################################################

/**
 * Edge for mounting on Slat Wall systems.
 */
class SlatWallEdge extends WallEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
    }

    lengths(length) {
        const pitch = this.settings.values.pitch;
        const h = this.settings.values.hook_height;
        const he = this.settings.values.hook_extra_height;

        let lengths = [];
        if (length < h + he) {
            return [length];
        }
        lengths = [0, h + he];
        length -= h + he;
        if (length > pitch) {
            lengths.push(Math.floor(length / pitch) * pitch - h - 2 - 2 * he);
            lengths.push(h + 2 + 2 * he);
            lengths.push(length % pitch);
        } else {
            lengths.push(length);
        }
        return lengths;
    }

    _section(nr, length) {
        const w = this.settings.values.hook_height;
        const hd = this.settings.values.hook_depth;
        const hdist = this.settings.values.hook_distance;
        const hh = this.settings.values.hook_overall_height;
        const ro = w;
        const ri = Math.min(w / 2, hd / 2);
        const rt = Math.min(1, hd / 2);
        const slot = this.settings.values.hook_height + 2;

        let poly;
        if (nr === 0) {
            poly = [
                0, -90, hdist - ri,
                [-90, ri],
                hh - ri - w - rt,
                [90, rt],
                hd - 2 * rt,
                [90, rt],
                hh - ro - rt,
                [90, ro],
                hdist + hd - ro, -90,
                length - 6
            ];
        } else if (nr === 1) {
            if (this.settings.values.bottom_hook === "spring") {
                const r_plug = slot * 0.4;
                const slotslot = slot - r_plug * Math.pow(2, 0.5);
                poly = [
                    this.settings.values.hook_extra_height, -90,
                    5.0, -45, 0,
                    [135, r_plug],
                    0, 90, 10, -90, slotslot, -90, 10, 90, 0,
                    [135, r_plug],
                    0, -45, 5, -90,
                    this.settings.values.hook_extra_height
                ];
            } else if (this.settings.values.bottom_hook === "hook") {
                const d = 2;
                poly = [
                    this.settings.values.hook_extra_height + d - 1, -90,
                    4.5 + hd,
                    [90, 1],
                    slot - 2,
                    [90, 1],
                    hd - 1, 90, d,
                    -90, 5.5, -90, this.settings.values.hook_extra_height + 1
                ];
            } else if (this.settings.values.bottom_hook === "stud") {
                poly = [
                    this.settings.values.hook_extra_height, -90,
                    6,
                    [90, 1],
                    slot - 2,
                    [90, 1],
                    6, -90,
                    this.settings.values.hook_extra_height
                ];
            } else {
                poly = [2 * this.settings.values.hook_extra_height + slot];
            }
        }

        if (this._reversed) {
            poly = [...poly].reverse();
        }
        this.boxes.polyline(...poly);
    }

    margin() {
        return this.settings.values.hook_depth + this.settings.values.hook_distance;
    }
}

export { SlatWallEdge };

/**
 * Settings for Slat Wall edge.
 */
class SlatWallSettings extends WallSettings {
    static absolute_params = {
        "bottom_hook": ["hook", "spring", "stud", "none"],
        "pitch": 101.6,
        "hook_depth": 4.0,
        "hook_distance": 5.5,
        "hook_height": 6.0,
        "hook_overall_height": 12.0,
    };

    static relative_params = {
        "hook_extra_height": 2.0,
        "edge_width": 1.0,
    };

    static base_class = SlatWallEdge;
}

export { SlatWallSettings };

// #############################################################################
// ####     DIN rail
// #############################################################################

/**
 * Edge for mounting on DIN rail.
 */
class DinRailEdge extends WallEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
    }

    lengths(length) {
        if (length < 20) {
            return [length];
        }
        if (length > 50 && this.settings.values.bottom === "stud") {
            return [0, 20, length - 40, 20];
        }
        return [0, 20, length - 20];
    }

    _section(nr, length) {
        const d = this.settings.values.depth;

        let poly;
        if (nr === 0) {
            const r = 1.;
            poly = [
                0, -90, d - 0.5 - r,
                [90, r],
                15 + 3 - 2 * r,
                [90, r],
                d - 4 - r, 45,
                4 * Math.pow(2, 0.5), -45, 0.5, -90, 6
            ];
        } else if (nr === 1) {
            const slot = 20;
            if (this.settings.values.bottom === "stud") {
                const r = 1.;
                poly = [
                    0, -90, 7.5 - r,
                    [90, r],
                    slot - 2 * r,
                    [90, r],
                    7.5 - r, -90, 0
                ];
            } else {
                poly = [slot];
            }
        }

        if (this._reversed) {
            poly = [...poly].reverse();
        }
        this.boxes.polyline(...poly);
    }

    margin() {
        return this.settings.values.depth;
    }
}

export { DinRailEdge };

/**
 * Settings for DIN rail edge.
 */
class DinRailSettings extends WallSettings {
    static absolute_params = {
        "bottom": ["stud", "none"],
        "depth": 8.0,
    };

    static relative_params = {
        "edge_width": 1.0,
    };

    static base_class = DinRailEdge;
}

export { DinRailSettings };

// #############################################################################
// ####     French Cleats
// #############################################################################

/**
 * Edge for mounting on French Cleat systems.
 */
class FrenchCleatEdge extends WallEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
    }

    lengths(length) {
        const d = this.settings.values.depth;
        const t = this.settings.thickness;
        const s = this.settings.values.spacing;
        const h = d * Math.tan(this.settings.values.angle * Math.PI / 180);
        const top = 0.5 * t;
        const bottom = 0.5 * t;

        if (length < top + bottom + 1.5 * d + h) {
            return [length];
        }
        if (length > top + bottom + 2 * t + 1.5 * d + h && this.settings.values.bottom === "stud") {
            return [top, 1.5 * d + h, length - top - bottom - 2.5 * d - h, d, bottom];
        }
        if (length > top + bottom + 2.5 * d + s && this.settings.values.bottom === "hook") {
            const dist = Math.floor((length - top - t - 1.5 * d - h) / s) * s - 1.5 * d - h;
            return [top, 1.5 * d + h, dist, 1.5 * d + h, length - dist - top - 3 * d - 2 * h];
        }
        return [top, 2.5 * d, length - top - 2.5 * d];
    }

    _section(nr, length) {
        const d = this.settings.values.depth;
        const t = this.settings.thickness;
        const r = Math.min(0.5 * t, 0.1 * d);
        const a = this.settings.values.angle;
        const h = d * Math.tan(a * Math.PI / 180);
        const l = d / Math.cos(a * Math.PI / 180);

        let poly;
        if (nr === 0 || this.settings.values.bottom === "hook") {
            poly = [0, -90, 0, [90, d], 0.5 * d + h, 90 + a, l, -90 - a, length - 1.5 * d];
        } else if (nr === 1) {
            if (this.settings.values.bottom === "stud") {
                const r_stud = Math.min(t, length / 4, d);
                poly = [
                    0, -90, d - r_stud,
                    [90, r_stud],
                    length - 2 * r_stud,
                    [90, r_stud],
                    d - r_stud, -90, 0
                ];
            } else {
                poly = [length];
            }
        }

        if (this._reversed) {
            poly = [...poly].reverse();
        }
        this.boxes.polyline(...poly);
    }

    margin() {
        return this.settings.values.depth;
    }
}

export { FrenchCleatEdge };

/**
 * Settings for French Cleat edge.
 */
class FrenchCleatSettings extends WallSettings {
    static absolute_params = {
        "bottom": ["stud", "hook", "none"],
        "depth": 18.0,
        "spacing": 200.0,
        "angle": 45.0,
    };

    static relative_params = {
        "edge_width": 1.0,
    };

    static base_class = FrenchCleatEdge;
}

export { FrenchCleatSettings };

// #############################################################################
// ####     Skadis
// #############################################################################

/**
 * Edge for mounting on IKEA Skadis pegboards.
 */
class SkadisEdge extends WallEdge {
    constructor(boxes, settings) {
        super(boxes, settings);
    }

    lengths(length) {
        if (length < 11) {
            return [length];
        }
        if (this.settings.values.style === "hooks") {
            const result = [0, 11];
            const count = Math.floor((length - 11) / 40);
            for (let i = 0; i < count; i++) {
                result.push(29, 11);
            }
            result.push((length - 11) % 40);
            return result;
        } else if (this.settings.values.style === "hook+stud" && length > 40 + 15) {
            return [0, 11, 29, 10, length - 11 - 29 - 10];
        } else {
            return [0, 11, length - 11];
        }
    }

    _section(nr, length) {
        let poly = [length];
        const r = 1;
        const a = 10;
        const ar = a * Math.PI / 180;
        const b = this.settings.values.board_thickness;
        const h = 4.8;

        if (nr === 0 || this.settings.values.style === "hooks") {
            poly = [
                0, -90, b + h - r,
                [90, r],
                10 - 2 * r,
                [90, r],
                h - r - 5 * Math.tan(ar), 90 - a,
                5 / Math.cos(ar), -90 + a, b - r,
                [-90, r],
                length - r - 5
            ];
        } else {
            poly = [
                0, -90, b,
                [90, 2],
                10 - 4,
                [90, 2],
                b, -90, length - 10
            ];
        }

        if (this._reversed) {
            poly = [...poly].reverse();
        }
        return this.boxes.polyline(...poly);
    }

    margin() {
        return this.settings.values.board_thickness + 4.8;
    }
}

export { SkadisEdge };

/**
 * Settings for Skadis edge.
 */
class SkadisSettings extends WallSettings {
    static absolute_params = {
        "style": ["hooks", "hook+stud", "studs"],
    };

    static relative_params = {
        "edge_width": 1.0,
        "board_thickness": 5.0,
    };

    static base_class = SkadisEdge;
}

export { SkadisSettings };
