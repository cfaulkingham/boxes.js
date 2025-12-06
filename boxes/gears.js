import { vdiff, vlength } from './vectors.js';

// Helper math functions

/**
 * Generate a sequence of linearly spaced numbers.
 * @param {number} a - Start value.
 * @param {number} b - End value.
 * @param {number} n - Number of points.
 * @returns {number[]} Array of n linearly spaced points.
 */
function linspace(a, b, n) {
    if (n < 2) return n === 1 ? [a] : [];
    const step = (b - a) / (n - 1);
    const result = [];
    for (let i = 0; i < n; i++) {
        result.push(a + i * step);
    }
    return result;
}

/**
 * Calculate the angle where the involute intersects a given radius.
 * @param {number} Rb - Base radius.
 * @param {number} R - Target radius.
 * @returns {number} Angle in radians.
 */
function involuteIntersectAngle(Rb, R) {
    return (Math.sqrt(Math.pow(R, 2) - Math.pow(Rb, 2)) / Rb) - Math.acos(Rb / R);
}

/**
 * Calculate coordinates of a point on a circle.
 * @param {number} radius - Circle radius.
 * @param {number} angle - Angle in radians.
 * @returns {number[]} [x, y] coordinates.
 */
function pointOnCircle(radius, angle) {
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
}

/**
 * Convert degrees to radians.
 * @param {number} deg - Angle in degrees.
 * @returns {number} Angle in radians.
 */
function radians(deg) {
    return deg * Math.PI / 180;
}

/**
 * Convert radians to degrees.
 * @param {number} rad - Angle in radians.
 * @returns {number} Angle in degrees.
 */
function degrees(rad) {
    return rad * 180 / Math.PI;
}

// Undercut support functions

/**
 * Calculate minimum teeth to avoid undercut.
 * @param {number} pitchAngle - Pitch angle in degrees.
 * @param {number} [k=1.0] - Addendum coefficient.
 * @returns {number} Minimum number of teeth.
 */
function undercutMinTeeth(pitchAngle, k = 1.0) {
    const x = Math.max(Math.sin(radians(pitchAngle)), 0.01);
    return 2 * k / (x * x);
}

/**
 * Calculate maximum addendum coefficient to avoid undercut.
 * @param {number} teeth - Number of teeth.
 * @param {number} [pitchAngle=20.0] - Pitch angle in degrees.
 * @returns {number} Max addendum coefficient.
 */
function undercutMaxK(teeth, pitchAngle = 20.0) {
    const x = Math.max(Math.sin(radians(pitchAngle)), 0.01);
    return 0.5 * teeth * x * x;
}

/**
 * Calculate minimum pitch angle to avoid undercut.
 * @param {number} teeth - Number of teeth.
 * @param {number} [k=1.0] - Addendum coefficient.
 * @returns {number} Minimum pitch angle in degrees.
 */
function undercutMinAngle(teeth, k = 1.0) {
    return degrees(Math.asin(Math.min(0.856, Math.sqrt(2.0 * k / teeth))));
}

/**
 * Check if the gear configuration has undercut.
 * @param {number} teeth - Number of teeth.
 * @param {number} [pitchAngle=20.0] - Pitch angle in degrees.
 * @param {number} [k=1.0] - Addendum coefficient.
 * @returns {boolean} True if undercut exists.
 */
function haveUndercut(teeth, pitchAngle = 20.0, k = 1.0) {
    return teeth < undercutMinTeeth(pitchAngle, k);
}

/**
 * Perform basic gear calculations.
 * @param {number} numTeeth - Number of teeth.
 * @param {number} circularPitch - Circular pitch.
 * @param {number} pressureAngle - Pressure angle in degrees.
 * @param {number} [clearance=0] - Clearance.
 * @param {boolean} [ringGear=false] - Whether it is a ring gear.
 * @param {number} [profileShift=0.0] - Profile shift coefficient.
 * @returns {Object} Gear dimensions and parameters.
 */
