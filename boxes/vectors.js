/**
 * Normalize a vector to unit length.
 * @param {number[]} v - The vector [x, y].
 * @returns {number[]} Normalized vector.
 */
function normalize(v) {
    const l = Math.sqrt(v[0] ** 2 + v[1] ** 2);
    if (l === 0.0) {
        return [0.0, 0.0];
    }
    return [v[0] / l, v[1] / l];
}

/**
 * Calculate the length of a vector.
 * @param {number[]} v - The vector [x, y].
 * @returns {number} The length (magnitude).
 */
function vlength(v) {
    return Math.sqrt(v[0] ** 2 + v[1] ** 2);
}

/**
 * Clip a vector to a maximum length.
 * @param {number[]} v - The vector [x, y].
 * @param {number} length - The maximum length.
 * @returns {number[]} The vector scaled to max length if it exceeded it, otherwise original vector.
 */
function vclip(v, length) {
    const l = vlength(v);
    if (l > length) {
        return vscalmul(v, length / l);
    }
    return v;
}

/**
 * Calculate the difference between two vectors (p2 - p1).
 * @param {number[]} p1 - The starting point [x, y].
 * @param {number[]} p2 - The ending point [x, y].
 * @returns {number[]} The difference vector.
 */
function vdiff(p1, p2) {
    return [p2[0] - p1[0], p2[1] - p1[1]];
}

/**
 * Add two vectors.
 * @param {number[]} v1 - First vector.
 * @param {number[]} v2 - Second vector.
 * @returns {number[]} The sum vector.
 */
function vadd(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1]];
}

/**
 * Calculate a vector orthogonal to the input (rotated 90 degrees).
 * @param {number[]} v - Input vector.
 * @returns {number[]} Orthogonal vector [-y, x].
 */
function vorthogonal(v) {
    return [-v[1], v[0]];
}

/**
 * Multiply a vector by a scalar.
 * @param {number[]} v - Input vector.
 * @param {number} a - Scalar value.
 * @returns {number[]} Scaled vector.
 */
function vscalmul(v, a) {
    return [a * v[0], a * v[1]];
}

/**
 * Calculate the dot product of two vectors.
 * @param {number[]} v1 - First vector.
 * @param {number[]} v2 - Second vector.
 * @returns {number} Dot product.
 */
function dotproduct(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1];
}

/**
 * Calculate a point on a circle given radius and angle.
 * @param {number} r - Radius.
 * @param {number} a - Angle in radians.
 * @returns {number[]} The point [x, y].
 */
function circlepoint(r, a) {
    return [r * Math.cos(a), r * Math.sin(a)];
}

/**
 * Calculate tangent points/length for a circle and a point.
 * @param {number} x - X coordinate of point.
 * @param {number} y - Y coordinate of point.
 * @param {number} r - Radius of circle at origin.
 * @returns {number[]} [angle, length] for the tangent.
 */
function tangent(x, y, r) {
    const l1 = vlength([x, y]);
    const a1 = Math.atan2(y, x);
    const a2 = Math.asin(r / l1);
    const l2 = Math.cos(a2) * l1;
    return [a1 + a2, l2];
}

/**
 * Generate a kerf-compensated path from a set of points.
 * Offsets the path by `k` (kerf width / 2 usually, or related factor).
 * @param {number[][]} points - List of points forming the path.
 * @param {number} k - Offset distance (kerf).
 * @param {boolean} [closed=true] - Whether the path is closed.
 * @returns {number[][]} New list of points with offset applied.
 */
function kerf(points, k, closed = true) {
    const result = [];
    const lp = points.length;

    for (let i = 0; i < points.length; i++) {
        let v1, v2;
        if (i === 0) {
            v1 = vorthogonal(normalize(vdiff(points[lp - 1], points[i])));
        } else {
            v1 = vorthogonal(normalize(vdiff(points[i - 1], points[i])));
        }

        if (i === lp - 1) {
            v2 = vorthogonal(normalize(vdiff(points[i], points[0])));
        } else {
            v2 = vorthogonal(normalize(vdiff(points[i], points[i + 1])));
        }

        if (!closed) {
            if (i === 0) v1 = v2;
            if (i === lp - 1) v2 = v1;
        }

        const d = normalize(vadd(v1, v2));
        const cos_alpha = dotproduct(v1, d);

        const scale = -k / cos_alpha;
        const scaled_d = vscalmul(d, scale);

        result.push(vadd(points[i], scaled_d));
    }

    return result;
}

/**
 * Create a simple 2x3 rotation matrix for 2D.
 * @param {number} angle - Angle in radians.
 * @returns {number[][]} 2x3 Matrix.
 */
function rotm(angle) {
    /** Rotation matrix */
    return [[Math.cos(angle), -Math.sin(angle), 0],
    [Math.sin(angle), Math.cos(angle), 0]];
}

/**
 * Transform a 2D vector by a 2x3 matrix.
 * @param {number[]} v - Vector [x, y].
 * @param {number[][]} m - Matrix.
 * @returns {number[]} Transformed vector [x, y].
 */
function vtransl(v, m) {
    /** Transform vector v by matrix m */
    const m0 = m[0];
    const m1 = m[1];
    return [m0[0] * v[0] + m0[1] * v[1] + m0[2],
    m1[0] * v[0] + m1[1] * v[1] + m1[2]];
}

/**
 * Multiply two matrices (limited 2x3 logic?).
 * Actually seems to be a specific 3x2 or similar multiplication helper.
 * The implementation iterates 3x2x3 which suggests full 3x3 or mixed.
 * @param {number[][]} m0 - First matrix.
 * @param {number[][]} m1 - Second matrix.
 * @returns {number[][]} Result matrix.
 */
function mmul(m0, m1) {
    /** Matrix multiplication */
    const result = [[0, 0, 0], [0, 0, 0]];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
            for (let k = 0; k < 3; k++) {
                result[j][i] += m0[k][i] * m1[j][k];
            }
        }
    }
    return result;
}

export {
    normalize, vlength, vclip, vdiff, vadd, vorthogonal, vscalmul, dotproduct, circlepoint, tangent, kerf, rotm, vtransl, mmul
};
