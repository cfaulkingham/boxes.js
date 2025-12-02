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
        
        // Add debug logging
        this.debug = true;
        this.debugLog = [];
    }
    
    _log(message, data = null) {
        if (this.debug) {
            const entry = { message, data, timestamp: Date.now() };
            this.debugLog.push(entry);
            console.log(`SVGContext: ${message}`, data || '');
        }
    }

    save() {
        this._log('save() called', {
            currentPoint: this.currentPoint,
            matrix: this.matrix,
            stackSize: this.stack.length
        });
        
        this.stack.push({
            matrix: new Matrix(this.matrix.a, this.matrix.b, this.matrix.c, this.matrix.d, this.matrix.e, this.matrix.f),
            currentPoint: { ...this.currentPoint },
            lineWidth: this.lineWidth,
            strokeColor: [...this.strokeColor]
        });
        this.currentPoint = { x: 0, y: 0 };
        
        this._log('save() completed', {
            newCurrentPoint: this.currentPoint,
            stackSize: this.stack.length
        });
    }

    restore() {
        this._log('restore() called', {
            stackSize: this.stack.length,
            currentPoint: this.currentPoint
        });
        
        const state = this.stack.pop();
        if (state) {
            this.matrix = state.matrix;
            this.currentPoint = state.currentPoint;
            this.lineWidth = state.lineWidth;
            this.strokeColor = state.strokeColor;
            
            this._log('restore() completed', {
                restoredPoint: this.currentPoint,
                matrix: this.matrix
            });
        }
    }

    translate(x, y) {
        this._log('translate() called', { x, y, currentPoint: this.currentPoint });
        this.matrix = this.matrix.translate(x, y);
        this.currentPoint = { x: 0, y: 0 };
        this._log('translate() completed', { matrix: this.matrix, currentPoint: this.currentPoint });
    }

    rotate(angle) {
        this._log('rotate() called', { angle, currentPoint: this.currentPoint });
        this.matrix = this.matrix.rotate(angle);
        this._log('rotate() completed', { matrix: this.matrix });
    }

    scale(sx, sy) {
        this._log('scale() called', { sx, sy, currentPoint: this.currentPoint });
        this.matrix = this.matrix.scale(sx, sy);
        this._log('scale() completed', { matrix: this.matrix });
    }

    // Helper to get global coordinates from local (x, y)
    _toGlobal(x, y) {
        const result = this.matrix.apply(x, y);
        this._log('_toGlobal()', { local: { x, y }, global: result, matrix: this.matrix });
        return result;
    }

    move_to(x, y) {
        this._log('move_to() called', { x, y, currentPoint: this.currentPoint });
        this.currentPoint = { x, y };
        const p = this._toGlobal(x, y);
        // Only add move command if path is empty or we're moving to a different point
        if (this.currentPath.length === 0) {
            this.currentPath.push(`M ${p.x.toFixed(4)} ${p.y.toFixed(4)}`);
        } else {
            // Replace the last move command if we're moving to a different point
            const lastCommand = this.currentPath[this.currentPath.length - 1];
            if (lastCommand.startsWith('M')) {
                this.currentPath[this.currentPath.length - 1] = `M ${p.x.toFixed(4)} ${p.y.toFixed(4)}`;
            } else {
                this.currentPath.push(`M ${p.x.toFixed(4)} ${p.y.toFixed(4)}`);
            }
        }
        this._log('move_to() completed', {
            newCurrentPoint: this.currentPoint,
            globalPoint: p,
            pathLength: this.currentPath.length
        });
    }

    // Helper method to add move command before drawing (like Python's _add_move)
    _add_move() {
        if (this.currentPath.length === 0) {
            const p = this._toGlobal(this.currentPoint.x, this.currentPoint.y);
            this.currentPath.push(`M ${p.x.toFixed(4)} ${p.y.toFixed(4)}`);
        }
    }

    line_to(x, y) {
        this._log('line_to() called', { x, y, currentPoint: this.currentPoint });
        
        // Only add move if path is empty
        if (this.currentPath.length === 0) {
            this._add_move();
        }
        
        // Skip zero-length lines
        if (this.currentPoint.x === x && this.currentPoint.y === y) {
            this._log('line_to() skipping zero-length line');
            return;
        }
        
        const p = this._toGlobal(x, y);
        this.currentPath.push(`L ${p.x.toFixed(4)} ${p.y.toFixed(4)}`);
        this.currentPoint = { x, y };
        this._log('line_to() completed', {
            newCurrentPoint: this.currentPoint,
            globalPoint: p,
            pathLength: this.currentPath.length
        });
    }

    curve_to(x1, y1, x2, y2, x3, y3) {
        // Only add move if path is empty
        if (this.currentPath.length === 0) {
            this._add_move();
        }
        
        // Skip degenerate curves where all points are the same
        if (this.currentPoint.x === x1 && this.currentPoint.y === y1 &&
            x1 === x2 && y1 === y2 && x2 === x3 && y2 === y3) {
            this._log('curve_to() skipping degenerate curve');
            return;
        }
        
        const p1 = this._toGlobal(x1, y1);
        const p2 = this._toGlobal(x2, y2);
        const p3 = this._toGlobal(x3, y3);
        this.currentPath.push(`C ${p1.x.toFixed(4)} ${p1.y.toFixed(4)} ${p2.x.toFixed(4)} ${p2.y.toFixed(4)} ${p3.x.toFixed(4)} ${p3.y.toFixed(4)}`);
        this.currentPoint = { x: x3, y: y3 };
    }

    stroke() {
        this._log('stroke() called', {
            pathLength: this.currentPath.length,
            currentPath: this.currentPath.join(' '),
            currentPoint: this.currentPoint
        });
        
        if (this.currentPath.length > 0) {
            this.paths.push({
                d: this.currentPath.join(' '),
                stroke: `rgb(${this.strokeColor[0]*255},${this.strokeColor[1]*255},${this.strokeColor[2]*255})`,
                strokeWidth: this.lineWidth
            });
            this.currentPath = [];
        }
        this.currentPoint = { x: 0, y: 0 };
        
        this._log('stroke() completed', {
            pathsCount: this.paths.length,
            newCurrentPoint: this.currentPoint
        });
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
        // Use 4 cubic bezier segments for a full circle (like Python's implementation)
        const segments = 4;
        const angleStep = (2 * Math.PI) / segments;
        
        for (let i = 0; i < segments; i++) {
            const startAngle = i * angleStep;
            const endAngle = (i + 1) * angleStep;
            
            // Calculate start and end points for this segment
            const x1 = radius * Math.cos(startAngle) + xc;
            const y1 = radius * Math.sin(startAngle) + yc;
            const x4 = radius * Math.cos(endAngle) + xc;
            const y4 = radius * Math.sin(endAngle) + yc;
            
            // Calculate control points for this segment
            const ax = x1 - xc;
            const ay = y1 - yc;
            const bx = x4 - xc;
            const by = y4 - yc;
            const q1 = ax * ax + ay * ay;
            const q2 = q1 + ax * bx + ay * by;
            
            const denominator = (ax * by - ay * bx);
            const k2 = (4/3) * (Math.sqrt(2 * q1 * q2) - q2) / denominator;
            
            const x2 = xc + ax - k2 * ay;
            const y2 = yc + ay + k2 * ax;
            const x3 = xc + bx + k2 * by;
            const y3 = yc + by - k2 * bx;
            
            // Transform control points and end point
            const mp2 = this._toGlobal(x2, y2);
            const mp3 = this._toGlobal(x3, y3);
            const mp4 = this._toGlobal(x4, y4);

            this.currentPath.push(`C ${mp2.x.toFixed(4)} ${mp2.y.toFixed(4)} ${mp3.x.toFixed(4)} ${mp3.y.toFixed(4)} ${mp4.x.toFixed(4)} ${mp4.y.toFixed(4)}`);
        }
        
        this.currentPoint = { x: xc + radius, y: yc };
    }

    arc_negative(xc, yc, radius, angle1, angle2) {
        this._arc(xc, yc, radius, angle1, angle2, -1);
    }

    _arc(xc, yc, radius, angle1, angle2, direction) {
        // Approximate arc with cubic beziers.
        this._log('_arc() called', {
            xc, yc, radius, angle1, angle2, direction,
            currentPoint: this.currentPoint
        });

        if (Math.abs(angle1 - angle2) < 1e-4 || Math.abs(radius) < 1e-4) {
            this._log('_arc() early return', { angleDiff: Math.abs(angle1 - angle2), radius });
            return;
        }

        // Handle full circles and near-full circles with multiple curve segments
        let angleDiff = Math.abs(angle2 - angle1);
        if (angleDiff > Math.PI * 1.9) {
            this._log('_arc() using full circle approach with curves', { angleDiff });
            
            // For full circles, use 4 cubic bezier segments (like Python's implementation)
            const segments = 4;
            const actualAngleDiff = direction * (angle2 - angle1);
            const angleStep = actualAngleDiff / segments;
            
            for (let i = 0; i < segments; i++) {
                const startAngle = angle1 + i * angleStep;
                const endAngle = angle1 + (i + 1) * angleStep;
                
                // Calculate start and end points for this segment
                const x1 = radius * Math.cos(startAngle) + xc;
                const y1 = radius * Math.sin(startAngle) + yc;
                const x4 = radius * Math.cos(endAngle) + xc;
                const y4 = radius * Math.sin(endAngle) + yc;
                
                // Calculate control points for this segment
                const ax = x1 - xc;
                const ay = y1 - yc;
                const bx = x4 - xc;
                const by = y4 - yc;
                const q1 = ax * ax + ay * ay;
                const q2 = q1 + ax * bx + ay * by;
                
                const denominator = (ax * by - ay * bx) * direction;
                const k2 = (4/3) * (Math.sqrt(2 * q1 * q2) - q2) / denominator;
                
                const x2 = xc + ax - k2 * ay;
                const y2 = yc + ay + k2 * ax;
                const x3 = xc + bx + k2 * by;
                const y3 = yc + by - k2 * bx;
                
                // Ensure we have a move command for the first segment
                if (i === 0 && this.currentPath.length === 0) {
                    this._add_move();
                }
                
                // Transform control points and end point
                const mp2 = this._toGlobal(x2, y2);
                const mp3 = this._toGlobal(x3, y3);
                const mp4 = this._toGlobal(x4, y4);

                this.currentPath.push(`C ${mp2.x.toFixed(4)} ${mp2.y.toFixed(4)} ${mp3.x.toFixed(4)} ${mp3.y.toFixed(4)} ${mp4.x.toFixed(4)} ${mp4.y.toFixed(4)}`);
            }
            
            this.currentPoint = {
                x: radius * Math.cos(angle2) + xc,
                y: radius * Math.sin(angle2) + yc
            };
            return;
        }

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
        
        // Avoid division by zero for regular arcs
        let denominator = (ax * by - ay * bx) * direction;
        if (Math.abs(denominator) < 1e-10) {
            // Fall back to line approximation
            this._log('_arc() falling back to line approximation', { denominator });
            if (this.currentPath.length === 0) {
                this._add_move();
            }
            const p4 = this._toGlobal(x4, y4);
            this.currentPath.push(`L ${p4.x.toFixed(4)} ${p4.y.toFixed(4)}`);
            this.currentPoint = { x: x4, y: y4 };
            return;
        }
        
        let k2 = (4/3) * (Math.sqrt(2 * q1 * q2) - q2) / denominator;

        let x2 = xc + ax - k2 * ay;
        let y2 = yc + ay + k2 * ax;
        let x3 = xc + bx + k2 * by;
        let y3 = yc + by - k2 * bx;

        // Ensure we have a move command to the start of the arc
        if (this.currentPath.length === 0) {
            this._add_move();
        }
        
        // Transform control points and end point
        const mp2 = this._toGlobal(x2, y2);
        const mp3 = this._toGlobal(x3, y3);
        const mp4 = this._toGlobal(x4, y4);

        this.currentPath.push(`C ${mp2.x.toFixed(4)} ${mp2.y.toFixed(4)} ${mp3.x.toFixed(4)} ${mp3.y.toFixed(4)} ${mp4.x.toFixed(4)} ${mp4.y.toFixed(4)}`);

        this.currentPoint = { x: x4, y: y4 };
        
        this._log('_arc() completed', {
            newCurrentPoint: this.currentPoint,
            pathLength: this.currentPath.length
        });
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