function gearCalculations(numTeeth, circularPitch, pressureAngle, clearance = 0, ringGear = false, profileShift = 0.0) {
    const diametralPitch = Math.PI / circularPitch;
    const pitchDiameter = numTeeth / diametralPitch;
    const pitchRadius = pitchDiameter / 2.0;
    let addendum = 1 / diametralPitch;
    let dedendum = addendum;

    dedendum *= (1 + profileShift);
    addendum *= (1 - profileShift);

    if (ringGear) {
        addendum += clearance;
    } else {
        dedendum += clearance;
    }

    const baseRadius = pitchDiameter * Math.cos(radians(pressureAngle)) / 2.0;
    const outerRadius = pitchRadius + addendum;
    const rootRadius = pitchRadius - dedendum;

    const toothThickness = (Math.PI * pitchDiameter) / (2.0 * numTeeth);

    return {
        pitchRadius,
        baseRadius,
        addendum,
        dedendum,
        outerRadius,
        rootRadius,
        toothThickness
    };
}

/**
 * Generate points for a gear rack.
 * @param {number} toothCount - Number of teeth.
 * @param {number} pitch - Circular pitch.
 * @param {number} addendum - Addendum height.
 * @param {number} pressureAngle - Pressure angle in degrees.
 * @param {number} baseHeight - Height of the rack base.
 * @param {number} tabLength - Length of end tabs.
 * @param {number} [clearance=0] - Clearance.
 * @param {boolean} [drawGuides=false] - Whether to include guide points.
 * @returns {Object} Object containing points and guidePoints.
 */
function generateRackPoints(toothCount, pitch, addendum, pressureAngle, baseHeight, tabLength, clearance = 0, drawGuides = false) {
    const spacing = 0.5 * pitch;

    if (tabLength <= 0.0) {
        tabLength = 1E-8;
    }

    const tas = Math.tan(radians(pressureAngle)) * addendum;
    const tasc = Math.tan(radians(pressureAngle)) * (addendum + clearance);
    const baseTop = addendum + clearance;
    const baseBot = addendum + clearance + baseHeight;

    const xLhs = -pitch * 0.5 * toothCount - tabLength;

    const points = [];
    points.push([xLhs, baseBot]);
    points.push([xLhs, baseTop]);
    let x = xLhs + tabLength + tasc;

    for (let i = 0; i < toothCount; i++) {
        points.push([x - tasc, baseTop]);
        points.push([x + tas, -addendum]);
        points.push([x + spacing - tas, -addendum]);
        points.push([x + spacing + tasc, baseTop]);
        x += pitch;
    }

    const xRhs = x - tasc + tabLength;
    points.push([xRhs, baseTop]);
    points.push([xRhs, baseBot]);

    const guidePoints = [];
    if (drawGuides) {
        guidePoints.push([xLhs + 0.5 * tabLength, 0]);
        guidePoints.push([xRhs - 0.5 * tabLength, 0]);
    }

    return { points, guidePoints };
}

/**
 * Generate points for a spur gear profile.
 * @param {number} teeth - Number of teeth.
 * @param {number} baseRadius - Base circle radius.
 * @param {number} pitchRadius - Pitch circle radius.
 * @param {number} outerRadius - Outer circle radius.
 * @param {number} rootRadius - Root circle radius.
 * @param {number} accuracyInvolute - Number of points for involute curve.
 * @param {number} accuracyCircular - Number of points for circular arcs.
 * @returns {number[]} Array of points defining the gear profile.
 */
