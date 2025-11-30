
import fs from 'fs';
import { SlidingDrawer } from '../boxes/generators/slidingdrawer.js';

try {
    const box = new SlidingDrawer();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/slidingdrawer.svg', svg);
    console.log('Successfully generated SVG for SlidingDrawer!');
} catch (e) {
    console.error('Error generating box SlidingDrawer:', e);
}
