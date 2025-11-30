
import fs from 'fs';
import { LaserClamp } from '../boxes/generators/laserclamp.js';

try {
    const box = new LaserClamp();
    box.parseArgs({});
    box.open();
    box.render();
    const svg = box.close();
    fs.writeFileSync('test/laserclamp.svg', svg);
    console.log('Successfully generated SVG for LaserClamp!');
} catch (e) {
    console.error('Error generating box LaserClamp:', e);
}
