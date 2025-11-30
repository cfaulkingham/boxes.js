const { vdiff, vlength } = require('./vectors');

// Helper math functions
function linspace(a, b, n) {
    if (n < 2) return n === 1 ? [a] : [];
    const step = (b - a) / (n - 1);
    const result = [];
    for (let i = 0; i < n; i++) {
        result.push(a + i * step);
    }
    return result;
}

function involuteIntersectAngle(Rb, R) {
    return (Math.sqrt(Math.pow(R, 2) - Math.pow(Rb, 2)) / Rb) - Math.acos(Rb / R);
}

function pointOnCircle(radius, angle) {
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
}

function radians(deg) {
    return deg * Math.PI / 180;
}

function degrees(rad) {
    return rad * 180 / Math.PI;
}

// Undercut support functions
function undercutMinTeeth(pitchAngle, k = 1.0) {
    const x = Math.max(Math.sin(radians(pitchAngle)), 0.01);
    return 2 * k / (x * x);
}

function undercutMaxK(teeth, pitchAngle = 20.0) {
    const x = Math.max(Math.sin(radians(pitchAngle)), 0.01);
    return 0.5 * teeth * x * x;
}

function undercutMinAngle(teeth, k = 1.0) {
    return degrees(Math.asin(Math.min(0.856, Math.sqrt(2.0 * k / teeth))));
}

function haveUndercut(teeth, pitchAngle = 20.0, k = 1.0) {
    return teeth < undercutMinTeeth(pitchAngle, k);
}

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

class Gears {
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

    parseArgs(args) {
        this.options = { ...this.defaults, ...args };
    }

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
            const angle = spokeAngles[i+1] - spokeAngles[i]; // Actually it should be next - current, but Python uses i and i-1? 
            // Python: angle = spokes[i]-spokes[i-1]. But spokes was recreated as a list of angles.
            // Python code:
            // spokes = [i*2*pi/spokes for i in range(spoke_count)]
            // ...
            // spokes.append(spokes[0]+two_pi)
            // for i in range(spoke_count):
            //    angle = spokes[i]-spokes[i-1] 
            // wait, if i=0, i-1 is -1 (last element)? 
            // Python lists support negative indexing. So yes, it's the angle between current spoke and previous spoke.
            // But if we generated uniform spokes, the angle is constant 2pi/N.
            
            // Let's implement as Python:
            // We need the full list including the appended one?
            // If i ranges 0 to spoke_count-1. 
            // i=0: spokes[0] - spokes[-1]. But spokes[-1] is spokes[0]+2pi. So result is -2pi.
            // That seems wrong for "angle". Maybe Python loop variable `i` starts differently?
            // "for i in range(spoke_count):" -> 0, 1, ... count-1.
            
            // Let's look closer at Python:
            // for i in range(spoke_count):
            //    angle = spokes[i]-spokes[i-1]
            //    if spoke_width >= angle * mount_radius: ...
            
            // If spokes are uniform: 0, 120, 240, 360.
            // i=0: 0 - 360 = -360. 
            // i=1: 120 - 0 = 120.
            // i=2: 240 - 120 = 120.
            
            // If angle is negative, the check `spoke_width >= angle * mount_radius` might behave unexpectedly if angle is supposed to be positive width?
            // But angle is used to check if there is room for the spoke width.
            // If angle is -360, it's definitely less than spoke_width (assuming positive). 
            // So it would trigger "Too many spokes".
            // This suggests the Python code might rely on specific behavior or I am misinterpreting `spokes[i-1]`.
            // In Python `l[i-1]` when i=0 is the last element.
            
            // If the loop is checking the sector size *between* spokes.
            // It uses `spokes[i]` and `spokes[i-1]`.
            // For drawing later: `start_a, end_a = spokes[i], spokes[i+1]`
            
            // Let's assume for collision check, we want the sector angle.
            // For uniform spokes, it is 2pi/N.
            
