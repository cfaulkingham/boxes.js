function normalize(v) {
    const l = Math.sqrt(v[0] ** 2 + v[1] ** 2);
    if (l === 0.0) {
        return [0.0, 0.0];
    }
    return [v[0] / l, v[1] / l];
}

function vlength(v) {
    return Math.sqrt(v[0] ** 2 + v[1] ** 2);
}

function vclip(v, length) {
    const l = vlength(v);
    if (l > length) {
        return vscalmul(v, length / l);
    }
    return v;
}

function vdiff(p1, p2) {
    return [p2[0] - p1[0], p2[1] - p1[1]];
}

function vadd(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1]];
}

function vorthogonal(v) {
    return [-v[1], v[0]];
}

function vscalmul(v, a) {
    return [a * v[0], a * v[1]];
}

function dotproduct(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1];
}

function circlepoint(r, a) {
    return [r * Math.cos(a), r * Math.sin(a)];
}

function tangent(x, y, r) {
    const l1 = vlength([x, y]);
    const a1 = Math.atan2(y, x);
    const a2 = Math.asin(r / l1);
    const l2 = Math.cos(a2) * l1;
    return [a1 + a2, l2];
}

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

module.exports = {
    normalize, vlength, vclip, vdiff, vadd, vorthogonal, vscalmul, dotproduct, circlepoint, tangent, kerf
};
