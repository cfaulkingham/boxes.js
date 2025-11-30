class Matrix {
    constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
    }

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

    translate(x, y) {
        return this.multiply(new Matrix(1, 0, 0, 1, x, y));
    }

    rotate(radians) {
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        return this.multiply(new Matrix(c, s, -s, c, 0, 0));
    }

    scale(sx, sy) {
        return this.multiply(new Matrix(sx, 0, 0, sy, 0, 0));
    }

    apply(x, y) {
        return {
            x: this.a * x + this.c * y + this.e,
            y: this.b * x + this.d * y + this.f
        };
    }
}

export { Matrix  };