            // Let's stick to what Python does, effectively.
            // But we need to handle negative indexing in JS manually.
        }

        // Re-evaluating Python loop:
        // for i in range(spoke_count):
        //    angle = spokes[i]-spokes[i-1]
        // This calculates angle from PREVIOUS spoke to CURRENT spoke.
        // For i=0, it is spokes[0] - spokes[last].
        // If spokes = [0, 120, 240, 360].
        // i=0: 0 - 360 = -360.
        // i=1: 120 - 0 = 120.
        // i=2: 240 - 120 = 120.
        
        // If angle is negative, `angle * mount_radius` is negative. `spoke_width` (positive) >= negative number is true.
        // So `collision` logic in Python seems to trigger for the first spoke if it wraps around?
        // Wait, `spoke_width >= ...` -> `adj_factor = 1.2 ...`
        // If `angle` is negative, this check is true.
        // This looks like a bug in the Python code or I'm misunderstanding something fundamental.
        // Or maybe `spokes` are not sorted? No, they are generated.
        
        // Let's look at `generate_spokes` in `gears.py` again.
        /*
        try:
            spoke_count = spokes
            spokes = [i*2*pi/spokes for i in range(spoke_count)]
        except TypeError:
            spoke_count = len(spokes)
            spokes = [radians(a) for a in spokes]
        spokes.append(spokes[0]+two_pi)

        ...

        for i in range(spoke_count):
            angle = spokes[i]-spokes[i-1]

            if spoke_width >= angle * mount_radius:
                ...
        */
        
        // If I replicate this exactly in JS:
        // JS array `spokes` = [0, 2.09, 4.18, 6.28] (for 3 spokes).
        // i=0. spokes[0]=0. spokes[-1] (last element) = 6.28.
        // angle = -6.28.
        // 5 >= -6.28 * 7.5 (-47). True.
        // So it increases mount_radius.
        // This seems to be a bug in the original code, but maybe `angle` should be `abs`? Or `2pi + ...`?
        // Or maybe it is intended to check something else?
        
        // However, I should probably try to make it work reasonably.
        // The drawing loop uses `spokes[i]` and `spokes[i+1]`.
        // That defines the sector for the spoke.
        
        // Let's ignore the collision logic weirdness for i=0 for a moment and focus on the drawing part which is more important for visual correctness.
        // I'll implement the loop for drawing.
        
        // Also the collision check logic modifies `mount_radius`. I should respect that if possible.
        // But if it is buggy for i=0, it will ALWAYS increase mount_radius once?
        // Unless `spoke_width` is very negative? No.
        
        // Let's assume the Python code meant `spokes[i+1] - spokes[i]` which is the sector size.
        // Or `spokes[i] - spokes[i-1]` but considering modulo 2pi.
        
        // I will implement the check using `spokeAngles[i+1] - spokeAngles[i]`, which is the sector following the spoke `i`.
        
        for (let i = 0; i < spokeCount; i++) {
             const angle = spokeAngles[i+1] - spokeAngles[i];
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
                 const endA = spokeAngles[i+1];
                 
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
                 // We need to rotate context to align with the spoke? 
                 // Python: self.boxes.moveTo(*point_on_circle(...), degrees=degrees(start_a))
                 // This implies `moveTo` handles rotation if provided?
                 // In `boxes.js` or `Gears` helper?
                 // The Python code calls `self.boxes.moveTo`.
                 // In JS `Boxes` class usually has `moveTo(x, y)`.
                 // If there is an angle argument, it might rotate the context?
                 // Checking `boxes.js` might be useful, but let's assume I need to handle rotation manually if `moveTo` doesn't.
                 
                 // Python's `moveTo` in `Boxes.py`: `def moveTo(self, x, y, angle=None): ...`
                 // It moves to x,y and rotates by angle.
                 
                 // In JS `Boxes` class (I should check `boxes/boxes.js` later), `moveTo` probably exists.
                 // Let's assume it supports angle.
                 
                 // In Python:
                 /*
                 self.boxes.polyline(
                    l,
                    +90+degrees(a2), 0,
                    (degrees(end_a-start_a-2*a2), r_outer), 0,
                    +90+degrees(a2),
                    l, 90-degrees(a), 0,
                    (-degrees(end_a-start_a-2*a), mount_radius),
                    0, 90+degrees(a2), 0
                )
                 */
                 // `polyline` in Boxes usually takes a sequence of (length, turn_angle) or similar.
                 // The python signature allows mixing turns and corners.
                 
                 // The JS `Boxes` class likely has `polyline`. I need to check its signature.
                 // But assuming it matches python logic:
                 // l -> length
                 // +90+degrees(a2) -> turn
                 // 0 -> corner radius?
                 // (degrees(...), r_outer) -> This looks like an arc? (angle, radius)
                 
                 // I will verify `boxes/boxes.js` later to be sure about `polyline` API.
                 // For now I will write the code assuming it works similarly or I will need to adjust.
             }
        }
        return messages;
    }

    // Since I need to verify Boxes.polyline and Boxes.moveTo, I'll interrupt writing here to check.
    // I'll leave the class incomplete for a moment.
}

