class Parts {
    constructor(boxes) {
        this.boxes = boxes;
    }

    disc(diameter, hole = 0, dwidth = 1.0, callback = null, move = "", label = "") {
        const size = diameter;
        const r = diameter / 2.0;

        if (this.boxes.move(size * dwidth, size, move, true, label)) {
            return;
        }

        this.boxes.moveTo(size / 2, size / 2);

        if (hole) {
            this.boxes.hole(0, 0, hole / 2);
        }

        if (callback && typeof callback === 'function') {
            this.boxes.cc(callback, 0, 0, 0);
        }
        if (dwidth === 1.0) {
            this.boxes.moveTo(r + this.boxes.burn, 0, 90);
            this.boxes.corner(360, r, 6);
        } else {
            const w = (2.0 * dwidth - 1) * r;
            const a = Math.acos(w / r) * 180 / Math.PI;
            this.boxes.moveTo(0, 0, -a);
            this.boxes.moveTo(r, 0, -90);
            this.boxes.corner(-360 + 2 * a, r);
            this.boxes.corner(-a);
            this.boxes.edge(2 * r * Math.sin(a * Math.PI / 180));
        }
        this.boxes.move(size * dwidth, size, move, label);
    }

    wavyKnob(diameter, n = 20, angle = 45, hole = 0, callback = null, move = "") {
        if (n < 2) {
            return;
        }

        const size = diameter + Math.PI * diameter / n;

        if (this.boxes.move(size, size, move, true)) {
            return;
        }

        this.boxes.moveTo(size / 2, size / 2);
        if (callback && typeof callback === 'function') {
            this.boxes.cc(callback, 0, 0, 0);
        }

        if (hole) {
            this.boxes.hole(0, 0, hole / 2);
        }

        this.boxes.moveTo(diameter / 2, 0, 90 - angle);
        
        // Helper function for arc on circle
        const arcOnCircle = (spanningAngle, outgoingAngle, r = 1.0) => {
            const angle = spanningAngle + 2 * outgoingAngle;
            const radius = r * Math.sin(spanningAngle * Math.PI / 360) / Math.sin((180 - outgoingAngle - 0.5 * spanningAngle) * Math.PI / 180);
            return [angle, Math.abs(radius)];
        };

        const [a, r] = arcOnCircle(360 / n / 2, angle, diameter / 2);
        const [a2, r2] = arcOnCircle(360 / n / 2, -angle, diameter / 2);

        for (let i = 0; i < n; i++) {
            const tabs = (i % Math.max(1, Math.floor((n + 1) / 6)) === 0);
            this.boxes.corner(a, r, tabs);
            this.boxes.corner(a2, r2);
        }

        this.boxes.move(size, size, move);
    }

    concaveKnob(diameter, n = 3, rounded = 0.2, angle = 70, hole = 0, callback = null, move = "") {
        if (n < 2) {
            return;
        }

        const size = diameter;

        if (this.boxes.move(size, size, move, true)) {
            return;
        }

        this.boxes.moveTo(size / 2, size / 2);

        if (hole) {
            this.boxes.hole(0, 0, hole / 2);
        }

        if (callback && typeof callback === 'function') {
            this.boxes.cc(callback, 0, 0, 0);
        }
        this.boxes.moveTo(diameter / 2, 0, 90 + angle);
        
        // Helper function for arc on circle
        const arcOnCircle = (spanningAngle, outgoingAngle, r = 1.0) => {
            const angle = spanningAngle + 2 * outgoingAngle;
            const radius = r * Math.sin(spanningAngle * Math.PI / 360) / Math.sin((180 - outgoingAngle - 0.5 * spanningAngle) * Math.PI / 180);
            return [angle, Math.abs(radius)];
        };

        let [a, r] = arcOnCircle(360 / n * (1 - rounded), -angle, diameter / 2);

        if (Math.abs(a) < 0.01) {  // avoid trying to make a straight line as an arc
            [a, r] = arcOnCircle(360 / n * (1 - rounded), -angle - 0.01, diameter / 2);
        }

        for (let i = 0; i < n; i++) {
            const tabs = (i % Math.max(1, Math.floor((n + 1) / 6)) === 0);
            this.boxes.corner(a, r);
            this.boxes.corner(angle);
            this.boxes.corner(360 / n * rounded, diameter / 2, tabs);
            this.boxes.corner(angle);
        }

        this.boxes.move(size, size, move);
    }

    roundKnob(diameter, n = 20, callback = null, move = "") {
        const size = diameter + diameter / n;
        
        if (this.boxes.move(size, size, move, true)) {
            return;
        }

        this.boxes.moveTo(size / 2, size / 2);
        this.boxes.cc(callback, null, 0, 0);
        this.boxes.move(size, size, move);
    }

    ringSegment(r_outside, r_inside, angle, n = 1, move = "") {
        const space = 360 * this.boxes.spacing / r_inside / 2 / Math.PI;
        let nc = Math.min(n, Math.floor(360 / (angle + space)));

        while (n > 0) {
            if (this.boxes.move(2 * r_outside, 2 * r_outside, move, true)) {
                return;
            }

            this.boxes.moveTo(0, r_outside, -90);
            for (let i = 0; i < nc; i++) {
                this.boxes.polyline(
                    0, [angle, r_outside], 0, 90, [r_outside - r_inside, 2],
                    90, 0, [-angle, r_inside], 0, 90, [r_outside - r_inside, 2],
                    90
                );
                const [x, y] = this.circlePoint(r_outside, (angle + space) * Math.PI / 180);
                this.boxes.moveTo(y, r_outside - x, (angle + space) * 180 / Math.PI);
                n--;
                if (n === 0) {
                    break;
                }
            }
            this.boxes.move(2 * r_outside, 2 * r_outside, move);
        }
    }

    // Helper function for calculating circle point
    circlePoint(radius, angle) {
        return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }
}

export { Parts };
