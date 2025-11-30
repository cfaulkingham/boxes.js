
import fs from 'fs';
import { Console2 } from '../boxes/generators/console2.js';

try {
    const box = new Console2();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/console2.svg', svg);
    console.log('Successfully generated SVG for Console2!');
} catch (e) {
    console.error('Error generating box Console2:', e);
}
