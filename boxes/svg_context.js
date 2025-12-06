import { Matrix } from './matrix.js';

/**
 * Class representing an SVG drawing context.
 * Manages drawing state, paths, and SVG generation.
 */
class SVGContext {
    /**
     * Create a new SVGContext.
     */
    constructor() {
        /** @type {Object[]} List of finished paths/shapes */
        this.paths = [];
        /** @type {string[]} Current building path commands */
        this.currentPath = [];
        /** @type {Matrix} Current transformation matrix */
        this.matrix = new Matrix();
        /** @type {Object[]} Stack for save/restore states */
        this.stack = [];
        /** @type {number} Current line width */
        this.lineWidth = 0.1;
        /** @type {number[]} Current stroke color [r, g, b] */
        this.strokeColor = [0, 0, 0];
        // Track both local (_xy) and transformed (_mxy) current points like Python
        this._xy = { x: 0, y: 0 };
        this._mxy = { x: 0, y: 0 };

        // Add debug logging
        this.debug = true;
        this.debugLog = [];
    }

    /**
     * Log a debug message.
     * @private
     * @param {string} message - Message text.
     * @param {Object} [data=null] - Optional data object.
     */
    _log(message, data = null) {
        if (this.debug) {
            const entry = { message, data, timestamp: Date.now() };
            this.debugLog.push(entry);
            console.log(`SVGContext: ${message}`, data || '');
        }
    }

    /**
     * Save the current drawing state (matrix, cursors, style).
     */
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

    /**
     * Restore the previous drawing state.
     */
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

    /**
     * Translate the coordinate system.
     * @param {number} x - X offset.
     * @param {number} y - Y offset.
     */
    translate(x, y) {
        this._log('translate() called', { x, y, _xy: this._xy });
        this.matrix = this.matrix.translate(x, y);
        this._xy = { x: 0, y: 0 };
        // Update _mxy to match the new local origin in global coordinates
        this._mxy = this._toGlobal(0, 0);
        this._log('translate() completed', { matrix: this.matrix, _xy: this._xy, _mxy: this._mxy });
    }

    /**
     * Rotate the coordinate system.
     * @param {number} angle - Angle in degrees (will be converted to radians for matrix).
     */
    rotate(angle) {
        this._log('rotate() called', { angle, _xy: this._xy });
        this.matrix = this.matrix.rotate(angle);
        this._log('rotate() completed', { matrix: this.matrix });
    }

    /**
     * Scale the coordinate system.
     * @param {number} sx - Scale X.
     * @param {number} sy - Scale Y.
     */
    scale(sx, sy) {
        this._log('scale() called', { sx, sy, _xy: this._xy });
        this.matrix = this.matrix.scale(sx, sy);
        this._log('scale() completed', { matrix: this.matrix });
    }

    /**
     * Helper to get global coordinates from local (x, y).
     * @private
     * @param {number} x - Local X coordinate.
     * @param {number} y - Local Y coordinate.
     * @returns {{x: number, y: number}} Global coordinates.
     */
    _toGlobal(x, y) {
        const result = this.matrix.apply(x, y);
        this._log('_toGlobal()', { local: { x, y }, global: result, matrix: this.matrix });
        return result;
    }

    /**
     * Move the cursor to a new position (without drawing).
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     */
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

    /**
     * Helper method to add a move command to the current path if necessary.
     * This ensures paths start correctly and handles implicit moves.
     * @private
     */
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

    /**
     * Draw a line to the specified coordinates.
     * @param {number} x - Target X.
     * @param {number} y - Target Y.
     */
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

    /**
     * Draw a cubic Bezier curve.
     * @param {number} x1 - Control point 1 X.
     * @param {number} y1 - Control point 1 Y.
     * @param {number} x2 - Control point 2 X.
     * @param {number} y2 - Control point 2 Y.
     * @param {number} x3 - End point X.
     * @param {number} y3 - End point Y.
     */
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

    /**
     * Stroke the current path.
     * Finalizes the current drawing commands into a path object.
     */
    stroke() {
        this._log('stroke() called', {
            pathLength: this.currentPath.length,
            currentPath: this.currentPath.join(' '),
            _xy: this._xy
        });

        if (this.currentPath.length > 0) {
            this.paths.push({
                d: this.currentPath.join(' '),
                stroke: `rgb(${this.strokeColor[0] * 255},${this.strokeColor[1] * 255},${this.strokeColor[2] * 255})`,
                strokeWidth: this.lineWidth
            });
            this.currentPath = [];
        }
        // Reset local position (like Python does)
        this._xy = { x: 0, y: 0 };
        // Update _mxy to match the new local origin in global coordinates
        this._mxy = this._toGlobal(0, 0);

        this._log('stroke() completed', {
            pathsCount: this.paths.length,
            new_xy: this._xy
        });
    }

    /**
     * Set the current line width.
     * @param {number} w - Line width.
     */
    set_line_width(w) {
        this.lineWidth = w;
    }

    /**
     * Set the stroke color.
     * @param {number} r - Red (0-1).
     * @param {number} g - Green (0-1).
     * @param {number} b - Blue (0-1).
     */
    set_source_rgb(r, g, b) {
        this.strokeColor = [r, g, b];
    }

