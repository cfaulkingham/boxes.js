
import fs from 'fs';
import { WallStackableBin } from '../boxes/generators/wallstackablebin.js';

try {
    const box = new WallStackableBin();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/wallstackablebin.svg', svg);
    console.log('Successfully generated SVG for WallStackableBin!');
} catch (e) {
    console.error('Error generating box WallStackableBin:', e);
}
