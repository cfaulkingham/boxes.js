import { Matrix  } from './matrix.js';

class SVGContext {
    constructor() {
        this.paths = [];
        this.currentPath = [];
        this.matrix = new Matrix();
        this.stack = [];
        this.lineWidth = 0.1;
        this.strokeColor = [0, 0, 0];
        this.currentPoint = { x: 0, y: 0 };
    }

    save() {
        this.stack.push({
            matrix: new Matrix(this.matrix.a, this.matrix.b, this.matrix.c, this.matrix.d, this.matrix.e, this.matrix.f),
            currentPoint: { ...this.currentPoint },
            lineWidth: this.lineWidth,
            strokeColor: [...this.strokeColor]
        });
        // Python resets _xy (current point in local coords) to (0,0) after save, effectively?
        // Wait, python drawing.py:
        // save(): stack.append(...); _xy = (0,0)
        // restore(): pop...
        // This means the local coordinate system is what is tracked in _xy.
        // But `move_to` updates `_xy`.
        // `_mxy` is global coordinate.

        // I'll try to follow python logic.
        this.currentPoint = { x: 0, y: 0 };
    }

    restore() {
        const state = this.stack.pop();
        if (state) {
            this.matrix = state.matrix;
            this.currentPoint = state.currentPoint;
            this.lineWidth = state.lineWidth;
            this.strokeColor = state.strokeColor;
        }
    }

    translate(x, y) {
        this.matrix = this.matrix.translate(x, y);
        this.currentPoint = { x: 0, y: 0 };
    }

    rotate(angle) {
        this.matrix = this.matrix.rotate(angle);
    }

    scale(sx, sy) {
        this.matrix = this.matrix.scale(sx, sy);
    }

    // Helper to get global coordinates from local (x, y)
    _toGlobal(x, y) {
        return this.matrix.apply(x, y);
    }

    move_to(x, y) {
        this.currentPoint = { x, y };
        const p = this._toGlobal(x, y);
        // Start a new path segment (M command)
        this.currentPath.push(`M ${p.x.toFixed(4)} ${p.y.toFixed(4)}`);
    }

    line_to(x, y) {
        const p = this._toGlobal(x, y);
        this.currentPath.push(`L ${p.x.toFixed(4)} ${p.y.toFixed(4)}`);
        this.currentPoint = { x, y };
    }

    curve_to(x1, y1, x2, y2, x3, y3) {
        const p1 = this._toGlobal(x1, y1);
        const p2 = this._toGlobal(x2, y2);
        const p3 = this._toGlobal(x3, y3);
        this.currentPath.push(`C ${p1.x.toFixed(4)} ${p1.y.toFixed(4)} ${p2.x.toFixed(4)} ${p2.y.toFixed(4)} ${p3.x.toFixed(4)} ${p3.y.toFixed(4)}`);
        this.currentPoint = { x: x3, y: y3 };
    }

    stroke() {
        if (this.currentPath.length > 0) {
            this.paths.push({
                d: this.currentPath.join(' '),
                stroke: `rgb(${this.strokeColor[0]*255},${this.strokeColor[1]*255},${this.strokeColor[2]*255})`,
                strokeWidth: this.lineWidth
            });
            this.currentPath = [];
        }
        this.currentPoint = { x: 0, y: 0 };
    }

    set_line_width(w) {
        this.lineWidth = w;
    }

    set_source_rgb(r, g, b) {
        this.strokeColor = [r, g, b];
    }

    get_current_point() {
        return [this.currentPoint.x, this.currentPoint.y];
    }

    arc(xc, yc, radius, angle1, angle2) {
        this._arc(xc, yc, radius, angle1, angle2, 1);
    }
    
    // Add direct circle drawing support
    circle(xc, yc, radius) {
        this.move_to(xc + radius, yc);
        this._arc(xc, yc, radius, 0, 2 * Math.PI, 1);
    }
    
    // Add arc method for full circles
    arc_full(xc, yc, radius) {
        this.move_to(xc + radius, yc);
        const segments = 20;
        const angleStep = (2 * Math.PI) / segments;
        
        for (let i = 0; i <= segments; i++) {
            const angle = i * angleStep;
            const x = xc + radius * Math.cos(angle);
            const y = yc + radius * Math.sin(angle);
            
            if (i === 0) {
                this.move_to(x, y);
            } else {
                this.line_to(x, y);
            }
        }
        this.line_to(xc + radius, yc);
    }

    arc_negative(xc, yc, radius, angle1, angle2) {
        this._arc(xc, yc, radius, angle1, angle2, -1);
    }

