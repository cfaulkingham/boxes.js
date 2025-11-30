
import fs from 'fs';
import { WallConsole } from '../boxes/generators/wallconsole.js';

try {
    const box = new WallConsole();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/wallconsole.svg', svg);
    console.log('Successfully generated SVG for WallConsole!');
} catch (e) {
    console.error('Error generating box WallConsole:', e);
}
