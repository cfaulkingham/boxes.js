
import fs from 'fs';
import { WallWrenchHolder } from '../boxes/generators/wallwrenchholder.js';

try {
    const box = new WallWrenchHolder();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/wallwrenchholder.svg', svg);
    console.log('Successfully generated SVG for WallWrenchHolder!');
} catch (e) {
    console.error('Error generating box WallWrenchHolder:', e);
}
