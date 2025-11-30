import fs from 'fs';
import { ABox } from './boxes/generators/abox.js';


try {
    // 1. Instantiate
    const box = new ABox();

    // 2. Configure (pass arguments here as an object)
    // Example: { x: 100, y: 100, h: 100, outside: true }
    box.parseArgs({}); 

    // 3. Render
    box.open();
    box.render();
    const svg = box.close();

    // 4. Save
    fs.writeFileSync('abox.svg', svg);
    console.log('Successfully generated SVG!');
} catch (e) {
    console.error('Error generating box:', e);
}



