#!/usr/bin/env node
/**
 * Boxes.js Options Showcase
 * 
 * This test file generates a single SVG that demonstrates all available
 * options/features from the boxes.js library (excluding generators).
 * 
 * Run with: node test/options_showcase.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import the main Boxes class and components
import { Boxes } from '../boxes/boxes.js';
import { 
    Settings, 
    FingerJointSettings,
    StackableSettings,
    DoveTailSettings,
    ClickSettings,
    HingeSettings,
    GripSettings,
    Edge, 
    OutSetEdge,
} from '../boxes/edges.js';
import { Parts } from '../boxes/parts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Custom Boxes subclass for the showcase
 */
class OptionsShowcase extends Boxes {
    constructor() {
        super();
        this.labelSize = 4;
    }

    _buildObjects() {
        super._buildObjects();
        // Initialize Parts
        this.parts = new Parts(this);
        
        // Add additional edge types
        this._initAdditionalEdges();
    }
    
    _initAdditionalEdges() {
        // Initialize Stackable edges
        const stackSettings = new StackableSettings(this.thickness, true);
        stackSettings.edgeObjects(this);
        
        // Initialize DoveTail edges
        const doveSettings = new DoveTailSettings(this.thickness, true);
        doveSettings.edgeObjects(this);
        
        // Initialize Click/Snap edges  
        const clickSettings = new ClickSettings(this.thickness, true);
        clickSettings.edgeObjects(this);
        
        // Initialize Hinge edges
        const hingeSettings = new HingeSettings(this.thickness, true);
        hingeSettings.edgeObjects(this);
        
        // Initialize Grip edge
        const gripSettings = new GripSettings(this.thickness, true);
        gripSettings.edgeObjects(this);
    }

    /**
     * Draw a section label
     */
    drawLabel(text, x, y) {
        this.ctx.save();
        this.ctx.set_source_rgb(0.2, 0.2, 0.8);
        this.text(text, x, y + 2, 0, "", this.labelSize);
        this.ctx.restore();
    }

