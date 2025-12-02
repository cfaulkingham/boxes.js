import { Matrix  } from './matrix.js';

class SVGContext {
    constructor() {
        this.paths = [];
        this.currentPath = [];
        this.matrix = new Matrix();
        this.stack = [];
        this.lineWidth = 0.1;
        this.strokeColor = [0, 0, 0];
        // Track both local (_xy) and transformed (_mxy) current points like Python
        this._xy = { x: 0, y: 0 };
        this._mxy = { x: 0, y: 0 };
        
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
            _xy: this._xy,
            _mxy: this._mxy,
            matrix: this.matrix,
            stackSize: this.stack.length
        });
        
        this.stack.push({
            matrix: new Matrix(this.matrix.a, this.matrix.b, this.matrix.c, this.matrix.d, this.matrix.e, this.matrix.f),
            _xy: { ...this._xy },
            _mxy: { ...this._mxy },
            lineWidth: this.lineWidth,
            strokeColor: [...this.strokeColor]
        });
        // Reset local position after save
        this._xy = { x: 0, y: 0 };
        
        this._log('save() completed', {
            new_xy: this._xy,
            stackSize: this.stack.length
        });
    }

    restore() {
        this._log('restore() called', {
            stackSize: this.stack.length,
            _xy: this._xy
        });
        
        const state = this.stack.pop();
        if (state) {
            this.matrix = state.matrix;
            this._xy = state._xy;
            this._mxy = state._mxy;
            this.lineWidth = state.lineWidth;
            this.strokeColor = state.strokeColor;
            
            this._log('restore() completed', {
                restored_xy: this._xy,
                restored_mxy: this._mxy,
                matrix: this.matrix
            });
        }
    }

    translate(x, y) {
        this._log('translate() called', { x, y, _xy: this._xy });
        this.matrix = this.matrix.translate(x, y);
        this._xy = { x: 0, y: 0 };
        // Update _mxy to match the new local origin in global coordinates
        this._mxy = this._toGlobal(0, 0);
        this._log('translate() completed', { matrix: this.matrix, _xy: this._xy, _mxy: this._mxy });
    }

    rotate(angle) {
        this._log('rotate() called', { angle, _xy: this._xy });
        this.matrix = this.matrix.rotate(angle);
        this._log('rotate() completed', { matrix: this.matrix });
    }

    scale(sx, sy) {
        this._log('scale() called', { sx, sy, _xy: this._xy });
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
        this._log('move_to() called', { x, y, _xy: this._xy });
        // Update local coordinates
        this._xy = { x, y };
        // Update transformed coordinates
        this._mxy = this._toGlobal(x, y);
        this._log('move_to() completed', {
            new_xy: this._xy,
            new_mxy: this._mxy
        });
    }

    // Helper method to add move command before drawing (like Python's _add_move and Part.move_to)
    _add_move() {
        const EPS = 1e-4;
        const mx = this._mxy.x;
        const my = this._mxy.y;
        
        if (this.currentPath.length === 0) {
            // Path is empty, add move command
            this.currentPath.push(`M ${mx.toFixed(4)} ${my.toFixed(4)}`);
        } else {
            const lastCommand = this.currentPath[this.currentPath.length - 1];
            if (lastCommand.startsWith('M ')) {
                // Last command is already a move, replace it
                this.currentPath[this.currentPath.length - 1] = `M ${mx.toFixed(4)} ${my.toFixed(4)}`;
            } else {
                // Extract coordinates from last command to check if we need a new move
                // Parse last coordinates from the last command
                const parts = lastCommand.trim().split(/\s+/);
                let lastX, lastY;
                
                if (lastCommand.startsWith('L ')) {
                    lastX = parseFloat(parts[1]);
                    lastY = parseFloat(parts[2]);
                } else if (lastCommand.startsWith('C ')) {
                    // Curve: C x1 y1 x2 y2 x3 y3 - last point is x3, y3
                    lastX = parseFloat(parts[5]);
                    lastY = parseFloat(parts[6]);
                } else {
                    // For other commands, just add move to be safe
                    this.currentPath.push(`M ${mx.toFixed(4)} ${my.toFixed(4)}`);
                    return;
                }
                
                // Only add move if we're moving to a different position
                if (Math.abs(lastX - mx) > EPS || Math.abs(lastY - my) > EPS) {
                    this.currentPath.push(`M ${mx.toFixed(4)} ${my.toFixed(4)}`);
                }
            }
        }
    }

    line_to(x, y) {
        this._log('line_to() called', { x, y, _xy: this._xy });
        
        // Add move command if path is empty (Python's _line_to does this)
        this._add_move();
        
        const x1 = this._mxy.x;
        const y1 = this._mxy.y;
        
        // Update local coordinates
        this._xy = { x, y };
        // Update transformed coordinates  
        this._mxy = this._toGlobal(x, y);
        
        const x2 = this._mxy.x;
        const y2 = this._mxy.y;
        
        // Skip zero-length lines (using epsilon comparison like Python)
        const EPS = 1e-4;
        if (Math.abs(x1 - x2) < EPS && Math.abs(y1 - y2) < EPS) {
            this._log('line_to() skipping zero-length line');
            return;
        }
        
        this.currentPath.push(`L ${x2.toFixed(4)} ${y2.toFixed(4)}`);
        this._log('line_to() completed', {
            new_xy: this._xy,
            new_mxy: this._mxy,
            pathLength: this.currentPath.length
        });
    }

    curve_to(x1, y1, x2, y2, x3, y3) {
        // Add move command if path is empty
        this._add_move();
        
        // Transform all control points and destination
        const mx1 = this._toGlobal(x1, y1);
        const mx2 = this._toGlobal(x2, y2);
        const mx3 = this._toGlobal(x3, y3);
        
        // SVG curve format: C x1 y1, x2 y2, x3 y3 (control1, control2, destination)
        this.currentPath.push(`C ${mx1.x.toFixed(4)} ${mx1.y.toFixed(4)} ${mx2.x.toFixed(4)} ${mx2.y.toFixed(4)} ${mx3.x.toFixed(4)} ${mx3.y.toFixed(4)}`);
        
        // Update current position
        this._xy = { x: x3, y: y3 };
        this._mxy = mx3;
    }

    stroke() {
        this._log('stroke() called', {
            pathLength: this.currentPath.length,
            currentPath: this.currentPath.join(' '),
            _xy: this._xy
        });
        
        if (this.currentPath.length > 0) {
            this.paths.push({
                d: this.currentPath.join(' '),
                stroke: `rgb(${this.strokeColor[0]*255},${this.strokeColor[1]*255},${this.strokeColor[2]*255})`,
                strokeWidth: this.lineWidth
            });
            this.currentPath = [];
        }
        // Reset local position (like Python does)
        this._xy = { x: 0, y: 0 };
        
        this._log('stroke() completed', {
            pathsCount: this.paths.length,
            new_xy: this._xy
        });
    }

    set_line_width(w) {
        this.lineWidth = w;
    }

    set_source_rgb(r, g, b) {
        this.strokeColor = [r, g, b];
    }

    get_current_point() {
        return [this._xy.x, this._xy.y];
    }

    arc(xc, yc, radius, angle1, angle2) {
        this._arc(xc, yc, radius, angle1, angle2, 1, false);
    }
    
    // Helper method for drawing full circles using multiple arc segments
    circle(xc, yc, radius) {
        // Position at the start of the circle (rightmost point)
        this.move_to(xc + radius, yc);
        
        // Draw circle as 4 arc segments (90 degrees each)
        const segments = 4;
        const angleStep = (2 * Math.PI) / segments;
        
        for (let i = 0; i < segments; i++) {
            const startAngle = i * angleStep;
            const endAngle = (i + 1) * angleStep;
            // Skip move command for all but the first segment to create a continuous circle
            const skipMove = (i > 0);
            this._arc(xc, yc, radius, startAngle, endAngle, 1, skipMove);
        }
    }
    
    // Full circle drawing (for compatibility with boxes_base.js)
    arc_full(xc, yc, radius) {
        this.circle(xc, yc, radius);
    }

    arc_negative(xc, yc, radius, angle1, angle2) {
        this._arc(xc, yc, radius, angle1, angle2, -1, false);
    }

    _arc(xc, yc, radius, angle1, angle2, direction, skipMove = false) {
        // Approximate arc with cubic bezier (matching Python implementation)
        const EPS = 1e-4;
        
        this._log('_arc() called', {
            xc, yc, radius, angle1, angle2, direction, skipMove,
            _xy: this._xy
        });

        if (Math.abs(angle1 - angle2) < EPS || radius < EPS) {
            this._log('_arc() early return', { angleDiff: Math.abs(angle1 - angle2), radius });
            return;
        }

        // Calculate start and end points in local coordinates
        const x1 = radius * Math.cos(angle1) + xc;
        const y1 = radius * Math.sin(angle1) + yc;
        const x4 = radius * Math.cos(angle2) + xc;
        const y4 = radius * Math.sin(angle2) + yc;

        // Calculate control points (Python algorithm)
        const ax = x1 - xc;
        const ay = y1 - yc;
        const bx = x4 - xc;
        const by = y4 - yc;
        const q1 = ax * ax + ay * ay;
        const q2 = q1 + ax * bx + ay * by;
        const k2 = 4/3 * (Math.sqrt(2 * q1 * q2) - q2) / (ax * by - ay * bx);

        const x2 = xc + ax - k2 * ay;
        const y2 = yc + ay + k2 * ax;
        const x3 = xc + bx + k2 * by;
        const y3 = yc + by - k2 * bx;

        // Transform to global coordinates
        const mx1 = this._toGlobal(x1, y1);
        const mx2 = this._toGlobal(x2, y2);
        const mx3 = this._toGlobal(x3, y3);
        const mx4 = this._toGlobal(x4, y4);

        // Add move command before drawing (only if not skipped for continuous paths)
        if (!skipMove) {
            this._add_move();
        }
        
        // Add cubic bezier curve
        this.currentPath.push(`C ${mx2.x.toFixed(4)} ${mx2.y.toFixed(4)} ${mx3.x.toFixed(4)} ${mx3.y.toFixed(4)} ${mx4.x.toFixed(4)} ${mx4.y.toFixed(4)}`);
        
        // Update current position to end of arc
        this._xy = { x: x4, y: y4 };
        this._mxy = mx4;
        
        this._log('_arc() completed', {
            new_xy: this._xy,
            new_mxy: this._mxy,
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
        // Python's rectangle: stroke any existing path, then draw rectangle
        this.stroke();
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