    /**
     * Get the current cursor position.
     * @returns {number[]} [x, y].
     */
    get_current_point() {
        return [this._xy.x, this._xy.y];
    }

    /**
     * Draw an arc.
     * @param {number} xc - Center X.
     * @param {number} yc - Center Y.
     * @param {number} radius - Radius.
     * @param {number} angle1 - Start angle (radians).
     * @param {number} angle2 - End angle (radians).
     */
    arc(xc, yc, radius, angle1, angle2) {
        this._arc(xc, yc, radius, angle1, angle2, 1, false);
    }

    /**
     * Draw a full circle.
     * @param {number} xc - Center X.
     * @param {number} yc - Center Y.
     * @param {number} radius - Radius.
     */
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

    /**
     * Draw a full circle (alias).
     * @param {number} xc - Center X.
     * @param {number} yc - Center Y.
     * @param {number} radius - Radius.
     */
    arc_full(xc, yc, radius) {
        this.circle(xc, yc, radius);
    }

    /**
     * Draw an arc in negative direction.
     * @param {number} xc - Center X.
     * @param {number} yc - Center Y.
     * @param {number} radius - Radius.
     * @param {number} angle1 - Start angle (radians).
     * @param {number} angle2 - End angle (radians).
     */
    arc_negative(xc, yc, radius, angle1, angle2) {
        this._arc(xc, yc, radius, angle1, angle2, -1, false);
    }

    /**
     * Internal helper to draw an arc (approximated with Bezier curves).
     * @private
     * @param {number} xc - Center X.
     * @param {number} yc - Center Y.
     * @param {number} radius - Radius.
     * @param {number} angle1 - Start angle.
     * @param {number} angle2 - End angle.
     * @param {number} direction - Direction (1 or -1).
     * @param {boolean} [skipMove=false] - Whether to skip the initial move command.
     */
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
        const k2 = 4 / 3 * (Math.sqrt(2 * q1 * q2) - q2) / (ax * by - ay * bx);

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

    /**
     * Stub for font setting (not implemented for SVG output).
     * @param {string} style - Font style.
     * @param {boolean} bold - Is bold.
     * @param {boolean} italic - Is italic.
     */
    set_font(style, bold, italic) { } // Stub

    /**
     * Render text.
     * @param {string} text - Text string.
     * @param {number} [fontsize=10] - Font size.
     * @param {string} [halign="left"] - Horizontal alignment.
     * @param {number[]} [color=[0,0,0]] - Color.
     * @param {string} [font="Arial"] - Font family.
     */
    show_text(text, fontsize = 10, halign = "left", color = [0, 0, 0], font = "Arial") {
        // Store text elements to render in SVG
        const pos = this._toGlobal(0, 0);
        if (!this.textElements) {
            this.textElements = [];
        }

        // Map halign to SVG text-anchor
        const anchorMap = {
            "left": "start",
            "middle": "middle",
            "center": "middle",
            "end": "end",
            "right": "end"
        };
        const textAnchor = anchorMap[halign] || "start";

        this.textElements.push({
            text: text,
            x: pos.x,
            y: pos.y,
            fontsize: fontsize,
            color: color,
            font: font,
            anchor: textAnchor
        });
    }

    /**
     * Start a new part (strokes current path).
     */
    new_part() {
        this.stroke();
    }

    /**
     * Helper to escape XML special characters.
     * @private
     * @param {string} text - The text to escape.
     * @returns {string} The escaped text.
     */
    _escapeXml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * Draw a rectangle.
     * @param {number} x - X.
     * @param {number} y - Y.
     * @param {number} w - Width.
     * @param {number} h - Height.
     */
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

    /**
     * Finish drawing and generate SVG.
     * @returns {string} The raw SVG string.
     */
    finish() {
        this.stroke();
        // Generate SVG string
        // Find bounds
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        const parsePath = (d) => {
            const parts = d.split(' ');
            for (let i = 0; i < parts.length; i++) {
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
            for (let i = 0; i < nums.length; i += 2) {
                if (!isNaN(nums[i])) {
                    if (nums[i] < minX) minX = nums[i];
                    if (nums[i] > maxX) maxX = nums[i];
                }
                if (!isNaN(nums[i + 1])) {
                    if (nums[i + 1] < minY) minY = nums[i + 1];
                    if (nums[i + 1] > maxY) maxY = nums[i + 1];
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

        // Add text elements
        if (this.textElements && this.textElements.length > 0) {
            for (const t of this.textElements) {
                const r = Math.round(t.color[0] * 255);
                const g = Math.round(t.color[1] * 255);
                const b = Math.round(t.color[2] * 255);
                const fillColor = `rgb(${r},${g},${b})`;
                svg += `    <text x="${t.x.toFixed(2)}" y="${t.y.toFixed(2)}" font-family="${t.font}" font-size="${t.fontsize}px" fill="${fillColor}" text-anchor="${t.anchor}">${this._escapeXml(t.text)}</text>\n`;
            }
        }

        svg += `  </g>\n</svg>`;
        return svg;
    }
}

export { SVGContext };