    /**
     * Draw a section title with underline
     */
    drawSectionTitle(title, x, y) {
        this.ctx.save();
        this.ctx.set_source_rgb(0, 0, 0);
        this.text(title, x, y, 0, "", 5);
        // Underline
        this.ctx.move_to(x, y + 2);
        this.ctx.line_to(x + title.length * 2.8, y + 2);
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Section: Basic Edge Types (f, F, e, E, h)
     */
    drawBasicEdges(startX, startY) {
        this.drawSectionTitle("1. BASIC EDGES", startX, startY);
        
        const edges = [
            { char: 'e', name: 'e - Plain' },
            { char: 'E', name: 'E - OutSet' },
            { char: 'f', name: 'f - Finger tabs' },
            { char: 'F', name: 'F - Finger slots' },
            { char: 'h', name: 'h - FingerHole' },
        ];

        let y = startY + 12;
        const edgeLength = 35;
        
        for (const edge of edges) {
            this.drawLabel(edge.name, startX, y);
            this.ctx.save();
            this.moveTo(startX + 55, y + 3);
            if (this.edges[edge.char]) {
                this.edges[edge.char].draw(edgeLength);
            } else {
                this.edge(edgeLength);
            }
            this.ctx.stroke();
            this.ctx.restore();
            y += 10;
        }
    }

    /**
     * Section: Stackable Edges (s, S)
     */
    drawStackableEdges(startX, startY) {
        this.drawSectionTitle("2. STACKABLE EDGES", startX, startY);
        
        const edges = [
            { char: 's', name: 's - Stackable' },
            { char: 'S', name: 'S - Stackable Top' },
        ];

        let y = startY + 12;
        const edgeLength = 35;
        
        for (const edge of edges) {
            this.drawLabel(edge.name, startX, y);
            this.ctx.save();
            this.moveTo(startX + 60, y + 3);
            if (this.edges[edge.char]) {
                this.edges[edge.char].draw(edgeLength);
            } else {
                this.edge(edgeLength);
            }
            this.ctx.stroke();
            this.ctx.restore();
            y += 12;
        }
    }

    /**
     * Section: Click/Snap Edges (c, C)
     */
    drawClickEdges(startX, startY) {
        this.drawSectionTitle("3. CLICK/SNAP EDGES", startX, startY);
        
        const edges = [
            { char: 'c', name: 'c - Click connector' },
            { char: 'C', name: 'C - Click edge' },
        ];

        let y = startY + 12;
        const edgeLength = 35;
        
        for (const edge of edges) {
            this.drawLabel(edge.name, startX, y);
            this.ctx.save();
            this.moveTo(startX + 65, y + 3);
            if (this.edges[edge.char]) {
                this.edges[edge.char].draw(edgeLength);
            } else {
                this.edge(edgeLength);
            }
            this.ctx.stroke();
            this.ctx.restore();
            y += 12;
        }
    }

    /**
     * Section: DoveTail Edges (d, D)
     */
    drawDoveTailEdges(startX, startY) {
        this.drawSectionTitle("4. DOVETAIL EDGES", startX, startY);
        
        const edges = [
            { char: 'd', name: 'd - DoveTail' },
            { char: 'D', name: 'D - DoveTail slots' },
        ];

        let y = startY + 12;
        const edgeLength = 35;
        
        for (const edge of edges) {
            this.drawLabel(edge.name, startX, y);
            this.ctx.save();
            this.moveTo(startX + 65, y + 3);
            if (this.edges[edge.char]) {
                this.edges[edge.char].draw(edgeLength);
            } else {
                this.edge(edgeLength);
            }
            this.ctx.stroke();
            this.ctx.restore();
            y += 12;
        }
    }

    /**
     * Section: Hinge Edges
     */
    drawHingeEdges(startX, startY) {
        this.drawSectionTitle("5. HINGE EDGES", startX, startY);
        
        const edges = [
            { char: 'i', name: 'i - Hinge' },
            { char: 'I', name: 'I - HingePin' },
        ];

        let y = startY + 12;
        const edgeLength = 35;
        
        for (const edge of edges) {
            this.drawLabel(edge.name, startX, y);
            this.ctx.save();
            this.moveTo(startX + 55, y + 3);
            if (this.edges[edge.char]) {
                this.edges[edge.char].draw(edgeLength);
            } else {
                this.edge(edgeLength);
            }
            this.ctx.stroke();
            this.ctx.restore();
            y += 12;
        }
    }

    /**
     * Section: Gripping Edge
     */
    drawGrippingEdge(startX, startY) {
        this.drawSectionTitle("6. GRIPPING EDGE", startX, startY);
        
        let y = startY + 12;
        
        this.drawLabel("g - Gripping", startX, y);
        this.ctx.save();
        this.moveTo(startX + 50, y + 3);
        if (this.edges['g']) {
            this.edges['g'].draw(35);
        } else {
            this.edge(35);
        }
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Section: Hole Types
     */
    drawHoles(startX, startY) {
        this.drawSectionTitle("7. HOLE TYPES", startX, startY);
        
        let x = startX;
        let y = startY + 18;
        const spacing = 40;
        
        // Circle hole
        this.drawLabel("hole(r=5)", x, y - 8);
        this.hole(x + 12, y + 6, 5);
        x += spacing;
        
        // Rectangular hole
        this.drawLabel("rectHole", x, y - 8);
        this.rectangularHole(x + 12, y + 6, 12, 8, 1);
        x += spacing;
        
        // D-hole
        this.drawLabel("dHole", x, y - 8);
        this.dHole(x + 12, y + 6, 5, null, 3);
        x += spacing;
        
        // Second row
        x = startX;
        y += 28;
        
        // Flat hole
        this.drawLabel("flatHole", x, y - 8);
        this.flatHole(x + 12, y + 6, 5, null, 3);
        x += spacing;
        
        // Mounting hole
        this.drawLabel("mounting", x, y - 8);
        this.mountingHole(x + 15, y + 6, 2.5, 5);
        x += spacing;
        
        // Hex hole
        this.drawLabel("hexHole", x, y - 8);
        this.regularPolygonHole(x + 12, y + 6, 4, null, 6);
        x += spacing;
        
        // TX hole (Torx)
        this.drawLabel("TX(20)", x, y - 8);
        this.TX(20, x + 12, y + 6);
    }

    /**
     * Section: Wall Types
     */
    drawWalls(startX, startY) {
        this.drawSectionTitle("8. WALL TYPES", startX, startY);
        
        let x = startX;
        let y = startY + 12;
        
        // Rectangular wall
        this.drawLabel("rectangularWall", x, y);
        this.ctx.save();
        this.moveTo(x + 55, y);
        this.rectangularWall(25, 18, "eeee", { move: "" });
        this.ctx.stroke();
        this.ctx.restore();
        
        // Rounded plate  
        x += 90;
        this.drawLabel("roundedPlate", x, y);
        this.ctx.save();
        this.moveTo(x + 48, y);
        this.roundedPlate(25, 18, 3);
        this.ctx.stroke();
        this.ctx.restore();
        
        // Trapezoid wall
        y += 28;
        x = startX;
        this.drawLabel("trapezoidWall", x, y);
        this.ctx.save();
        this.moveTo(x + 55, y);
        this.trapezoidWall(25, 12, 20, "eeee", { move: "" });
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Section: Parts (disc, knobs)
     */
    drawParts(startX, startY) {
        this.drawSectionTitle("9. PARTS", startX, startY);
        
        let x = startX;
        let y = startY + 20;
        
        // Disc
        this.drawLabel("disc", x, y - 8);
        this.ctx.save();
        this.moveTo(x + 12, y + 10);
        this.parts.disc(18, 2, 1.0, null, "");
        this.ctx.stroke();
        this.ctx.restore();
        x += 40;
        
        // Wavy knob
        this.drawLabel("wavyKnob", x, y - 8);
        this.ctx.save();
        this.moveTo(x + 14, y + 10);
        this.parts.wavyKnob(18, 10, 45, 2, null, "");
        this.ctx.stroke();
        this.ctx.restore();
        x += 45;
        
        // Concave knob
        this.drawLabel("concaveKnob", x, y - 8);
        this.ctx.save();
        this.moveTo(x + 14, y + 10);
        this.parts.concaveKnob(18, 4, 0.2, 70, 2, null, "");
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Section: Grips and Latches
     */
    drawGripsAndLatches(startX, startY) {
        this.drawSectionTitle("10. GRIPS & LATCHES", startX, startY);
        
        let y = startY + 12;
        
        // Grip pattern
        this.drawLabel("grip(25, 2.5)", startX, y);
        this.ctx.save();
        this.moveTo(startX + 50, y + 4);
        this.grip(25, 2.5);
        this.ctx.stroke();
        this.ctx.restore();
        y += 14;
        
        // Latch positive
        this.drawLabel("latch(+)", startX, y);
        this.ctx.save();
        this.moveTo(startX + 50, y + 3);
        this.latch(18, true, false);
        this.ctx.stroke();
        this.ctx.restore();
        y += 14;
        
        // Latch negative
        this.drawLabel("latch(-)", startX, y);
        this.ctx.save();
        this.moveTo(startX + 50, y + 3);
        this.latch(18, false, false);
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Section: Handle
     */
    drawHandle(startX, startY) {
        this.drawSectionTitle("11. HANDLE", startX, startY);
        
        let y = startY + 12;
        
        this.drawLabel("handle(35, 12, 8)", startX, y);
        this.ctx.save();
        this.moveTo(startX + 65, y + 4);
        this.handle(35, 12, 8, 4);
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Section: Finger Joints Detail
     */
    drawFingerJoints(startX, startY) {
        this.drawSectionTitle("12. FINGER JOINT DETAILS", startX, startY);
        
        let y = startY + 12;
        
        // Finger joint tabs
        this.drawLabel("finger tabs", startX, y);
        this.ctx.save();
        this.moveTo(startX + 45, y + 3);
        if (this.edges['f']) {
            this.edges['f'].draw(40);
        }
        this.ctx.stroke();
        this.ctx.restore();
        y += 12;
        
        // Finger joint slots
        this.drawLabel("finger slots", startX, y);
        this.ctx.save();
        this.moveTo(startX + 45, y + 3);
        if (this.edges['F']) {
            this.edges['F'].draw(40);
        }
        this.ctx.stroke();
        this.ctx.restore();
        y += 12;
        
        // Finger holes pattern
        this.drawLabel("fingerHolesAt", startX, y);
        this.ctx.save();
        if (this.fingerHolesAt) {
            this.fingerHolesAt(startX + 65, y + 3, 35, 0);
        }
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Section: Regular Polygons
     */
    drawPolygons(startX, startY) {
        this.drawSectionTitle("13. POLYGONS", startX, startY);
        
        let x = startX;
        let y = startY + 20;
        const r = 7;
        const spacing = 28;
        
        for (const n of [3, 4, 5, 6, 8]) {
            this.drawLabel(`${n}`, x + 4, y - 10);
            this.ctx.save();
            this.regularPolygonAt(x + 10, y + 5, n, 0, r);
            this.ctx.stroke();
            this.ctx.restore();
            x += spacing;
        }
    }

    /**
     * Section: Circles
     */
    drawCircles(startX, startY) {
        this.drawSectionTitle("14. CIRCLES", startX, startY);
        
        let x = startX;
        let y = startY + 20;
        
        // Simple circles
        this.drawLabel("r=7", x, y - 10);
        this.circle(x + 12, y + 5, 7);
        x += 35;
        
        this.drawLabel("r=5", x, y - 10);
        this.circle(x + 10, y + 5, 5);
        x += 30;
        
        // Concentric circles
        this.drawLabel("concentric", x, y - 10);
        this.circle(x + 15, y + 5, 9);
        this.circle(x + 15, y + 5, 6);
        this.circle(x + 15, y + 5, 3);
    }

    /**
     * Section: NEMA Motor Mounts
     */
    drawNEMA(startX, startY) {
        this.drawSectionTitle("15. NEMA MOUNTS", startX, startY);
        
        let x = startX;
        let y = startY + 25;
        
        // NEMA 17
        this.drawLabel("NEMA(17)", x, y - 12);
        this.ctx.save();
        this.NEMA(17, x + 22, y + 12, 0, 4);
        this.ctx.stroke();
        this.ctx.restore();
        x += 60;
        
        // NEMA 23
        this.drawLabel("NEMA(23)", x, y - 12);
        this.ctx.save();
        this.NEMA(23, x + 28, y + 16, 0, 4);
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Section: Drawing Primitives (moved to end - no long curveTo)
     */
    drawPrimitives(startX, startY) {
        this.drawSectionTitle("16. DRAWING PRIMITIVES", startX, startY);
        
        let y = startY + 12;
        
        // edge() - simple straight line
        this.drawLabel("edge(25)", startX, y);
        this.ctx.save();
        this.moveTo(startX + 40, y + 3);
        this.edge(25);
        this.ctx.stroke();
        this.ctx.restore();
        y += 10;
        
        // corner() - 90 degree turn
        this.drawLabel("corner(90)", startX, y);
        this.ctx.save();
        this.moveTo(startX + 40, y + 3);
        this.edge(8);
        this.corner(90);
        this.edge(8);
        this.ctx.stroke();
        this.ctx.restore();
        y += 12;
        
        // corner() - with radius
        this.drawLabel("corner(90, r=4)", startX, y);
        this.ctx.save();
        this.moveTo(startX + 55, y + 3);
        this.edge(8);
        this.corner(90, 4);
        this.edge(8);
        this.ctx.stroke();
        this.ctx.restore();
        y += 14;
        
        // step() - outward step
        this.drawLabel("step(2.5)", startX, y);
        this.ctx.save();
        this.moveTo(startX + 40, y + 3);
        this.edge(8);
        this.step(2.5);
        this.edge(8);
        this.ctx.stroke();
        this.ctx.restore();
        y += 10;
        
        // polyline
        this.drawLabel("polyline(8,90,8,90,8)", startX, y);
        this.ctx.save();
        this.moveTo(startX + 72, y + 3);
        this.polyline(8, 90, 8, 90, 8);
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Main render function
     */
    render() {
        // Title
        this.text("BOXES.JS OPTIONS SHOWCASE", 120, 8, 0, "", 8);
        this.text("All available options (excluding generators)", 100, 18, 0, "", 4);
        
        // Layout sections in a 3-column grid
        const col1X = 10;
        const col2X = 115;
        const col3X = 225;
        const rowHeight = 90;
        let row = 0;
        
        // Column 1
        row = 0;
        this.drawBasicEdges(col1X, 30 + row * rowHeight);
        row++;
        this.drawStackableEdges(col1X, 30 + row * rowHeight);
        row++;
        this.drawClickEdges(col1X, 30 + row * rowHeight);
        row++;
        this.drawDoveTailEdges(col1X, 30 + row * rowHeight);
        row++;
        this.drawHingeEdges(col1X, 30 + row * rowHeight);
        row++;
        this.drawGrippingEdge(col1X, 30 + row * rowHeight);
        
        // Column 2
        row = 0;
        this.drawHoles(col2X, 30 + row * rowHeight);
        row++;
        this.drawWalls(col2X, 30 + row * rowHeight);
        row++;
        this.drawParts(col2X, 30 + row * rowHeight);
        row++;
        this.drawGripsAndLatches(col2X, 30 + row * rowHeight);
        row++;
        this.drawHandle(col2X, 30 + row * rowHeight);
        row++;
        this.drawFingerJoints(col2X, 30 + row * rowHeight);
        
        // Column 3
        row = 0;
        this.drawPolygons(col3X, 30 + row * rowHeight);
        row++;
        this.drawCircles(col3X, 30 + row * rowHeight);
        row++;
        this.drawNEMA(col3X, 30 + row * rowHeight);
        row++;
        this.drawPrimitives(col3X, 30 + row * rowHeight);
        
        // Footer with info
        this.text("Generated by boxes.js | thickness: " + this.thickness + "mm | burn: " + this.burn + "mm", 100, 460, 0, "", 3);
    }
}

// Main execution
async function main() {
    console.log("Generating Boxes.js Options Showcase...");
    
    const showcase = new OptionsShowcase();
    showcase.parseArgs({ thickness: 3.0 });
    showcase.open();
    showcase.render();
    const svg = showcase.close();
    
    // Output path
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'options_showcase.svg');
    fs.writeFileSync(outputPath, svg);
    
    console.log(`✓ Generated: ${outputPath}`);
    console.log(`  SVG size: ${svg.length} bytes`);
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
