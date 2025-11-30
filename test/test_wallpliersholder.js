
import fs from 'fs';
import { WallPliersHolder } from '../boxes/generators/wallpliersholder.js';

try {
    const box = new WallPliersHolder();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/wallpliersholder.svg', svg);
    console.log('Successfully generated SVG for WallPliersHolder!');
} catch (e) {
    console.error('Error generating box WallPliersHolder:', e);
}
