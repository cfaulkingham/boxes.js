/**
 * Class representing a 2D affine transformation matrix.
 * Used for geometric transformations like translation, rotation, and scaling.
 */
class Matrix {
    /**
     * Create a new Matrix.
     * Represents the matrix:
     * | a c e |
     * | b d f |
     * | 0 0 1 |
     *
     * @param {number} [a=1] - Scale X.
     * @param {number} [b=0] - Skew Y.
     * @param {number} [c=0] - Skew X.
     * @param {number} [d=1] - Scale Y.
     * @param {number} [e=0] - Translate X.
     * @param {number} [f=0] - Translate Y.
     */
    constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
        /** @type {number} Scale X */
        this.a = a;
        /** @type {number} Skew Y */
        this.b = b;
        /** @type {number} Skew X */
        this.c = c;
        /** @type {number} Scale Y */
        this.d = d;
        /** @type {number} Translate X */
        this.e = e;
        /** @type {number} Translate Y */
        this.f = f;
    }

    /**
     * Multiply this matrix by another matrix.
     * Returns a new Matrix representing the combined transformation.
     * @param {Matrix} m - The matrix to multiply with.
     * @returns {Matrix} The result of the multiplication.
     */
    multiply(m) {
        return new Matrix(
            this.a * m.a + this.c * m.b,
            this.b * m.a + this.d * m.b,
            this.a * m.c + this.c * m.d,
            this.b * m.c + this.d * m.d,
            this.a * m.e + this.c * m.f + this.e,
            this.b * m.e + this.d * m.f + this.f
        );
    }

    /**
     * Apply a translation.
     * @param {number} x - Translation along X axis.
     * @param {number} y - Translation along Y axis.
     * @returns {Matrix} The new transformed matrix.
     */
    translate(x, y) {
        return this.multiply(new Matrix(1, 0, 0, 1, x, y));
    }

    /**
     * Apply a rotation.
     * @param {number} radians - Angle in radians.
     * @returns {Matrix} The new transformed matrix.
     */
    rotate(radians) {
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        return this.multiply(new Matrix(c, s, -s, c, 0, 0));
    }

    /**
     * Apply scaling.
     * @param {number} sx - Scale factor for X.
     * @param {number} sy - Scale factor for Y.
     * @returns {Matrix} The new transformed matrix.
     */
    scale(sx, sy) {
        return this.multiply(new Matrix(sx, 0, 0, sy, 0, 0));
    }

    /**
     * Apply the transformation to a point.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @returns {{x: number, y: number}} The transformed point.
     */
    apply(x, y) {
        return {
            x: this.a * x + this.c * y + this.e,
            y: this.b * x + this.d * y + this.f
        };
    }
}

export { Matrix };
