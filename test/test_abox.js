
import fs from 'fs';
import { ABox } from '../boxes/generators/abox.js';

try {
    const box = new ABox();
    box.parseArgs({});
    box.open();
    
    // Debug lidSettings structure
    console.log("=== LidSettings Debug ===");
    console.log("box.lidSettings:", box.lidSettings);
    console.log("box.lidSettings.values:", box.lidSettings.values);
    console.log("box.lidSettings.get method:", typeof box.lidSettings.get);
    
    // Set lid style to something other than "none" to generate a lid
    // The values are stored in the values object, not directly as properties
    box.lidSettings.values.style = "chest";
    console.log("After setting style to 'chest':");
    console.log("lidSettings.values.style:", box.lidSettings.values.style);
    console.log("lidSettings.get('style'):", box.lidSettings.get('style'));
    console.log("box.lid:", typeof box.lid);
    console.log("box.rectangularWall:", typeof box.rectangularWall);
    
    // Override lid method to add debug
    const originalLid = box.lid;
    box.lid = function(x, y, edge) {
        console.log("\n=== Lid Method Called ===");
        console.log("lid() called with x:", x, "y:", y, "edge:", edge);
        console.log("this.rectangularWall:", typeof this.rectangularWall);
        console.log("lidSettings.values.style:", this.lidSettings.values.style);
        console.log("lidSettings.get('style'):", this.lidSettings.get('style'));
        
        // Call the original lid method with more debugging
        try {
            const result = originalLid.call(this, x, y, edge);
            console.log("lid() returned:", result);
            return result;
        } catch (e) {
            console.error("Error in lid() call:", e);
            throw e;
        }
    };
    
    // Also override some key methods for debugging
    const originalRectangularWall = box.rectangularWall.bind(box);
    box.rectangularWall = function(x, y, edges, options) {
        console.log(`\n=== rectangularWall Called ===`);
        console.log(`rectangularWall(${x}, ${y}, ${edges}, ${JSON.stringify(options || {})})`);
        const result = originalRectangularWall(x, y, edges, options);
        return result;
    };
    
    console.log("\n=== Starting Box Render ===");
    console.log("box lid type:", typeof box.lid);
    // Removed direct lid() call - it's called inside render()
    // console.log("Calling box.lid directly with debug...");
    // box.lid(50, 50);
    console.log("=== Box Render ===");
    box.render();
    console.log("\n=== Box Render Complete ===");
    
    const svg = box.close();
    fs.writeFileSync('abox.svg', svg);
    console.log('\nSuccessfully generated SVG for ABox!');
} catch (e) {
    console.error('Error generating box ABox:', e);
    console.error(e.stack);
}