function generateSpurPoints(teeth, baseRadius, pitchRadius, outerRadius, rootRadius, accuracyInvolute, accuracyCircular) {
    const twoPi = 2 * Math.PI;
    const halfThickAngle = twoPi / (4.0 * teeth);
    const pitchToBaseAngle = involuteIntersectAngle(baseRadius, pitchRadius);
    const pitchToOuterAngle = involuteIntersectAngle(baseRadius, outerRadius) - pitchToBaseAngle;

    const startInvoluteRadius = Math.max(baseRadius, rootRadius);
    const radii = linspace(startInvoluteRadius, outerRadius, accuracyInvolute);
    const angles = radii.map(r => involuteIntersectAngle(baseRadius, r));

    const centers = [];
    for (let x = 0; x < teeth; x++) {
        centers.push(x * twoPi / teeth);
    }

    const points = [];

    for (const c of centers) {
        const pitch1 = c - halfThickAngle;
        const base1 = pitch1 - pitchToBaseAngle;
        const offsetangles1 = angles.map(x => base1 + x);
        const points1 = radii.map((r, i) => pointOnCircle(r, offsetangles1[i]));

        const pitch2 = c + halfThickAngle;
        const base2 = pitch2 + pitchToBaseAngle;
        const offsetangles2 = angles.map(x => base2 - x);
        const points2 = radii.map((r, i) => pointOnCircle(r, offsetangles2[i]));

        const outerAngleStart = offsetangles1[offsetangles1.length - 1];
        const outerAngleEnd = offsetangles2[offsetangles2.length - 1];
        const outerAngles = linspace(outerAngleStart, outerAngleEnd, accuracyCircular);
        const pointsOnOuterRadius = outerAngles.map(x => pointOnCircle(outerRadius, x));

        let pointsOnRoot;
        if (rootRadius > baseRadius) {
            const pitchToRootAngle = pitchToBaseAngle - involuteIntersectAngle(baseRadius, rootRadius);
            const root1 = pitch1 - pitchToRootAngle;
            const root2 = pitch2 + pitchToRootAngle;
            const rootAngles = linspace(root2, root1 + (twoPi / teeth), accuracyCircular);
            pointsOnRoot = rootAngles.map(x => pointOnCircle(rootRadius, x));

            // p_tmp = points1 + points_on_outer_radius[1:-1] + points2[::-1] + points_on_root[1:-1]
            const pTmp = [
                ...points1,
                ...pointsOnOuterRadius.slice(1, -1),
                ...points2.slice().reverse(),
                ...pointsOnRoot.slice(1, -1)
            ];
            points.push(...pTmp);
        } else {
            const rootAngles = linspace(base2, base1 + (twoPi / teeth), accuracyCircular);
            pointsOnRoot = rootAngles.map(x => pointOnCircle(rootRadius, x));

            // p_tmp = points1 + points_on_outer_radius[1:-1] + points2[::-1] + points_on_root
            const pTmp = [
                ...points1,
                ...pointsOnOuterRadius.slice(1, -1),
                ...points2.slice().reverse(),
                ...pointsOnRoot
            ];
            points.push(...pTmp);
        }
    }

    return points;
}

/**
 * Class representing a Gears generator.
 * Provides methods to configure and draw gears and racks.
 */
class Gears {
    /**
     * Create a Gears generator.
     * @param {Boxes} boxes - The main boxes instance.
     */
    constructor(boxes) {
        this.boxes = boxes;
        // Default options
        this.defaults = {
            teeth: 24,
            system: 'MM', // 'CP', 'DP', 'MM'
            dimension: 1.0,
            angle: 20.0,
            profile_shift: 20.0,
            units: 'mm',
            accuracy: 0,
            clearance: 0.0,
            annotation: false,
            internal_ring: false,
            mount_hole: 0.0,
            mount_diameter: 15,
            spoke_count: 3,
            spoke_width: 5,
            holes_rounding: 5,
            active_tab: '',
            centercross: false,
            pitchcircle: false,
            drawrack: false,
            teeth_length: 12,
            base_height: 8,
            base_tab: 14,
            undercut_alert: false,
        };
        this.options = { ...this.defaults };
    }

    /**
     * Parse and update gear options.
     * @param {Object} args - Configuration options.
     */
    parseArgs(args) {
        this.options = { ...this.defaults, ...args };
    }

    /**
     * Calculate the circular pitch based on the selected system (MM, CP, DP).
     * @returns {number} The calculated circular pitch.
     * @throws {Error} If system is unknown.
     */
    calcCircularPitch() {
        const dimension = this.options.dimension;
        let circularPitch;
        if (this.options.system === 'CP') {
            circularPitch = dimension * 25.4;
        } else if (this.options.system === 'DP') {
            circularPitch = Math.PI * 25.4 / dimension;
        } else if (this.options.system === 'MM') {
            circularPitch = Math.PI * dimension;
        } else {
            throw new Error(`unknown system '${this.options.system}', try CP, DP, MM`);
        }
        return circularPitch;
    }

