
import fs from 'fs';
import { ABox } from '../boxes/generators/abox.js';

try {
    const box = new ABox();
    box.parseArgs({});
    box.open();
    // Set lid style to something other than "none" to generate a lid
    // The values are stored in the values object, not directly as properties
    box.lidSettings.values.style = "flat";
    console.log("Lid style:", box.lidSettings.get('style'));
    console.log("box.lid:", typeof box.lid);
    console.log("box.rectangularWall:", typeof box.rectangularWall);
    
    // Override lid method to add debug
    const originalLid = box.lid;
    box.lid = function(x, y, edge) {
        console.log("lid() called with x:", x, "y:", y, "edge:", edge);
        console.log("this.rectangularWall:", typeof this.rectangularWall);
        console.log("lidSettings.style:", this.lidSettings.get('style'));
        const result = originalLid.call(this, x, y, edge);
        console.log("lid() returned:", result);
        return result;
    };
    
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/abox.svg', svg);
    console.log('Successfully generated SVG for ABox!');
} catch (e) {
    console.error('Error generating box ABox:', e);
    console.error(e.stack);
}