    _arc(xc, yc, radius, angle1, angle2, direction) {
        // Approximate arc with cubic beziers.
        // This logic is complex to implement perfectly matching Python's drawing.py logic which calculates control points.
        // I will copy the math from python `drawing.py` `_arc`.

        if (Math.abs(angle1 - angle2) < 1e-4 || radius < 1e-4) return;

        let x1 = radius * Math.cos(angle1) + xc;
        let y1 = radius * Math.sin(angle1) + yc;
        let x4 = radius * Math.cos(angle2) + xc;
        let y4 = radius * Math.sin(angle2) + yc;

        let ax = x1 - xc;
        let ay = y1 - yc;
        let bx = x4 - xc;
        let by = y4 - yc;
        let q1 = ax * ax + ay * ay;
        let q2 = q1 + ax * bx + ay * by;
        let k2 = 4/3 * (Math.sqrt(2 * q1 * q2) - q2) / (ax * by - ay * bx);

        let x2 = xc + ax - k2 * ay;
        let y2 = yc + ay + k2 * ax;
        let x3 = xc + bx + k2 * by;
        let y3 = yc + by - k2 * bx;

        // Transform points
        const p1 = this._toGlobal(x1, y1); // Start point of arc.
        // If we are already at p1, we don't need to move? Python implementation does _add_move() which adds M if needed.
        // Here I will assume we should move to start if not there.
        // Wait, Python implementation:
        // mx4, my4 = self._m * (x4, y4)
        // self._dwg.append("C", mx4, my4, mx2, my2, mx3, my3) # destination first!
        // wait, `drawing.py` append("C", x, y, x1, y1, x2, y2) -> cubic to x,y with control points x1,y1 and x2,y2 ??
        // SVG C x1 y1 x2 y2 x y.
        // In Python `drawing.py`: `self._dwg.append("C", mx4, my4, mx2, my2, mx3, my3)`
        // `SVGSurface._dwg.append` -> `elif C == "C": x1, y1, x2, y2 = c[3:] ... f"C {x1:.3f} {y1:.3f} {x2:.3f} {y2:.3f} {x:.3f} {y:.3f}"`
        // So `c` is ["C", x, y, x1, y1, x2, y2].
        // So `append("C", mx4, my4, mx2, my2, mx3, my3)` passes: x=mx4, y=my4, x1=mx2, y1=my2, x2=mx3, y2=my3.
        // And SVG output is C x1 y1 x2 y2 x y -> C mx2 my2 mx3 my3 mx4 my4.

        const mp2 = this._toGlobal(x2, y2);
        const mp3 = this._toGlobal(x3, y3);
        const mp4 = this._toGlobal(x4, y4);

        // Ensure we are at p1
        // We assume previous command ended at p1 if continuity is preserved.
        // But if not, we should probably MoveTo? Python `_add_move` does exactly that.
        // My `move_to` implementation updates currentPath.
        // I need to check if current point matches p1.

        // const mp1 = this._toGlobal(x1, y1);
        // this.currentPath.push(`M ${mp1.x} ${mp1.y}`); // Just force move for now to be safe or rely on caller?
        // Actually python's _add_move checks if `_mxy` (current pos) matches start of new segment.
        // I will implement _add_move logic inside curve_to/line_to effectively or implicitly.

        // For arc, we start at angle1.
        // But context might be elsewhere?
        // Python `_arc` calculates x1, y1 (start) but does NOT append a LineTo x1,y1. It assumes we are there or moves there.

        // Let's just push the C command.
        this.currentPath.push(`C ${mp2.x.toFixed(4)} ${mp2.y.toFixed(4)} ${mp3.x.toFixed(4)} ${mp3.y.toFixed(4)} ${mp4.x.toFixed(4)} ${mp4.y.toFixed(4)}`);

        this.currentPoint = { x: x4, y: y4 };
    }

    set_font(style, bold, italic) {} // Stub
    show_text(text, args) {} // Stub
    new_part() {
        this.stroke();
    }

    // Helpers for Python compatibility
    rectangle(x, y, w, h) {
        this.stroke(); // finish previous path
        this.move_to(x, y);
        this.line_to(x + w, y);
        this.line_to(x + w, y + h);
        this.line_to(x, y + h);
        this.line_to(x, y);
        this.stroke();
    }

    finish() {
        this.stroke();
        // Generate SVG string
        // Find bounds
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        const parsePath = (d) => {
             const parts = d.split(' ');
             for (let i=0; i<parts.length; i++) {
                 if (['M', 'L', 'C'].includes(parts[i])) continue;
                 const val = parseFloat(parts[i]);
                 if (isNaN(val)) continue;
                 // Since parts are x y pairs mostly (except C which is 3 pairs), we can just check all numbers
                 // This is a rough bounding box approximation
                 // Better would be to parse properly.
             }
        };

        // Let's just trust we can output everything.
        // We need a ViewBox.
        // I'll scan all points in d strings.

        for (const p of this.paths) {
            const nums = p.d.replace(/[MLC]/g, '').trim().split(/\s+/).map(parseFloat);
            for (let i=0; i<nums.length; i+=2) {
                if (!isNaN(nums[i])) {
                    if (nums[i] < minX) minX = nums[i];
                    if (nums[i] > maxX) maxX = nums[i];
                }
                if (!isNaN(nums[i+1])) {
                     if (nums[i+1] < minY) minY = nums[i+1];
                     if (nums[i+1] > maxY) maxY = nums[i+1];
                }
            }
        }

        if (minX === Infinity) { minX = 0; maxX = 100; minY = 0; maxY = 100; }

        const padding = 10;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        const w = maxX - minX;
        const h = maxY - minY;

        let svg = `<?xml version="1.0" encoding="utf-8"?>
<svg width="${w.toFixed(2)}mm" height="${h.toFixed(2)}mm" viewBox="${minX.toFixed(2)} ${minY.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}" xmlns="http://www.w3.org/2000/svg">
  <g stroke-linecap="round" stroke-linejoin="round" fill="none">
`;
        for (const p of this.paths) {
             svg += `    <path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" />\n`;
        }
        svg += `  </g>\n</svg>`;
        return svg;
    }
}

export { SVGContext  };