    /**
     * Generate spokes for the gear.
     * @param {number} rootRadius - Root radius of the gear.
     * @param {number} spokeWidth - Width of the spokes.
     * @param {number|number[]} spokes - Number of spokes or array of spoke angles.
     * @param {number} mountRadius - Radius of the mounting area.
     * @param {number} mountHole - Diameter of the mount hole.
     * @param {number} unitFactor - Unit conversion factor.
     * @param {string} unitLabel - Unit label (e.g., 'mm').
     * @returns {string[]} List of warning messages (e.g. if spokes don't fit).
     */
    generateSpokes(rootRadius, spokeWidth, spokes, mountRadius, mountHole, unitFactor, unitLabel) {
        if (!spokes) return [];

        const messages = [];
        const rOuter = rootRadius - spokeWidth;
        let collision = false;

        let spokeCount;
        let spokeAngles;

        if (typeof spokes === 'number') {
            spokeCount = spokes;
            spokeAngles = [];
            for (let i = 0; i < spokeCount; i++) {
                spokeAngles.push(i * 2 * Math.PI / spokeCount);
            }
        } else {
            spokeCount = spokes.length;
            spokeAngles = spokes.map(a => radians(a));
        }

        // We append the first angle + 2pi to the end to handle the loop wrap-around
        spokeAngles.push(spokeAngles[0] + 2 * Math.PI);

        if (mountRadius <= mountHole / 2) {
            const adjFactor = (rOuter - mountHole / 2) / 5;
            if (adjFactor < 0.1) {
                collision = true;
            } else {
                mountRadius = mountHole / 2 + adjFactor;
                messages.push(`Mount support too small. Auto increased to ${mountRadius / unitFactor * 2}${unitLabel}.`);
            }
        }

        for (let i = 0; i < spokeCount; i++) {
            const angle = spokeAngles[i + 1] - spokeAngles[i];
            if (spokeWidth >= angle * mountRadius) {
                const adjFactor = 1.2;
                mountRadius += adjFactor;
                messages.push(`Too many spokes. Increased Mount support by ${(adjFactor / unitFactor).toFixed(3)}${unitLabel}`);
            }
        }

        if (rOuter <= mountRadius) {
            collision = true;
        }

        if (collision) {
            messages.push("Not enough room for Spokes. Decrease Spoke width.");
        } else {
            for (let i = 0; i < spokeCount; i++) {
                this.boxes.ctx.save();
                const startA = spokeAngles[i];
                const endA = spokeAngles[i + 1];

                // inner circle around mount
                let asinFactor = spokeWidth / mountRadius / 2;
                asinFactor = Math.max(-1.0, Math.min(1.0, asinFactor));
                const a = Math.asin(asinFactor);

                // outer circle
                let asinFactor2 = spokeWidth / rOuter / 2;
                asinFactor2 = Math.max(-1.0, Math.min(1.0, asinFactor2));
                const a2 = Math.asin(asinFactor2);

                const p1 = pointOnCircle(mountRadius, startA + a);
                const p2 = pointOnCircle(rOuter, startA + a2);
                const diff = vdiff(p1, p2);
                const l = vlength(diff);

                this.boxes.moveTo(...p1);

                this.boxes.polyline(
                    l,
                    90 + degrees(a2), 0,
                    [degrees(endA - startA - 2 * a2), rOuter], 0,
                    90 + degrees(a2),
                    l,
                    90 - degrees(a), 0,
                    [-degrees(endA - startA - 2 * a), mountRadius], 0,
                    90 + degrees(a2), 0 // this last 0 is weird in my logic but follows python args structure?
                );
                // The last part in python:
                // 0, 90+degrees(a2), 0
                // This seems to be: length 0, turn 90+deg(a2), length 0.

                this.boxes.ctx.restore();
            }
        }
        return messages;
    }

    /**
     * Draw the gear or rack based on parsed options.
     * @param {Object} [options={}] - Override options.
     * @param {string} [move=""] - Move commands.
     */
    draw(options = {}, move = "") {
        this.parseArgs(options);
        
        // Handle rack drawing
        if (this.options.draw_rack || this.options.drawrack) {
            this.drawRack();
        }
    }

    /**
     * Draw a gear rack based on current options.
     */
    drawRack() {
        const pitch = this.calcCircularPitch();
        const addendum = pitch / Math.PI;
        const toothCount = this.options.rack_teeth_length || this.options.teeth_length || 12;
        const baseHeight = this.options.rack_base_height !== undefined ? this.options.rack_base_height : (this.options.base_height || 8);
        const tabLength = this.options.rack_base_tab !== undefined ? this.options.rack_base_tab : (this.options.base_tab || 0);
        const pressureAngle = this.options.angle || 20.0;
        const clearance = this.options.clearance || 0;

        // Generate rack points - returns { points: [[x,y], ...], guidePoints }
        const result = generateRackPoints(
            toothCount, pitch, addendum, pressureAngle,
            baseHeight, tabLength, clearance
        );

        const points = result.points;
        if (!points || points.length < 2) return;

        // Draw the rack path - points are [x, y] arrays
        this.boxes.ctx.move_to(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            this.boxes.ctx.line_to(points[i][0], points[i][1]);
        }
    }
}

export { Gears };
